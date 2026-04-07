import sanitizeHtml from 'sanitize-html';

/** 公告 / 作品正文允许的富文本标签（论坛/文档风格） */
export function sanitizeArticleHtml(dirty: string): string {
	return sanitizeHtml(dirty, {
		allowedTags: [
			'p',
			'br',
			'div',
			'span',
			'strong',
			'b',
			'em',
			'i',
			'u',
			's',
			'sub',
			'sup',
			'h1',
			'h2',
			'h3',
			'h4',
			'h5',
			'ul',
			'ol',
			'li',
			'blockquote',
			'pre',
			'code',
			'a',
			'hr',
			'img'
		],
		allowedAttributes: {
			a: ['href', 'title', 'target', 'rel'],
			span: ['class'],
			div: ['class'],
			p: ['class'],
			code: ['class'],
			pre: ['class'],
			img: ['src', 'alt', 'title', 'loading', 'class']
		},
		allowedSchemes: ['http', 'https', 'mailto'],
		transformTags: {
			a: (tagName, attribs) => ({
				tagName,
				attribs: {
					...attribs,
					target: '_blank',
					rel: 'noopener noreferrer'
				}
			}),
			img: (tagName, attribs) => {
				let src = (attribs.src || '').trim();
				try {
					if (src.startsWith('http://') || src.startsWith('https://')) {
						const u = new URL(src);
						src = u.pathname + u.search;
					}
				} catch {
					return { tagName: 'span', text: '' };
				}
				if (!src.startsWith('/files/') && !src.startsWith('/images/')) {
					return { tagName: 'span', text: '' };
				}
				if (src.includes('..') || src.includes('\0')) {
					return { tagName: 'span', text: '' };
				}
				return {
					tagName: 'img',
					attribs: {
						src,
						alt: typeof attribs.alt === 'string' ? attribs.alt : '',
						loading: 'lazy',
						class: attribs.class
					}
				};
			}
		}
	});
}

export function stripTags(html: string): string {
	return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });
}
