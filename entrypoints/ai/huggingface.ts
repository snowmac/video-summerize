export async function callHuggingFace(
  transcript: string,
  apiKey: string,
  prompt: string
): Promise<string> {
  const model = "facebook/bart-large-cnn";
  const response = await fetch(
    `https://api-inference.huggingface.co/models/${model}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        inputs: transcript,
        parameters: {
          max_length: 500,
          min_length: 100,
          do_sample: false,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Hugging Face API error (${response.status}): ${
        errorData.error || response.statusText
      }`
    );
  }

  const data = await response.json();
  if (Array.isArray(data) && data.length > 0) {
    return data[0].summary_text || "No summary generated";
  } else if (data.summary_text) {
    return data.summary_text;
  } else if (data.generated_text) {
    return data.generated_text;
  } else {
    return "No response from Hugging Face";
  }
}
