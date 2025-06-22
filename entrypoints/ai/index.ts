export enum AIServiceType {
  OpenAI = "openai",
  Anthropic = "anthropic",
  Grok = "grok",
  HuggingFace = "huggingface",
}

export async function invokeAI(
  ai: AIServiceType,
  transcript: string,
  prompt: string,
  apiKey: string
): Promise<string> {
  switch (ai) {
    case AIServiceType.OpenAI:
      return callOpenAI(transcript, apiKey, prompt);
    case AIServiceType.Anthropic:
      return callAnthropic(transcript, apiKey, prompt);
    case AIServiceType.Grok:
      return callGrok(transcript, apiKey, prompt);
    case AIServiceType.HuggingFace:
      return callHuggingFace(transcript, apiKey, prompt);
    default:
      throw new Error("Unsupported AI service");
  }
}

// Service-specific implementations (to be implemented in separate files)
import { callOpenAI } from "./openai";
import { callAnthropic } from "./anthropic";
import { callGrok } from "./grok";
import { callHuggingFace } from "./huggingface";
