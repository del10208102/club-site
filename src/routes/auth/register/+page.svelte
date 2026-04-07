<script lang="ts">
	import { goto } from '$app/navigation';

	let username = $state('');
	let password = $state('');
	let password2 = $state('');
	let err = $state('');
	let loading = $state(false);

	async function submit(e: Event) {
		e.preventDefault();
		err = '';
		if (password !== password2) {
			err = '两次输入的密码不一致';
			return;
		}
		loading = true;
		const r = await fetch('/api/auth/guest/register', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password })
		});
		loading = false;
		if (!r.ok) {
			try {
				const j = await r.json();
				err = j.message ?? '注册失败';
			} catch {
				err = '注册失败';
			}
			return;
		}
		await goto('/auth/login?registered=1');
	}
</script>

<svelte:head>
	<title>访客注册 · Fantasy动漫社</title>
</svelte:head>

<h1>访客注册</h1>
<p class="card intro">
	注册后可对本站作品<strong>点赞</strong>与<strong>评论</strong>（评论需管理员审核后显示）。请使用独立密码，勿与常用重要账号相同。
</p>

<form class="card auth-form" onsubmit={submit}>
	<label for="u">用户名</label>
	<input id="u" type="text" autocomplete="username" bind:value={username} required minlength="2" maxlength="32" />

	<label for="p">密码（至少 8 位）</label>
	<input id="p" type="password" autocomplete="new-password" bind:value={password} required minlength="8" />

	<label for="p2">确认密码</label>
	<input id="p2" type="password" autocomplete="new-password" bind:value={password2} required minlength="8" />

	<p class="actions">
		<button type="submit" disabled={loading}>{loading ? '提交中…' : '注册'}</button>
	</p>
	{#if err}<p class="err">{err}</p>{/if}
	<p class="foot">
		已有账号？<a href="/auth/login">访客登录</a>
	</p>
</form>

<style>
	.intro {
		font-size: 0.9rem;
		color: var(--muted);
		line-height: 1.65;
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
