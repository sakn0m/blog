function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/[#*_`[\]()>~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getDescription(
  description: string | undefined,
  body: string | undefined,
  maxLength = 160,
): string {
  if (description) return description;
  const text = stripMarkdown(body ?? '');
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}
