'use server';

/**
 * @fileOverview An AI flow for detecting objects (cats and dogs) in an image.
 *
 * - detectObjects - A function that detects objects in an image.
 * - DetectObjectsInput - The input type for the detectObjects function.
 * - DetectObjectsOutput - The return type for the detectObjects function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectObjectsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a dog or cat, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectObjectsInput = z.infer<typeof DetectObjectsInputSchema>;

const DetectedObjectSchema = z.object({
    label: z.enum(['Cat', 'Dog']).describe('The label of the detected object.'),
    confidence: z.number().describe('The confidence score of the detection (0-1).'),
    box: z.tuple([z.number(), z.number(), z.number(), z.number()]).describe('The bounding box of the detected object in [x_min, y_min, x_max, y_max] format, where coordinates are normalized between 0 and 1.'),
});

const DetectObjectsOutputSchema = z.object({
  objects: z.array(DetectedObjectSchema).describe('A list of detected objects.'),
});
export type DetectObjectsOutput = z.infer<typeof DetectObjectsOutputSchema>;

export async function detectObjects(input: DetectObjectsInput): Promise<DetectObjectsOutput> {
  return detectObjectsFlow(input);
}

const objectDetectionPrompt = ai.definePrompt({
  name: 'objectDetectionPrompt',
  input: {schema: DetectObjectsInputSchema},
  output: {schema: DetectObjectsOutputSchema},
  prompt: `You are an AI model that performs object detection on images. You can identify "Cat" and "Dog" objects.

  Analyze the image provided and identify all instances of cats and dogs. For each object you find, provide:
  1.  The 'label' ("Cat" or "Dog").
  2.  A 'confidence' score for the detection (a number between 0 and 1).
  3.  A 'box' representing the bounding box around the object. The box should be an array of four numbers: [x_min, y_min, x_max, y_max]. These coordinates must be normalized, meaning they should be floats between 0 and 1, representing the position relative to the image dimensions.

  Here is the image:
  {{media url=photoDataUri}}
  
  Return ONLY the JSON object with the key "objects". Do not add any commentary or markdown formatting.
  `,
});

const detectObjectsFlow = ai.defineFlow(
  {
    name: 'detectObjectsFlow',
    inputSchema: DetectObjectsInputSchema,
    outputSchema: DetectObjectsOutputSchema,
  },
  async input => {
    const {output} = await objectDetectionPrompt(input);
    return output!;
  }
);
