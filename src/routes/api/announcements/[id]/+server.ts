import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAnnouncementById, updateAnnouncement } from '$lib/server/store';
import { sanitizeArticleHtml, stripTags } from '$lib/server/html-sanitize';

export const PATCH: RequestHandler = async ({ request, locals, params }) => {
	if (!locals.admin) error(403, '需要管理员登录');
	const id = Number(params.id);
	if (!Number.isInteger(id)) error(400, '无效 ID');
	const a = getAnnouncementById(id);
	if (!a) error(404, '未找到');

	const body = await request.json().catch(() => ({}));
	const title = typeof body.title === 'string' ? body.title.trim() : undefined;
	const body_html_raw = typeof body.body_html === 'string' ? body.body_html : undefined;
	if (title === undefined && body_html_raw === undefined) error(400, '无更新内容');

	const patch: { title?: string; body?: string; body_html?: string } = {};
	if (title !== undefined) patch.title = title;
	if (body_html_raw !== undefined) {
		const body_html = sanitizeArticleHtml(body_html_raw);
		if (!body_html.replace(/<[^>]+>/g, '').trim()) error(400, '正文不能为空');
		patch.body_html = body_html;
		patch.body = stripTags(body_html).trim();
	}
	updateAnnouncement(id, patch);
	return json({ ok: true });
};
