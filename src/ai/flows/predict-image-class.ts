'use server';

/**
 * @fileOverview Image classification flow to predict whether an image is a cat or a dog.
 *
 * - predictImageClass - A function that handles the image classification process.
 * - PredictImageClassInput - The input type for the predictImageClass function.
 * - PredictImageClassOutput - The return type for the predictImageClass function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictImageClassInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a cat or dog, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type PredictImageClassInput = z.infer<typeof PredictImageClassInputSchema>;

const PredictImageClassOutputSchema = z.object({
  prediction: z.enum(['Dog', 'Cat']).describe('The predicted class of the image.'),
  confidence: z.number().describe('The confidence score of the prediction (0-1).'),
});
export type PredictImageClassOutput = z.infer<typeof PredictImageClassOutputSchema>;

export async function predictImageClass(input: PredictImageClassInput): Promise<PredictImageClassOutput> {
  return predictImageClassFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictImageClassPrompt',
  input: {schema: PredictImageClassInputSchema},
  output: {schema: PredictImageClassOutputSchema, format: 'json'},
  prompt: `You are an AI image classification model specializing in identifying cats and dogs.
  Given an image, you will predict whether it is a "Cat" or a "Dog", and provide a confidence score (0-1).

  Analyze the following image:
  {{media url=photoDataUri}}

  Return ONLY the JSON object. Do not wrap the JSON in markdown backticks.
  `,
});

const predictImageClassFlow = ai.defineFlow(
  {
    name: 'predictImageClassFlow',
    inputSchema: PredictImageClassInputSchema,
    outputSchema: PredictImageClassOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
