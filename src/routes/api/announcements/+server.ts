import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listAnnouncements, addAnnouncement } from '$lib/server/store';
import { checkAdmin } from '$lib/server/auth';

export const GET: RequestHandler = () => {
	return json({ items: listAnnouncements() });
};

export const POST: RequestHandler = async ({ request }) => {
	const form = await request.formData();
	if (!checkAdmin(request, form)) error(401, '未授权');
	const title = String(form.get('title') ?? '').trim();
	const body = String(form.get('body') ?? '').trim();
	if (!title) error(400, '标题不能为空');
	const id = addAnnouncement(title, body);
	return json({ ok: true, id });
};
