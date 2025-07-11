import { defineConfig } from "wxt";
import { resolve } from "path";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  vite: () => ({
    resolve: {
      alias: {
        "@": resolve(__dirname, "."),
      },
    },
  }),
  manifest: {
    name: "YouTube Transcript Summarizer",
    description: "Extract and summarize YouTube video transcripts using AI",
    version: "1.0.0",
    permissions: ["activeTab", "storage", "scripting"],
    host_permissions: [
      "*://*.youtube.com/*",
      "https://api.openai.com/*",
      "https://api.anthropic.com/*",
      "https://api.x.ai/*",
      "https://api-inference.huggingface.co/*",
    ],
    action: {
      default_popup: "popup.html",
      default_title: "YouTube Transcript Summarizer",
    },
    icons: {
      16: "icon/16.png",
      32: "icon/32.png",
      48: "icon/48.png",
      96: "icon/96.png",
      128: "icon/128.png",
    },
  },
});
