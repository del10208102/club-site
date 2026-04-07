import { env } from '$env/dynamic/private';
import bcrypt from 'bcryptjs';

const DEV_DEFAULT_USER = 'admin';
const DEV_DEFAULT_PASS = 'fantasy2026';

/** 校验管理员账号密码（生产环境请使用 ADMIN_PASSWORD_HASH） */
export function verifyAdminCredentials(username: string, password: string): boolean {
	const expectedUser = (env.ADMIN_USERNAME ?? DEV_DEFAULT_USER).trim();
	if (username.trim() !== expectedUser) return false;

	const hash = env.ADMIN_PASSWORD_HASH?.trim();
	if (hash) {
		try {
			return bcrypt.compareSync(password, hash);
		} catch {
			return false;
		}
	}

	const plain = env.ADMIN_PASSWORD?.trim();
	if (plain) {
		return password === plain;
	}

	/* 未配置任何密码时：开发环境使用默认账号，便于开箱测试 */
	if (process.env.NODE_ENV !== 'production') {
		return password === DEV_DEFAULT_PASS;
	}

	return false;
}

/** 登录页提示用：是否在无配置时使用开发默认密码 */
export function usingDevDefaultPassword(): boolean {
	const hasHash = !!env.ADMIN_PASSWORD_HASH?.trim();
	const hasPlain = !!env.ADMIN_PASSWORD?.trim();
	return process.env.NODE_ENV !== 'production' && !hasHash && !hasPlain;
}
