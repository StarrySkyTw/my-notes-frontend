import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Marked formats Markdown; DOMPurify removes unsafe HTML before Vue renders it.
export function renderMarkdown(markdownText) {
  if (typeof markdownText !== 'string' || !markdownText) return '';

  const html = marked.parse(markdownText, { breaks: true, gfm: true });
  return DOMPurify.sanitize(html);
}
