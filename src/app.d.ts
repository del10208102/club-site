// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {
		interface Locals {
			admin: boolean;
			/** 当前登录管理员账号（旧会话可能为空字符串） */
			adminUser: string;
			/** 已登录访客（未登录为 null） */
			guest: { id: number; username: string } | null;
		}
	}
}

export {};
