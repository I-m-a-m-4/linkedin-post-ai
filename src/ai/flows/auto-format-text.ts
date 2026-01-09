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
  Your main purpose is to FORMAT the user's text, not to rewrite or change their core message. Preserve the user's original phrasing. Your formatting should be clean, professional, and subtle.

  **Formatting Rules:**
  - **Whitespace is Paramount:** Use generous line breaks to create a clean, scannable, and breathable structure. Separate paragraphs and ideas with empty lines.
  - **Bolding (Use Sparingly):** To indicate bolding, you MUST use standard markdown (\`**text**\`). Use this to highlight only the most critical keywords or short phrases (2-3 words max). **Do NOT bold full sentences.** Over-bolding looks unprofessional.
  - **Italics for Emphasis:** Where appropriate, use markdown for italics (\`_text_\`) to add subtle emphasis to a word or phrase.
  - **Smart Lists:** If the text contains a list, convert it into bullet points. You MUST use a standard asterisk marker followed by a space (e.g., \`* List item\`).
  - **Subtle & Contextual Emojis:** Use a maximum of 2-3 relevant, professional emojis for the entire post. Place them strategically at the end of lines. For milestones or achievements, consider using a medal (🏅) or trophy (🏆) emoji.
  - **Hook and Clarity:** If a strong opening "hook" is missing, rearrange the user's own sentences to create one, but do not write new content.
  - **Professional Tone:** Ensure the final output maintains a professional, clear, and authoritative tone suitable for LinkedIn.
  - **No Horizontal Rules:** Do not use '---' or other separators.
  - **Link Handling**: Leave URLs as plain text. Do not wrap them in any special format.

  **Input Text To Process:**
  {{{rawText}}}

  Provide your response in the specified JSON format, containing only the formatted text. The output should be a single string with markdown for bolding, italics, and lists.`,
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
      // The AI returns markdown. The editor needs HTML.
      const textForEditor = output.formattedText
        .replace(/\\n/g, '\n') // Fix escaped newlines
        .replace(/\n/g, '<br>') // Convert newlines to <br> for the editor
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Convert markdown bold to HTML
        .replace(/_(.*?)_/g, '<em>$1</em>') // Convert markdown italic to HTML
        .replace(/^\* (.*$)/gm, '<ul><li>$1</li></ul>') // Convert markdown list items to HTML lists
        .replace(/<\/ul><br><ul>/g, ''); // Merge adjacent lists

      return { formattedText: textForEditor };
    }

    return output!;
  }
);
