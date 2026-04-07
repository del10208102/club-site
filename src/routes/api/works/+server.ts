import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listWorks, addWork } from '$lib/server/store';
import { saveUploadBuffer } from '$lib/server/upload';
import { docxBufferToArticle } from '$lib/server/docx';
import { makeExcerpt } from '$lib/server/plain-html';

const DOCX =
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export const GET: RequestHandler = () => {
	return json({ items: listWorks() });
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.admin) error(403, '需要管理员登录');
	const form = await request.formData();
	const title = String(form.get('title') ?? '').trim();
	const department = String(form.get('department') ?? '').trim();
	const author = String(form.get('author') ?? '').trim();
	const description = String(form.get('description') ?? '').trim();
	const work_kind = String(form.get('work_kind') ?? 'literary').trim() === 'art' ? 'art' : 'literary';
	const file = form.get('file');
	if (!title) error(400, '题目不能为空');
	if (!department) error(400, '请填写部门');
	if (!author) error(400, '请填写作者');
	if (!(file instanceof File) || file.size === 0) error(400, '请选择文件');
	const buf = Buffer.from(await file.arrayBuffer());
	let mime = file.type || 'application/octet-stream';
	if (mime === 'audio/mp3') mime = 'audio/mpeg';

	let content_html: string | undefined;
	let excerpt: string | undefined;

	const isDocx =
		mime === DOCX ||
		file.name.toLowerCase().endsWith('.docx') ||
		mime === 'application/msword';

	if (work_kind === 'art') {
		if (!mime.startsWith('image/')) error(400, '画作请上传图片文件');
		if (isDocx) error(400, '画作不能使用 Word，请上传图片');
	} else if (isDocx) {
		try {
			const conv = await docxBufferToArticle(buf);
			content_html = conv.html;
			excerpt = conv.excerpt;
		} catch {
			error(400, '无法解析 Word 文档');
		}
	}

	let storedName: string;
	try {
		({ storedName } = saveUploadBuffer(buf, mime));
	} catch (e) {
		const msg = e instanceof Error ? e.message : '上传失败';
		error(400, msg);
	}

	if (!excerpt && !isDocx) {
		excerpt = description.trim() ? makeExcerpt(description, 200) : makeExcerpt(title, 80);
	}

	if (work_kind === 'art' && !excerpt?.trim()) {
		excerpt = makeExcerpt(title, 80);
	}

	const owned_by = locals.adminUser?.trim() ?? '';

	const id = addWork(title, department, author, description, storedName, file.name, mime, {
		content_html,
		excerpt,
		work_kind,
		owned_by: owned_by || undefined
	});
	return json({ ok: true, id });
};
