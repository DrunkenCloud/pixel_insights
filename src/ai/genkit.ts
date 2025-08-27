import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { Part } from 'genkit/cohere';

export const ai = genkit({
  plugins: [googleAI({
    apiVersion: 'v1beta'
  })],
  model: 'googleai/gemini-2.5-flash',
});

export async function generateEmbedding(photoDataUri: string): Promise<number[]> {
  const { embedding } = await ai.embed({
    model: 'googleai/embedding-004',
    content: {
      url: photoDataUri
    }
  });

  return embedding;
}
