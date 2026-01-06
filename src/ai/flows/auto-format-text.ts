
'use server';

/**
 * @fileOverview AI-powered text auto-formatter for LinkedIn posts.
 *
 * - autoFormatAndAnalyzeText - A function that takes raw text and formats it for LinkedIn, adding line breaks,
 *   bolding to key phrases, emojis, and bullet points to enhance readability and engagement. It also
 *   analyzes the text for a readability score and tone.
 * - AutoFormatTextInput - The input type for the autoFormatText function.
 * - AutoFormatTextOutput - The return type for the autoFormatText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { analyzeText, type AnalyzeTextOutput } from './analyze-text-flow';

const AutoFormatTextInputSchema = z.object({
  rawText: z.string().describe('The raw text to be formatted for a LinkedIn post.'),
});
type AutoFormatTextInput = z.infer<typeof AutoFormatTextInputSchema>;

const AutoFormatTextOutputSchema = z.object({
  formattedText: z.string().describe('The AI-formatted text optimized for LinkedIn.'),
});
type AutoFormatTextOutput = z.infer<typeof AutoFormatTextOutputSchema>;

export async function autoFormatAndAnalyzeText(input: AutoFormatTextInput): Promise<AutoFormatTextOutput & AnalyzeTextOutput> {
  const formatResult = await autoFormatTextFlow(input);
  const correctedText = formatResult.formattedText.replace(/\\n/g, '\n');
  const analysisResult = await analyzeText({ formattedText: correctedText });

  return {
    formattedText: correctedText,
    ...analysisResult,
  };
}

const autoFormatTextPrompt = ai.definePrompt({
  name: 'autoFormatTextPrompt',
  input: { schema: AutoFormatTextInputSchema },
  output: { schema: AutoFormatTextOutputSchema },
  prompt: `You are an AI assistant specialized in formatting text for optimal readability and engagement on LinkedIn.

  **Primary Formatting Objective:**
  Your main purpose is to FORMAT the user's text, not to correct or change their language or grammar. You must preserve the user's original phrasing and wording.

  **Formatting Rules:**
  - **Whitespace is Paramount:** Use generous line breaks to create a clean, scannable, and breathable structure. Separate paragraphs and ideas with empty lines.
  - **Minimalist Bolding:** Use standard markdown bolding (\`**text**\`) **very sparingly**. Only highlight 1-3 of the most critical phrases or takeaways. Do not bold full sentences.
  - **Strategic Underlining & Strikethrough:** For emphasis on certain non-critical points, you can use markdown for underline (\`__text__\`) or strikethrough (\`~~text~~\`). Use these even more sparingly than bolding.
  - **No Italics.**
  - **Smart Lists:** Convert list-like content into bullet points. You can use standard markers like '*' or '-', but also consider using '->' or subtle, relevant emojis like '✅' for a more modern look.
  - **Very Subtle Emojis:** Use a maximum of 1-2 relevant, professional emojis for the entire post. Avoid generic western-style emoticons like :-) or :-(. The goal is subtle enhancement, not distraction.
  - **Hook and Clarity:** If a strong opening "hook" is missing, re-arrange the user's own sentences to create one, but do not write new content. Remove filler words without changing the core meaning.
  - **Professional Tone:** Ensure the final output maintains a professional, clear, and authoritative tone suitable for LinkedIn.
  - **No Horizontal Rules:** Do not use '---'.
  - **Link Handling**: Automatically detect URLs (like https://lnkd.in/...) and format them as clickable links.

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
    // Automatically detect links in the raw text and wrap them in markdown link format
    // This helps the LLM recognize them as distinct entities.
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    const textWithMarkdownLinks = input.rawText.replace(linkRegex, '<$1>');

    const { output } = await autoFormatTextPrompt({ rawText: textWithMarkdownLinks });

    if (output) {
      // The LLM should return markdown links. Now we convert them to HTML `<a>` tags.
      const htmlWithLinks = output.formattedText.replace(/<([^>]+)>/g, '<a href="$1" target="_blank">$1</a>');
      return { formattedText: htmlWithLinks };
    }

    return output!;
  }
);
