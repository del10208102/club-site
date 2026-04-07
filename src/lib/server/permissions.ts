import type { Work } from './store';

/** 无 owned_by 的旧作品：任意已登录管理员可管理；否则须为上传者本人 */
export function canManageWork(adminUser: string, work: Work): boolean {
	const o = work.owned_by?.trim();
	if (!o) return true;
	return o === adminUser.trim();
}
