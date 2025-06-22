export default defineBackground(() => {
  console.log("YouTube Transcript Summarizer extension loaded!", {
    id: browser.runtime.id,
  });

  // Handle any background tasks here
  // For now, we'll just log that the extension is loaded
});
