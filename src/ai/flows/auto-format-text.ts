'use server';

/**
 * @fileOverview AI-powered text auto-formatter for LinkedIn posts.
 *
 * - autoFormatText - A function that takes raw text and formats it for LinkedIn, adding line breaks,
 *   bolding to key phrases, emojis, and bullet points to enhance readability and engagement.
 * - AutoFormatTextInput - The input type for the autoFormatText function.
 * - AutoFormatTextOutput - The return type for the autoFormatText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AutoFormatTextInputSchema = z.object({
  rawText: z.string().describe('The raw text to be formatted for a LinkedIn post.'),
});
export type AutoFormatTextInput = z.infer<typeof AutoFormatTextInputSchema>;

const AutoFormatTextOutputSchema = z.object({
  formattedText: z.string().describe('The AI-formatted text optimized for LinkedIn.'),
});
export type AutoFormatTextOutput = z.infer<typeof AutoFormatTextOutputSchema>;

export async function autoFormatText(input: AutoFormatTextInput): Promise<AutoFormatTextOutput> {
  const formatResult = await autoFormatTextFlow(input);
  return formatResult;
}

const autoFormatTextPrompt = ai.definePrompt({
  name: 'autoFormatTextPrompt',
  input: { schema: AutoFormatTextInputSchema },
  output: { schema: AutoFormatTextOutputSchema },
  prompt: `You are an AI assistant specialized in formatting text for optimal readability and engagement on LinkedIn.

  **Primary Formatting Objective:**
  Your main purpose is to FORMAT the user's text, not to correct or change their language or grammar. You must preserve the user's original phrasing and wording. Your formatting should be subtle and professional.

  **Formatting Rules:**
  - **Whitespace is Paramount:** Use generous line breaks (\\n) to create a clean, scannable, and breathable structure. Separate paragraphs and ideas with empty lines.
  - **Markdown Bolding (Use Sparingly):** To indicate bolding, you MUST use standard markdown for bolding (\`**text**\`). Use this to highlight only the most critical keywords or short phrases. **Do not bold full sentences.** Over-bolding looks unprofessional.
  - **Subtle Emphasis:** Where appropriate, you can use ALL CAPS for single words to add impact.
  - **Smart Lists:** If the text contains a list, convert it into bullet points. You can use standard markers like '*' or '->'.
  - **Subtle Emojis:** Use a maximum of 1-2 relevant, professional emojis for the entire post. The goal is subtle enhancement, not distraction.
  - **Hook and Clarity:** If a strong opening "hook" is missing, re-arrange the user's own sentences to create one, but do not write new content.
  - **Professional Tone:** Ensure the final output maintains a professional, clear, and authoritative tone suitable for LinkedIn.
  - **No Horizontal Rules:** Do not use '---'.
  - **Link Handling**: Leave URLs as plain text. Do not wrap them in any special format.

  **Input Text To Process:**
  {{{rawText}}}

  Provide your response in the specified JSON format, containing only the formatted text.`,
});

const autoFormatTextFlow = ai.defineFlow(
  {
    name: 'autoFormatTextFlow',
    inputSchema: AutoFormatTextInputSchema,
    outputSchema: AutoFormatTextOutputSchema,
  },
  async (input) => {
    const { output } = await autoFormatTextPrompt({ rawText: input.rawText });

    if (output) {
      // The AI returns markdown bolding (**text**). The frontend will handle conversion for the editor.
      const textForEditor = output.formattedText
        .replace(/\\n/g, '\n')
        .replace(/\n/g, '<br>');

      return { formattedText: textForEditor };
    }

    return output!;
  }
);
