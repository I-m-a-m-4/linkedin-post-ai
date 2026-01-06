'use server';

/**
 * @fileOverview AI-powered text analysis for readability and tone.
 *
 * - analyzeText - A function that takes formatted text and returns a readability score and tone analysis.
 * - AnalyzeTextInput - The input type for the analyzeText function.
 * - AnalyzeTextOutput - The return type for the analyzeText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeTextInputSchema = z.object({
  formattedText: z.string().describe('The formatted text to be analyzed.'),
});
type AnalyzeTextInput = z.infer<typeof AnalyzeTextInputSchema>;

const AnalyzeTextOutputSchema = z.object({
  readabilityScore: z
    .string()
    .describe(
      'A readability score from 0-100, presented as a string (e.g., "90/100"). Higher is better. This is based on factors like sentence length and word complexity.'
    ),
  tone: z
    .string()
    .describe('The primary tone of the text (e.g., "Professional", "Casual", "Inspirational"). This describes the emotional voice of the post.'),
});
export type AnalyzeTextOutput = z.infer<typeof AnalyzeTextOutputSchema>;

export async function analyzeText(input: AnalyzeTextInput): Promise<AnalyzeTextOutput> {
  return await analyzeTextFlow(input);
}

const analyzeTextPrompt = ai.definePrompt({
  name: 'analyzeTextPrompt',
  input: { schema: AnalyzeTextInputSchema },
  output: { schema: AnalyzeTextOutputSchema },
  prompt: `You are an expert in communication and linguistics. Your only job is to analyze the following text for its readability and tone. Do not correct or change the text.

  1.  **Assess Readability**: Evaluate the text's complexity based on factors like sentence length and word complexity. Provide a numerical score from 0 to 100, where 100 is extremely easy to read (simple language, clear structure) and 0 is very difficult (expert-level, complex jargon). Format it as a string "score/100".

  2.  **Determine Tone**: Identify the primary emotional voice of the post. Examples include: Professional, Casual, Inspirational, Humorous, Authoritative, Informative, etc.

  Post Text:
  {{{formattedText}}}

  Provide your analysis in the specified JSON format.`,
});

const analyzeTextFlow = ai.defineFlow(
  {
    name: 'analyzeTextFlow',
    inputSchema: AnalyzeTextInputSchema,
    outputSchema: AnalyzeTextOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeTextPrompt(input);
    return output!;
  }
);
