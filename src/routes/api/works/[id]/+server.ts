import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getWorkById, updateWork, deleteWork } from '$lib/server/store';
import { sanitizeArticleHtml, stripTags } from '$lib/server/html-sanitize';
import { makeExcerpt } from '$lib/server/plain-html';
import { canManageWork } from '$lib/server/permissions';

function plainField(s: unknown, max: number): string | undefined {
	if (typeof s !== 'string') return undefined;
	const t = s.trim();
	if (!t) return '';
	return t.slice(0, max);
}

export const PATCH: RequestHandler = async ({ request, locals, params }) => {
	if (!locals.admin) error(403, '需要管理员登录');
	const id = Number(params.id);
	if (!Number.isInteger(id)) error(400, '无效 ID');
	const w = getWorkById(id);
	if (!w) error(404, '未找到');
	if (!canManageWork(locals.adminUser ?? '', w)) error(403, '无权修改此作品');

	const body = await request.json().catch(() => ({}));

	const patch: Parameters<typeof updateWork>[1] = {};

	if (typeof body.content_html === 'string') {
		const content_html = sanitizeArticleHtml(body.content_html);
		const plain = stripTags(content_html).trim();
		patch.content_html = content_html;
		patch.excerpt = plain ? makeExcerpt(plain, 220) : '';
	}

	const title = plainField(body.title, 200);
	if (title !== undefined) patch.title = title;

	const description = plainField(body.description, 2000);
	if (description !== undefined) patch.description = description;

	const department = plainField(body.department, 80);
	if (department !== undefined) patch.department = department;

	const author = plainField(body.author, 80);
	if (author !== undefined) patch.author = author;

	if (Object.keys(patch).length === 0) error(400, '无可更新字段');

	updateWork(id, patch);
	return json({ ok: true });
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	if (!locals.admin) error(403, '需要管理员登录');
	const id = Number(params.id);
	if (!Number.isInteger(id)) error(400, '无效 ID');
	const w = getWorkById(id);
	if (!w) error(404, '未找到');
	if (!canManageWork(locals.adminUser ?? '', w)) error(403, '无权删除此作品');
	const ok = deleteWork(id);
	if (!ok) error(500, '删除失败');
	return json({ ok: true });
};
