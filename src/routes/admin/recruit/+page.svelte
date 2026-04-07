<script lang="ts">
	let { data } = $props();
	let content = $state('');
	let err = $state('');
	let ok = $state(false);

	$effect(() => {
		content = data.content;
	});

	async function save(e: Event) {
		e.preventDefault();
		err = '';
		ok = false;
		const fd = new FormData();
		fd.set('content', content);
		const r = await fetch('/api/recruit', { method: 'PUT', body: fd, credentials: 'include' });
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
	<title>编辑招新 · 管理</title>
</svelte:head>

<h1>编辑招新说明</h1>

<form onsubmit={save} class="card">
	<label for="c">招新说明（纯文本，可换行）</label>
	<textarea id="c" bind:value={content} rows="14"></textarea>

	<p style="margin-top: 1rem;">
		<button type="submit">保存</button>
	</p>
	{#if err}<p class="err">{err}</p>{/if}
	{#if ok}<p class="ok">已保存。</p>{/if}
</form>
