#!/usr/bin/env node
import bcrypt from 'bcryptjs';

const p = process.argv[2];
if (!p) {
	console.error('用法: node scripts/hash-password.mjs <你的密码>');
	console.error('将输出的哈希写入服务器 .env 的 ADMIN_PASSWORD_HASH=');
	process.exit(1);
}
console.log(bcrypt.hashSync(p, 10));
