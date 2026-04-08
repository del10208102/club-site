<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';

	let { data } = $props();

	let username = $state('');
	let password = $state('');
	let err = $state('');
	let loading = $state(false);

	async function submit(e: Event) {
		e.preventDefault();
		err = '';
		loading = true;
		const redirectTo = page.url.searchParams.get('redirectTo') ?? '';
		let r: Response;
		try {
			r = await fetch('/api/auth/admin/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					username,
					password,
					...(redirectTo.startsWith('/') && !redirectTo.startsWith('//')
						? { redirectTo }
						: {})
				})
			});
		} catch {
			loading = false;
			err = '网络错误，请检查连接后重试。';
			return;
		}
		loading = false;

		if (!r.ok) {
			const text = await r.text();
			let msg = '登录失败';
			try {
				const j = JSON.parse(text) as { message?: string };
				msg = j.message ?? msg;
			} catch {
				if (text.trim()) msg = text.trim().slice(0, 200);
			}
			err = msg;
			return;
		}

		await invalidateAll();
		const j = (await r.json()) as { redirectTo?: string };
		const dest =
			typeof j.redirectTo === 'string' && j.redirectTo.startsWith('/') && !j.redirectTo.startsWith('//')
				? j.redirectTo
				: '/admin';
		await goto(dest, { replaceState: true });
	}
</script>

<svelte:head>
	<title>管理员登录 · Fantasy动漫社</title>
</svelte:head>

<div class="login-wrap">
	<div class="login-card card">
		<h1 class="login-title">管理员登录</h1>
		<p class="login-hint">Fantasy动漫社 · 浙江大学</p>
		{#if data.devDefaultLogin}
			<p class="login-dev">
				本地开发未配置密码时，可使用默认账号 <code>admin</code> / <code>fantasy2026</code>。上线前请在
				<code>.env</code> 中设置 <code>ADMIN_PASSWORD</code> 或 <code>ADMIN_PASSWORD_HASH</code>。
			</p>
		{/if}
		<form class="auth-form" onsubmit={submit}>
			<label for="u">账号</label>
			<input
				id="u"
				name="username"
				type="text"
				autocomplete="username"
				required
				placeholder="admin"
				bind:value={username}
			/>

			<label for="p">密码</label>
			<input
				id="p"
				name="password"
				type="password"
				autocomplete="current-password"
				required
				bind:value={password}
			/>

			<p style="margin-top: 1.25rem;">
				<button type="submit" disabled={loading}>{loading ? '登录中…' : '登录'}</button>
			</p>
			{#if err}<p class="err" role="alert">{err}</p>{/if}
		</form>
		<p class="login-foot"><a href="/">返回首页</a></p>
	</div>
</div>

<style>
	.login-wrap {
		min-height: 60vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem 0;
	}
	.login-card {
		width: 100%;
		max-width: 24rem;
	}
	.login-title {
		margin: 0 0 0.35rem;
		font-size: 1.35rem;
	}
	.login-hint {
		margin: 0 0 1rem;
		font-size: 0.85rem;
		color: var(--muted);
	}
	.login-dev {
		font-size: 0.8rem;
		line-height: 1.55;
		color: var(--muted);
		background: rgba(183, 148, 246, 0.08);
		border: 1px solid rgba(183, 148, 246, 0.2);
		border-radius: var(--radius-sm);
		padding: 0.65rem 0.75rem;
		margin: 0 0 1rem;
	}
	.login-foot {
		margin: 1.25rem 0 0;
		font-size: 0.9rem;
		text-align: center;
	}
</style>
