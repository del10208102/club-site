import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listAnnouncements, addAnnouncement } from '$lib/server/store';
import { sanitizeArticleHtml, stripTags } from '$lib/server/html-sanitize';

export const GET: RequestHandler = () => {
	return json({ items: listAnnouncements() });
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.admin) error(403, '需要管理员登录');
	const form = await request.formData();
	const title = String(form.get('title') ?? '').trim();
	const body_html_raw = String(form.get('body_html') ?? '');
	if (!title) error(400, '标题不能为空');
	const body_html = sanitizeArticleHtml(body_html_raw);
	if (!body_html.replace(/<[^>]+>/g, '').trim()) error(400, '正文不能为空');
	const bodyPlain = stripTags(body_html).trim();
	const id = addAnnouncement(title, bodyPlain, body_html);
	return json({ ok: true, id });
};
