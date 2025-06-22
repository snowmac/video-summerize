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

      // Wait for the transcript button to be available
      await this.waitForTranscriptButton();

      // Click the transcript button to open the transcript panel
      await this.openTranscriptPanel();

      // Extract the transcript text
      const transcript = await this.extractTranscriptText();

      // Close the transcript panel
      await this.closeTranscriptPanel();

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

  async waitForTranscriptButton() {
    return new Promise((resolve, reject) => {
      const maxAttempts = 50;
      let attempts = 0;

      const checkForButton = () => {
        attempts++;

        // Look for the transcript button in the description area
        const transcriptButton = document.querySelector(
          'button[aria-label*="transcript"], button[aria-label*="Transcript"]'
        );

        if (transcriptButton) {
          resolve(transcriptButton);
          return;
        }

        if (attempts >= maxAttempts) {
          reject(new Error("Transcript button not found after 5 seconds"));
          return;
        }

        setTimeout(checkForButton, 100);
      };

      checkForButton();
    });
  }

  async openTranscriptPanel() {
    const transcriptButton = await this.waitForTranscriptButton();

    // Check if transcript panel is already open
    const transcriptPanel = document.querySelector(
      '[data-testid="transcript-panel"]'
    );
    if (transcriptPanel) {
      return;
    }

    // Click the transcript button
    transcriptButton.click();

    // Wait for the transcript panel to appear
    await new Promise((resolve, reject) => {
      const maxAttempts = 50;
      let attempts = 0;

      const checkForPanel = () => {
        attempts++;

        const panel = document.querySelector(
          '[data-testid="transcript-panel"]'
        );
        if (panel) {
          resolve(panel);
          return;
        }

        if (attempts >= maxAttempts) {
          reject(new Error("Transcript panel did not open"));
          return;
        }

        setTimeout(checkForPanel, 100);
      };

      checkForPanel();
    });
  }

  async extractTranscriptText() {
    // Wait a bit for the transcript to load
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Find all transcript segments
    const transcriptSegments = document.querySelectorAll(
      '[data-testid="transcript-segment"]'
    );

    if (transcriptSegments.length === 0) {
      // Fallback: try alternative selectors
      const fallbackSegments = document.querySelectorAll(
        ".ytd-transcript-segment-renderer"
      );
      if (fallbackSegments.length === 0) {
        throw new Error("No transcript segments found");
      }
      return this.extractFromSegments(fallbackSegments);
    }

    return this.extractFromSegments(transcriptSegments);
  }

  extractFromSegments(segments) {
    const transcriptParts = [];

    segments.forEach((segment) => {
      // Get the text content of the segment
      const textElement =
        segment.querySelector('[data-testid="transcript-segment-text"]') ||
        segment.querySelector(".ytd-transcript-segment-renderer-text");

      if (textElement) {
        const text = textElement.textContent.trim();
        if (text) {
          transcriptParts.push(text);
        }
      }
    });

    if (transcriptParts.length === 0) {
      throw new Error("No transcript text could be extracted");
    }

    return transcriptParts.join(" ");
  }

  async closeTranscriptPanel() {
    // Find and click the close button for the transcript panel
    const closeButton =
      document.querySelector(
        '[data-testid="transcript-panel"] button[aria-label*="Close"]'
      ) ||
      document.querySelector(
        '.ytd-transcript-renderer button[aria-label*="Close"]'
      );

    if (closeButton) {
      closeButton.click();
    }
  }

  getVideoTitle() {
    const titleElement =
      document.querySelector("h1.ytd-video-primary-info-renderer") ||
      document.querySelector("h1.title") ||
      document.querySelector("h1");

    return titleElement ? titleElement.textContent.trim() : "Unknown Video";
  }
}

// Export for use in the extension
if (typeof module !== "undefined" && module.exports) {
  module.exports = YouTubeTranscriptService;
} else {
  window.YouTubeTranscriptService = YouTubeTranscriptService;
}
