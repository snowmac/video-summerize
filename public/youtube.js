class YouTubeTranscriptService {
  constructor() {
    this.transcriptData = null;
  }

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
        error: error.message,
        videoTitle: this.getVideoTitle(),
        videoUrl: window.location.href,
      };
    }
  }

  isYouTubeVideoPage() {
    return (
      window.location.hostname === "www.youtube.com" &&
      window.location.pathname === "/watch"
    );
  }

  async clickMoreButton() {
    // Click element with text "...more" if it exists (from original script)
    const moreElement = Array.from(document.querySelectorAll("*")).find(
      (el) => el.textContent.trim() === "...more" && el instanceof HTMLElement
    );

    if (moreElement) {
      moreElement.click();
      console.log('Clicked "...more"');
    } else {
      console.warn('"...more" not found');
    }

    // Wait 3 seconds as in original script
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  async clickShowTranscript() {
    // Click element with aria-label="Show transcript" (from original script)
    const transcriptElement = document.querySelector(
      '[aria-label="Show transcript"]'
    );

    if (transcriptElement) {
      transcriptElement.click();
      console.log('Clicked "Show transcript"');
    } else {
      throw new Error('"Show transcript" not found');
    }

    // Wait 1 second as in original script
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  async extractTranscriptText() {
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

  cleanTextFromContainer(container) {
    if (!container) return "";
    return container.textContent
      .trim()
      .replace(/[\n\r0-9:]+/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  getVideoTitle() {
    const titleElement =
      document.querySelector("h1.ytd-video-primary-info-renderer") ||
      document.querySelector("h1.title") ||
      document.querySelector("h1") ||
      document.querySelector('[data-testid="video-title"]');

    return titleElement ? titleElement.textContent.trim() : "Unknown Video";
  }
}

// Export for use in the extension
if (typeof module !== "undefined" && module.exports) {
  module.exports = YouTubeTranscriptService;
} else {
  window.YouTubeTranscriptService = YouTubeTranscriptService;
}
