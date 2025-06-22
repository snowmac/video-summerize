export async function callGrok(
  transcript: string,
  apiKey: string,
  prompt: string
): Promise<string> {
  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-beta",
      messages: [
        {
          role: "user",
          content: `${prompt}\n\nTranscript:\n${transcript}`,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `xAI Grok API error (${response.status}): ${
        errorData.error?.message || response.statusText
      }`
    );
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "No response from xAI Grok";
}
