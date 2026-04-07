<script lang="ts">
	let title = $state('');
	let summary = $state('');
	let body = $state('');
	let cover_image = $state('');
	let err = $state('');
	let ok = $state(false);

	async function submit(e: Event) {
		e.preventDefault();
		err = '';
		ok = false;
		const fd = new FormData();
		fd.set('title', title);
		fd.set('summary', summary);
		fd.set('body', body);
		fd.set('cover_image', cover_image);
		const r = await fetch('/api/news', { method: 'POST', body: fd, credentials: 'include' });
		let j: { message?: string; id?: number } = {};
		try {
			j = await r.json();
		} catch {
			/* empty */
		}
		if (!r.ok) {
			err = j.message ?? '发布失败';
			return;
		}
		title = '';
		summary = '';
		body = '';
		cover_image = '';
		ok = true;
		if (j.id) window.location.href = `/news/${j.id}`;
	}
</script>

<svelte:head>
	<title>发布新闻 · 管理</title>
</svelte:head>

<h1>发布新闻</h1>
<p class="card" style="color: var(--muted); font-size: 0.9rem;">
	新闻全文保存在 <code>data/site.json</code> 的 <code>news</code> 列表中。封面图可填静态资源路径，例如把图片放到
	<code>static/images/</code> 后填写 <code>/images/xxx.png</code>。
</p>

<form onsubmit={submit} class="card">
	<label for="t">标题</label>
	<input id="t" type="text" bind:value={title} required />

	<label for="s">摘要（列表页显示，可空则自动截取标题）</label>
	<input id="s" type="text" bind:value={summary} />

	<label for="c">封面图路径（可选）</label>
	<input id="c" type="text" bind:value={cover_image} placeholder="/images/cover.png" />

	<label for="b">正文</label>
	<textarea id="b" bind:value={body} rows="16" required placeholder="支持多段文字，换行即可。"></textarea>

	<p style="margin-top: 1rem;">
		<button type="submit">发布</button>
	</p>
	{#if err}<p class="err">{err}</p>{/if}
	{#if ok}<p class="ok">已发布。</p>{/if}
</form>
