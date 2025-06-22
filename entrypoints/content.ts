// YouTube Transcript Service (included directly in content script)
class YouTubeTranscriptService {
  async extractTranscript() {
    try {
      // Check if we're on a YouTube video page
      if (!this.isYouTubeVideoPage()) {
        throw new Error("Not on a YouTube video page");
      }

      // Follow the exact sequence from the working script
      await this.clickMoreButton();
      await this.clickShowTranscript();
      const transcript = await this.extractTranscriptText();

      return {
        success: true,
        transcript,
        videoTitle: this.getVideoTitle(),
        videoUrl: window.location.href,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        videoTitle: this.getVideoTitle(),
        videoUrl: window.location.href,
      };
    }
  }

  isYouTubeVideoPage(): boolean {
    return (
      window.location.hostname === "www.youtube.com" &&
      window.location.pathname === "/watch"
    );
  }

  async clickMoreButton(): Promise<void> {
    // Click element with text "...more" if it exists (from original script)
    const moreElement = Array.from(document.querySelectorAll("*")).find(
      (el) => el.textContent?.trim() === "...more" && el instanceof HTMLElement
    );

    if (moreElement) {
      (moreElement as HTMLElement).click();
      console.log('Clicked "...more"');
    } else {
      console.warn('"...more" not found');
    }

    // Wait 3 seconds as in original script
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  async clickShowTranscript(): Promise<void> {
    // Click element with aria-label="Show transcript" (from original script)
    const transcriptElement = document.querySelector(
      '[aria-label="Show transcript"]'
    );

    if (transcriptElement) {
      (transcriptElement as HTMLElement).click();
      console.log('Clicked "Show transcript"');
    } else {
      throw new Error('"Show transcript" not found');
    }

    // Wait 1 second as in original script
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  async extractTranscriptText(): Promise<string> {
    // Use the exact approach from original script
    const container = document.getElementById("segments-container");

    if (!container) {
      throw new Error("segments-container not found");
    }

    const text = this.cleanTextFromContainer(container);

    if (!text) {
      throw new Error("No text in segments-container");
    }

    console.log("Extracted transcript text");
    return text;
  }

  cleanTextFromContainer(container: HTMLElement): string {
    if (!container) return "";
    return (
      container.textContent
        ?.trim()
        .replace(/[\n\r0-9:]+/g, "")
        .replace(/\s+/g, " ")
        .trim() || ""
    );
  }

  getVideoTitle(): string {
    const titleElement =
      document.querySelector("h1.ytd-video-primary-info-renderer") ||
      document.querySelector("h1.title") ||
      document.querySelector("h1") ||
      document.querySelector('[data-testid="video-title"]');

    return titleElement?.textContent?.trim() || "Unknown Video";
  }
}

// Content script main function
export default defineContentScript({
  matches: ["*://*.youtube.com/*"],
  main() {
    // Listen for messages from the extension
    browser.runtime.onMessage.addListener(
      (request: any, sender: any, sendResponse: any) => {
        if (request.action === "extractTranscript") {
          handleTranscriptExtraction(sendResponse);
          return true; // Keep the message channel open for async response
        }
      }
    );

    async function handleTranscriptExtraction(sendResponse: any) {
      try {
        // Check if we're on a YouTube video page
        if (
          window.location.hostname !== "www.youtube.com" ||
          window.location.pathname !== "/watch"
        ) {
          sendResponse({
            success: false,
            error: "Not on a YouTube video page",
          });
          return;
        }

        // Create instance of the transcript service
        const transcriptService = new YouTubeTranscriptService();

        // Extract the transcript
        const result = await transcriptService.extractTranscript();

        sendResponse(result);
      } catch (error) {
        sendResponse({
          success: false,
          error: (error as Error).message,
        });
      }
    }
  },
});
