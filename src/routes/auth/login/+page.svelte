<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';

	let username = $state('');
	let password = $state('');
	let err = $state('');
	let loading = $state(false);
	let okMsg = $state('');

	const registered = $derived(page.url.searchParams.get('registered') === '1');

	async function submit(e: Event) {
		e.preventDefault();
		err = '';
		okMsg = '';
		loading = true;
		let r: Response;
		try {
			r = await fetch('/api/auth/guest/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ username, password })
			});
		} catch (netErr) {
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

		okMsg = '登录成功，正在跳转…';
		await invalidateAll();
		const redir = page.url.searchParams.get('redirectTo');
		await goto(redir && redir.startsWith('/') && !redir.startsWith('//') ? redir : '/', {
			replaceState: true
		});
	}
</script>

<svelte:head>
	<title>访客登录 · Fantasy动漫社</title>
</svelte:head>

<h1>访客登录</h1>

{#if registered}
	<p class="card ok-banner">注册成功，请登录。</p>
{/if}

<form class="card auth-form" onsubmit={submit}>
	<label for="u">用户名</label>
	<input id="u" type="text" autocomplete="username" bind:value={username} required />

	<label for="p">密码</label>
	<input id="p" type="password" autocomplete="current-password" bind:value={password} required />

	<p class="actions">
		<button type="submit" disabled={loading}>{loading ? '登录中…' : '登录'}</button>
	</p>
	{#if okMsg}<p class="ok">{okMsg}</p>{/if}
	{#if err}<p class="err" role="alert">{err}</p>{/if}
	<p class="foot">
		没有账号？<a href="/auth/register">注册</a>
		· <a href="/login">管理员入口</a>
	</p>
</form>

<style>
	.ok-banner {
		color: var(--muted);
		font-size: 0.92rem;
		margin-bottom: 1rem;
	}
	.ok {
		color: var(--accent-soft);
		font-size: 0.92rem;
		margin: 0.5rem 0 0;
	}
	.actions {
		margin-top: 1rem;
	}
	.foot {
		margin: 1rem 0 0;
		font-size: 0.9rem;
		color: var(--muted);
	}
</style>
