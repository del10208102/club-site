import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getRecruit, setRecruitContent } from '$lib/server/store';

export const GET: RequestHandler = () => {
	return json(getRecruit());
};

export const PUT: RequestHandler = async ({ request, locals }) => {
	if (!locals.admin) error(403, '需要管理员登录');
	const form = await request.formData();
	const content = String(form.get('content') ?? '');
	setRecruitContent(content);
	return json({ ok: true });
};
