<script lang="ts">
	import RichEditor from '$lib/components/RichEditor.svelte';
	let { data } = $props();

	let title = $state('');
	let bodyHtml = $state('');
	let err = $state('');
	let ok = $state(false);

	$effect(() => {
		title = data.item.title;
	});

	async function submit(e: Event) {
		e.preventDefault();
		err = '';
		ok = false;
		const r = await fetch(`/api/announcements/${data.item.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ title, body_html: bodyHtml })
		});
		if (!r.ok) {
			try {
				const j = await r.json();
				err = j.message ?? '保存失败';
			} catch {
				err = '保存失败';
			}
			return;
		}
		ok = true;
	}
</script>

<svelte:head>
	<title>编辑公告 · 管理</title>
</svelte:head>

<h1>编辑公告</h1>

<form class="card" onsubmit={submit}>
	<label for="t">标题</label>
	<input id="t" type="text" bind:value={title} required />

	<label for="b">正文</label>
	{#key data.item.id}
		<RichEditor initialHtml={data.item.body_html} onChange={(h) => (bodyHtml = h)} />
	{/key}

	<p class="act">
		<button type="submit">保存</button>
		<a class="btn secondary" href="/announcements/{data.item.id}" style="display: inline-block; margin-left: 0.5rem;">预览</a>
	</p>
	{#if err}<p class="err">{err}</p>{/if}
	{#if ok}<p class="ok">已保存。</p>{/if}
</form>

<style>
	.act {
		margin-top: 1.25rem;
	}
	form label:nth-of-type(2) {
		margin-top: 0.75rem;
	}
</style>
