import { basename, dirname, isAbsolute, join, resolve } from 'node:path';
import { env } from '$env/dynamic/private';

/**
 * 项目根目录。
 *
 * 生产环境用 systemd/pm2 启动时，若 `cwd` 不是项目根目录，相对路径 `data/`、`uploads/`
 * 会写到错误位置，表现为：首页轮播为空、访客无法登录（库在另一份 `site.json`）、上传 404。
 *
 * 解析顺序：`PROJECT_ROOT` 环境变量 → 入口为 `…/build/index.js` 时取上一级 → `process.cwd()`。
 */
export function getProjectRoot(): string {
	const fromEnv = env.PROJECT_ROOT?.trim();
	if (fromEnv) return resolve(fromEnv);

	const main = process.argv[1];
	if (main) {
		const scriptDir = dirname(resolve(main));
		if (basename(scriptDir) === 'build') {
			return resolve(scriptDir, '..');
		}
	}
	return process.cwd();
}

export function resolveDataDirectory(): string {
	const d = env.DATA_DIR?.trim();
	if (!d) return join(getProjectRoot(), 'data');
	if (isAbsolute(d)) return d;
	return join(getProjectRoot(), d);
}

export function resolveUploadDirectory(): string {
	const u = env.UPLOAD_DIR?.trim();
	if (!u) return join(getProjectRoot(), 'uploads');
	if (isAbsolute(u)) return u;
	return join(getProjectRoot(), u);
}
