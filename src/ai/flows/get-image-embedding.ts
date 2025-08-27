'use server';

/**
 * @fileOverview A flow for generating image embeddings using a direct API call.
 * 
 * - getImageEmbedding - A function that generates an embedding for an image.
 * - GetImageEmbeddingInput - The input type for the getImageEmbedding function.
 * - GetImageEmbeddingOutput - The return type for the getImageEmbedding function.
 */

import { z } from 'genkit';

const GetImageEmbeddingInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GetImageEmbeddingInput = z.infer<typeof GetImageEmbeddingInputSchema>;

const GetImageEmbeddingOutputSchema = z.object({
  embedding: z.array(z.number()).describe('The embedding vector for the image.'),
});
export type GetImageEmbeddingOutput = z.infer<typeof GetImageEmbeddingOutputSchema>;


export async function getImageEmbedding(input: GetImageEmbeddingInput): Promise<GetImageEmbeddingOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in the environment.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/embedding-004:embedContent?key=${apiKey}`;

  // Extract mimeType and base64 data from data URI
  const matches = input.photoDataUri.match(/^data:(.+);base64,(.*)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid data URI format.');
  }
  const mimeType = matches[1];
  const base64Data = matches[2];

  const requestBody = {
    model: "models/embedding-004",
    content: {
      parts: [
        {
          blob: {
            mimeType: mimeType,
            data: base64Data,
          },
        },
      ],
    },
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
    return { embedding: data.embedding.values };
  } catch (error) {
    console.error('Failed to generate embedding:', error);
    throw new Error('Failed to generate embedding.');
  }
}
