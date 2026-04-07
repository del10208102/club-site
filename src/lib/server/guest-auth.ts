/** 用户名：2–32 位，字母数字下划线与中文 */
const USER_RE = /^[\w\u4e00-\u9fff·]{2,32}$/u;

export function validateGuestUsername(username: string): string | null {
	const t = username.trim();
	if (!USER_RE.test(t)) return '用户名为 2–32 位，可使用中文、字母、数字、下划线与间隔号 ·';
	return null;
}

export function validateGuestPassword(password: string): string | null {
	if (password.length < 8) return '密码至少 8 位';
	if (password.length > 128) return '密码过长';
	return null;
}

/** 评论纯文本，去控制字符 */
export function sanitizeCommentBody(raw: string): string {
	return raw
		.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
		.trim()
		.slice(0, 2000);
}
