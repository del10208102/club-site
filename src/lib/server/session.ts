import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '$env/dynamic/private';

const COOKIE = 'club_session';

export function cookieName() {
	return COOKIE;
}

function secret(): string {
	const s = env.SESSION_SECRET?.trim();
	if (s) return s;
	/* 开发环境未配置时允许本地登录测试（生产环境必须设置 SESSION_SECRET） */
	if (process.env.NODE_ENV !== 'production') {
		return 'dev-fantasy-session-secret-min-32-chars-local-only';
	}
	throw new Error('SESSION_SECRET 未配置');
}

/** 签发管理员会话（HMAC 签名 + 过期时间 + 登录账号，用于作品归属与权限） */
export function createAdminSession(username: string): string {
	const s = secret();
	const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
	const u = username.trim().slice(0, 64);
	const payload = Buffer.from(JSON.stringify({ exp, v: 1, u }), 'utf8').toString('base64url');
	const sig = createHmac('sha256', s).update(payload).digest('base64url');
	return `${payload}.${sig}`;
}

export type AdminSessionInfo = { ok: boolean; username: string };

/** 校验会话并解析登录名（旧 Cookie 无 u 字段时 username 为空，仍可登录） */
export function readAdminSession(token: string | undefined): AdminSessionInfo {
	if (!token?.includes('.')) return { ok: false, username: '' };
	let s: string;
	try {
		s = secret();
	} catch {
		return { ok: false, username: '' };
	}
	const dot = token.lastIndexOf('.');
	const payload = token.slice(0, dot);
	const sig = token.slice(dot + 1);
	const expected = createHmac('sha256', s).update(payload).digest('base64url');
	if (expected.length !== sig.length) return { ok: false, username: '' };
	try {
		if (!timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(sig, 'utf8')))
			return { ok: false, username: '' };
	} catch {
		return { ok: false, username: '' };
	}
	try {
		const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
			exp: number;
			v?: number;
			u?: string;
		};
		if (typeof data.exp !== 'number' || data.exp < Date.now()) return { ok: false, username: '' };
		const username = typeof data.u === 'string' ? data.u : '';
		return { ok: true, username };
	} catch {
		return { ok: false, username: '' };
	}
}

export function verifyAdminSession(token: string | undefined): boolean {
	return readAdminSession(token).ok;
}
