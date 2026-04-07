import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getRecruit, setRecruitContent } from '$lib/server/store';
import { checkAdmin } from '$lib/server/auth';

export const GET: RequestHandler = () => {
	return json(getRecruit());
};

export const PUT: RequestHandler = async ({ request }) => {
	const form = await request.formData();
	if (!checkAdmin(request, form)) error(401, '未授权');
	const content = String(form.get('content') ?? '');
	setRecruitContent(content);
	return json({ ok: true });
};
