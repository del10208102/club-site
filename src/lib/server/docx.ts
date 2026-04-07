import mammoth from 'mammoth';
import { sanitizeArticleHtml } from './html-sanitize';
import { makeExcerpt } from './plain-html';

export async function docxBufferToArticle(buffer: Buffer): Promise<{ html: string; excerpt: string }> {
	const { value: rawHtml } = await mammoth.convertToHtml({ buffer });
	const html = sanitizeArticleHtml(rawHtml);
	const { value: rawText } = await mammoth.extractRawText({ buffer });
	const excerpt = makeExcerpt(rawText || html.replace(/<[^>]+>/g, ' '), 200);
	return { html, excerpt };
}
