'use server';

/**
 * @fileOverview An AI flow for generating an embedding vector for an image.
 *
 * - getImageEmbedding - A function that generates an embedding for an image.
 * - GetImageEmbeddingInput - The input type for the getImageEmbedding function.
 * - GetImageEmbeddingOutput - The return type for the getImageEmbedding function.
 */

import { generateEmbedding } from '@/ai/genkit';
import { ai } from '@/ai/genkit';
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
  return getImageEmbeddingFlow(input);
}

const getImageEmbeddingFlow = ai.defineFlow(
  {
    name: 'getImageEmbeddingFlow',
    inputSchema: GetImageEmbeddingInputSchema,
    outputSchema: GetImageEmbeddingOutputSchema,
  },
  async (input) => {
    const embedding = await generateEmbedding(input.photoDataUri);
    return { embedding };
  }
);
