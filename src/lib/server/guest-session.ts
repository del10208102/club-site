import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '$env/dynamic/private';

const COOKIE = 'club_guest';

export function guestCookieName() {
	return COOKIE;
}

function secret(): string {
	const s = env.SESSION_SECRET?.trim();
	if (s) return s;
	if (process.env.NODE_ENV !== 'production') {
		return 'dev-fantasy-session-secret-min-32-chars-local-only';
	}
	throw new Error('SESSION_SECRET 未配置');
}

/** 访客会话：HMAC 签名 + 过期时间 + 用户 id */
export function createGuestSession(userId: number): string {
	const s = secret();
	const exp = Date.now() + 30 * 24 * 60 * 60 * 1000; /* 30 天 */
	const payload = Buffer.from(JSON.stringify({ exp, v: 2, uid: userId }), 'utf8').toString('base64url');
	const sig = createHmac('sha256', s).update(payload).digest('base64url');
	return `${payload}.${sig}`;
}

export type GuestSessionInfo = { ok: boolean; userId: number };

export function readGuestSession(token: string | undefined): GuestSessionInfo {
	if (!token?.includes('.')) return { ok: false, userId: 0 };
	let s: string;
	try {
		s = secret();
	} catch {
		return { ok: false, userId: 0 };
	}
	const dot = token.lastIndexOf('.');
	const payload = token.slice(0, dot);
	const sig = token.slice(dot + 1);
	const expected = createHmac('sha256', s).update(payload).digest('base64url');
	if (expected.length !== sig.length) return { ok: false, userId: 0 };
	try {
		if (!timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(sig, 'utf8')))
			return { ok: false, userId: 0 };
	} catch {
		return { ok: false, userId: 0 };
	}
	try {
		const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
			exp: number;
			v?: number;
			uid?: number;
		};
		if (typeof data.exp !== 'number' || data.exp < Date.now()) return { ok: false, userId: 0 };
		const uid = typeof data.uid === 'number' && data.uid > 0 ? data.uid : 0;
		if (!uid) return { ok: false, userId: 0 };
		return { ok: true, userId: uid };
	} catch {
		return { ok: false, userId: 0 };
	}
}
