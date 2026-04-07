import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { saveUploadBuffer } from '$lib/server/upload';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.admin) error(403, '需要管理员登录');
	const form = await request.formData();
	const file = form.get('file');
	if (!(file instanceof File) || file.size === 0) error(400, '请选择图片');
	let mime = file.type || 'application/octet-stream';
	if (!mime.startsWith('image/')) error(400, '仅支持图片');
	if (mime === 'image/jpg') mime = 'image/jpeg';
	const buf = Buffer.from(await file.arrayBuffer());
	let storedName: string;
	try {
		({ storedName } = saveUploadBuffer(buf, mime));
	} catch (e) {
		const msg = e instanceof Error ? e.message : '上传失败';
		error(400, msg);
	}
	return json({ ok: true, url: `/files/${encodeURIComponent(storedName)}` });
};
