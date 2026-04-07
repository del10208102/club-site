import { env } from '$env/dynamic/private';

/** 若设置了 ADMIN_SECRET，则写入类接口需携带相同密钥（表单字段 admin_token 或请求头 x-admin-secret） */
export function checkAdmin(request: Request, form?: FormData): boolean {
	const secret = env.ADMIN_SECRET;
	if (!secret) return true;
	const header = request.headers.get('x-admin-secret');
	const fromForm = form?.get('admin_token');
	return header === secret || fromForm === secret;
}
