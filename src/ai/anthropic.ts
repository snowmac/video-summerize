export async function callAnthropic(
  transcript: string,
  apiKey: string,
  prompt: string
): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `${prompt}\n\nTranscript:\n${transcript}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Anthropic API error (${response.status}): ${
        errorData.error?.message || response.statusText
      }`
    );
  }

  const data = await response.json();
  return data.content[0]?.text || "No response from Anthropic";
}
