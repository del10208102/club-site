<script lang="ts">
	import RichEditor from '$lib/components/RichEditor.svelte';

	let title = $state('');
	let bodyHtml = $state('');
	let err = $state('');
	let ok = $state(false);

	async function submit(e: Event) {
		e.preventDefault();
		err = '';
		ok = false;
		const fd = new FormData();
		fd.set('title', title);
		fd.set('body_html', bodyHtml);
		const r = await fetch('/api/announcements', { method: 'POST', body: fd, credentials: 'include' });
		let j: { id?: number; message?: string } = {};
		try {
			j = await r.json();
		} catch {
			/* empty */
		}
		if (!r.ok) {
			err = j.message ?? '发布失败';
			return;
		}
		ok = true;
		if (typeof j.id === 'number') {
			window.location.href = `/announcements/${j.id}`;
		}
	}
</script>

<svelte:head>
	<title>新建公告 · 管理</title>
</svelte:head>

<h1>新建公告</h1>
<p class="card hint">使用下方编辑器排版正文（标题层级、列表、引用等），与主流论坛、文档站类似。</p>

<form class="card" onsubmit={submit}>
	<label for="t">标题</label>
	<input id="t" type="text" bind:value={title} required />

	<label for="body">正文</label>
	<RichEditor initialHtml="" onChange={(h) => (bodyHtml = h)} />

	<p class="act">
		<button type="submit">发布</button>
	</p>
	{#if err}<p class="err">{err}</p>{/if}
	{#if ok}<p class="ok">已发布。</p>{/if}
</form>

<style>
	.hint {
		font-size: 0.9rem;
		color: var(--muted);
		margin-bottom: 1rem;
		line-height: 1.6;
	}
	.act {
		margin-top: 1.25rem;
	}
	form label:last-of-type {
		margin-top: 0.75rem;
	}
</style>
