<script lang="ts">
	let { data } = $props();
	let title = $state('');
	let body = $state('');
	let adminToken = $state('');
	let message = $state('');
	let err = $state('');

	async function submit(e: Event) {
		e.preventDefault();
		message = '';
		err = '';
		const fd = new FormData();
		fd.set('title', title);
		fd.set('body', body);
		if (adminToken) fd.set('admin_token', adminToken);
		const r = await fetch('/api/announcements', { method: 'POST', body: fd });
		if (!r.ok) {
			try {
				const j = await r.json();
				err = j.message ?? r.statusText;
			} catch {
				err = '发布失败';
			}
			return;
		}
		title = '';
		body = '';
		message = '已发布，请刷新页面查看。';
		window.location.reload();
	}
</script>

<h1>信息公示</h1>

{#each data.items as a}
	<article class="card">
		<h2 style="margin: 0 0 0.5rem; font-size: 1.1rem;">{a.title}</h2>
		<p style="white-space: pre-wrap; margin: 0;">{a.body}</p>
		<p style="margin: 0.75rem 0 0; color: var(--muted); font-size: 0.85rem;">{a.created_at}</p>
	</article>
{:else}
	<p class="card">暂无公告。</p>
{/each}

<h2>发布新公告</h2>
<p style="color: var(--muted); font-size: 0.9rem;">
	若服务器设置了环境变量 <code>ADMIN_SECRET</code>，请在下方填写相同的管理密钥。
</p>
<form onsubmit={submit} class="card">
	<label for="t">标题</label>
	<input id="t" type="text" bind:value={title} required />

	<label for="b">正文</label>
	<textarea id="b" bind:value={body}></textarea>

	<label for="adm">管理密钥（可选）</label>
	<input id="adm" type="password" bind:value={adminToken} autocomplete="off" />

	<p style="margin-top: 1rem;">
		<button type="submit">发布</button>
	</p>
	{#if err}<p class="err">{err}</p>{/if}
	{#if message}<p class="ok">{message}</p>{/if}
</form>
