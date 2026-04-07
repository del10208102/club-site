/** 将纯文本转为简单段落 HTML（迁移旧数据用） */
export function plainTextToArticleHtml(text: string): string {
	const esc = (s: string) =>
		s
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	const parts = text.split(/\n\s*\n/).filter((p) => p.trim());
	if (parts.length === 0) return `<p>${esc(text.trim())}</p>`;
	return parts.map((p) => `<p>${esc(p.trim()).replace(/\n/g, '<br />')}</p>`).join('');
}

/** 从 HTML 或纯文本生成列表摘要 */
export function makeExcerpt(htmlOrText: string, maxLen = 160): string {
	const plain = htmlOrText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
	if (plain.length <= maxLen) return plain;
	return plain.slice(0, maxLen).trim() + '…';
}
