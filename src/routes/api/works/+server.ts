import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listWorks, addWork } from '$lib/server/store';
import { saveUploadBuffer } from '$lib/server/upload';
import { checkAdmin } from '$lib/server/auth';

export const GET: RequestHandler = () => {
	return json({ items: listWorks() });
};

export const POST: RequestHandler = async ({ request }) => {
	const form = await request.formData();
	if (!checkAdmin(request, form)) error(401, '未授权');
	const title = String(form.get('title') ?? '').trim();
	const description = String(form.get('description') ?? '').trim();
	const file = form.get('file');
	if (!title) error(400, '标题不能为空');
	if (!(file instanceof File) || file.size === 0) error(400, '请选择文件');
	const buf = Buffer.from(await file.arrayBuffer());
	const mime = file.type || 'application/octet-stream';
	let storedName: string;
	try {
		({ storedName } = saveUploadBuffer(buf, mime));
	} catch (e) {
		const msg = e instanceof Error ? e.message : '上传失败';
		error(400, msg);
	}
	const id = addWork(title, description, storedName, file.name, mime);
	return json({ ok: true, id });
};
