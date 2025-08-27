'use server';

/**
 * @fileOverview Generates an attention map for an image classification model.
 *
 * - generateAttentionMap - A function that generates the attention map.
 * - GenerateAttentionMapInput - The input type for the generateAttentionMap function.
 * - GenerateAttentionMapOutput - The return type for the generateAttentionMap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAttentionMapInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a dog or cat, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateAttentionMapInput = z.infer<typeof GenerateAttentionMapInputSchema>;

const GenerateAttentionMapOutputSchema = z.object({
  attentionMapDataUri: z
    .string()
    .describe("The attention map as a data URI (e.g., data:image/png;base64,...)."),
  prediction: z.string().describe('The predicted class (dog or cat).'),
  confidence: z.number().describe('The confidence score of the prediction (0-1).'),
});
export type GenerateAttentionMapOutput = z.infer<typeof GenerateAttentionMapOutputSchema>;

export async function generateAttentionMap(input: GenerateAttentionMapInput): Promise<GenerateAttentionMapOutput> {
  return generateAttentionMapFlow(input);
}

const attentionMapPrompt = ai.definePrompt({
  name: 'attentionMapPrompt',
  input: {schema: GenerateAttentionMapInputSchema},
  output: {schema: GenerateAttentionMapOutputSchema, format: 'json'},
  prompt: `You are an AI model that classifies images of cats and dogs and generates an attention map highlighting the areas the AI focuses on to make its decision.

  Analyze the image provided as a data URI and:

  1.  Predict whether the image is a "Cat" or a "Dog". Return the prediction in the 'prediction' field.
  2.  Provide a confidence score (0-1) for your prediction in the 'confidence' field.
  3.  Generate an attention map as a data URI, highlighting the areas of the image that were most influential in your classification decision. Return the attention map in the 'attentionMapDataUri' field. The attention map should be a visual representation (e.g., a heatmap) overlaid on the original image, clearly showing the areas of focus.

  Here is the image:
  {{media url=photoDataUri}}
  
  Return ONLY the JSON object. Do not wrap the JSON in markdown backticks.
  `,
});

const generateAttentionMapFlow = ai.defineFlow(
  {
    name: 'generateAttentionMapFlow',
    inputSchema: GenerateAttentionMapInputSchema,
    outputSchema: GenerateAttentionMapOutputSchema,
  },
  async input => {
    const {output} = await attentionMapPrompt(input);
    return output!;
  }
);
