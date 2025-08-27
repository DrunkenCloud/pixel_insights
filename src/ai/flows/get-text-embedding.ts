'use server';

/**
 * @fileOverview A flow for generating text embeddings using a direct API call.
 * 
 * - getTextEmbedding - A function that generates an embedding for a text string.
 * - GetTextEmbeddingInput - The input type for the getTextEmbedding function.
 * - GetTextEmbeddingOutput - The return type for the getTextEmbedding function.
 */

import { z } from 'genkit';

const GetTextEmbeddingInputSchema = z.object({
  text: z.string().describe('The text to embed.'),
});
export type GetTextEmbeddingInput = z.infer<typeof GetTextEmbeddingInputSchema>;

const GetTextEmbeddingOutputSchema = z.object({
  embedding: z.array(z.number()).describe('The embedding vector for the text.'),
});
export type GetTextEmbeddingOutput = z.infer<typeof GetTextEmbeddingOutputSchema>;

export async function getTextEmbedding(input: GetTextEmbeddingInput): Promise<GetTextEmbeddingOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in the environment.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/embedding-004:batchEmbedContents?key=${apiKey}`;

  const requestBody = {
    requests: [
      {
        model: "models/embedding-004",
        content: {
          parts: [
            {
              text: input.text,
            },
          ],
        },
      }
    ]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorBody = await response.json();
        console.error('API Error:', errorBody);
        throw new Error(`API request failed with status ${response.status}: ${errorBody.error.message}`);
    }

    const data = await response.json();
    if (!data.embeddings || data.embeddings.length === 0) {
      throw new Error('API response did not contain embeddings.');
    }
    return { embedding: data.embeddings[0].values };
  } catch (error) {
    console.error('Failed to generate embedding:', error);
    throw new Error('Failed to generate embedding.');
  }
}
