export function chunkText(text: string, maxChars = 3500) {
  const parts: string[] = [];
  let i = 0;
  while (i < text.length) {
    parts.push(text.slice(i, i + maxChars));
    i += maxChars;
  }
  return parts;
}   