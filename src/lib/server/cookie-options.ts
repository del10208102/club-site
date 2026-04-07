import { env } from '$env/dynamic/private';

/**
 * Set-Cookie 的 Secure 标志。
 *
 * 反代（Nginx）后面 Node 收到的 `request.url` 常为 `http://127.0.0.1:...`，若仅用 protocol 会误判为 http，
 * 与访客实际用 https 访问不一致，可能导致 Cookie 行为异常。
 *
 * 因此优先读取 `X-Forwarded-Proto`（请在 Nginx 中配置：`proxy_set_header X-Forwarded-Proto $scheme;`）。
 *
 * 可选：`.env` 中 `COOKIE_SECURE=0` 强制不加 Secure（仅 http 访问时）；`COOKIE_SECURE=1` 强制加 Secure。
 */
export function cookieSecureFromRequest(request: Request): boolean {
	const o = env.COOKIE_SECURE?.trim().toLowerCase();
	if (o === '0' || o === 'false') return false;
	if (o === '1' || o === 'true') return true;

	const fwd = request.headers.get('x-forwarded-proto');
	if (fwd) {
		const first = fwd.split(',')[0]?.trim().toLowerCase();
		if (first === 'https') return true;
		if (first === 'http') return false;
	}

	if (request.headers.get('x-forwarded-ssl') === 'on') return true;

	try {
		return new URL(request.url).protocol === 'https:';
	} catch {
		return false;
	}
}
