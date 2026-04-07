<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let username = $state('');
	let password = $state('');
	let err = $state('');
	let loading = $state(false);

	const registered = $derived(page.url.searchParams.get('registered') === '1');

	async function submit(e: Event) {
		e.preventDefault();
		err = '';
		loading = true;
		const r = await fetch('/api/auth/guest/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ username, password })
		});
		loading = false;
		if (!r.ok) {
			try {
				const j = await r.json();
				err = j.message ?? '登录失败';
			} catch {
				err = '登录失败';
			}
			return;
		}
		const redir = page.url.searchParams.get('redirectTo');
		await goto(redir && redir.startsWith('/') && !redir.startsWith('//') ? redir : '/');
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
	{#if err}<p class="err">{err}</p>{/if}
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
	.actions {
		margin-top: 1rem;
	}
	.foot {
		margin: 1rem 0 0;
		font-size: 0.9rem;
		color: var(--muted);
	}
</style>
