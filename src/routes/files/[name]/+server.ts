import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { UPLOAD_DIR } from '$lib/server/upload';
import { getWorkByStoredName } from '$lib/server/store';

/** 访客可在线浏览（流式展示）的 MIME；其余附件仅管理员可下载 */
function guestMayViewInline(mime: string): boolean {
	return (
		mime.startsWith('image/') ||
		mime.startsWith('video/') ||
		mime.startsWith('audio/') ||
		mime === 'audio/mp3'
	);
}

/** 富文本等上传的独立图片（UUID 文件名），不绑定作品记录也可公开读取 */
const UUID_IMAGE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpe?g|png|gif|webp)$/i;

const mimeMap: Record<string, string> = {
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.gif': 'image/gif',
	'.webp': 'image/webp',
	'.pdf': 'application/pdf',
	'.mp4': 'video/mp4',
	'.zip': 'application/zip',
	'.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'.mp3': 'audio/mpeg'
};

export const GET: RequestHandler = ({ params, locals }) => {
	const name = params.name;
	if (!name || name.includes('..') || name.includes('/') || name.includes('\\')) error(404, 'Not found');
	const path = join(UPLOAD_DIR, name);
	if (!existsSync(path)) error(404, 'Not found');
	const row = getWorkByStoredName(name);
	if (!row && !UUID_IMAGE.test(name)) error(404, 'Not found');
	/* 作品附件：非流媒体类仅管理员可拉取（访客仅能在页面内浏览正文，不可下载原文件） */
	if (row && !UUID_IMAGE.test(name) && !guestMayViewInline(row.mime)) {
		if (!locals.admin) error(403, '附件下载仅管理员可用');
	}
	const buf = readFileSync(path);
	const ext = name.slice(name.lastIndexOf('.'));
	const type = mimeMap[ext.toLowerCase()] ?? row?.mime ?? 'application/octet-stream';
	const headers: Record<string, string> = {
		'Content-Type': type,
		'Cache-Control': 'public, max-age=3600'
	};
	/* 文档类：仅管理员请求会到达此处 */
	if (ext.toLowerCase() === '.docx' && row) {
		headers['Content-Disposition'] = `attachment; filename*=UTF-8''${encodeURIComponent(row.original_name)}`;
	}
	return new Response(buf, { headers });
};
