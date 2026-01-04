
'use client';
import React from 'react';

// This component will now primarily render HTML from the contentEditable div
type FormattedTextRendererProps = {
  text: string; // Expecting a string containing HTML
};

export const FormattedTextRenderer: React.FC<FormattedTextRendererProps> = ({ text }) => {
  if (!text) return null;

  // Since the text is already HTML from the editor, we can render it directly.
  // We add some styling to ensure lists look correct.
  const cleanedText = text
    .replace(/---/g, '')
    .replace(/<hr\s*\/?>/gi, '')
    .replace(/(#\w+)/g, '<span class="font-bold text-primary">$1</span>')
    .replace(/@(\w+)/g, '<span class="font-bold text-primary cursor-pointer">$1</span>');

  return (
    <div
      className="prose-base prose-p:my-2 prose-ul:my-2 prose-li:my-1 prose-strong:font-bold prose-em:italic"
      dangerouslySetInnerHTML={{ __html: cleanedText }}
    />
  );
};

    
