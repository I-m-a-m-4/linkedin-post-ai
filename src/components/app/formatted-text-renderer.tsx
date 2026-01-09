
'use client';
import React from 'react';

type FormattedTextRendererProps = {
  text: string; // Expecting a string containing HTML
};

export const FormattedTextRenderer: React.FC<FormattedTextRendererProps> = ({ text }) => {
  if (!text) return null;

  // The AI returns markdown bold as **text**. We convert it to <strong> for rendering.
  // We also detect URLs and wrap them in <a> tags for the preview.
  const linkRegex = /(https?:\/\/[^\s]+)/g;
  const cleanedText = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(linkRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="font-bold text-primary hover:underline">$1</a>');
  
  return (
    <div
      className="prose-base prose-p:my-2 prose-ul:my-2 prose-li:my-1 prose-strong:font-bold prose-em:italic"
      dangerouslySetInnerHTML={{ __html: cleanedText }}
    />
  );
};
