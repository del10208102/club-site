<script lang="ts">
	let { data } = $props();
	let title = $state('');
	let description = $state('');
	let adminToken = $state('');
	let fileInput: HTMLInputElement | undefined = $state();
	let err = $state('');
	let loading = $state(false);

	function fileUrl(stored: string) {
		return `/files/${encodeURIComponent(stored)}`;
	}

	function isImage(m: string) {
		return m.startsWith('image/');
	}
	function isVideo(m: string) {
		return m.startsWith('video/');
	}

	async function submit(e: Event) {
		e.preventDefault();
		err = '';
		const f = fileInput?.files?.[0];
		if (!f) {
			err = '请选择文件';
			return;
		}
		loading = true;
		const fd = new FormData();
		fd.set('title', title);
		fd.set('description', description);
		fd.set('file', f);
		if (adminToken) fd.set('admin_token', adminToken);
		const r = await fetch('/api/works', { method: 'POST', body: fd });
		loading = false;
		if (!r.ok) {
			try {
				const j = await r.json();
				err = j.message ?? r.statusText;
			} catch {
				err = '上传失败';
			}
			return;
		}
		title = '';
		description = '';
		if (fileInput) fileInput.value = '';
		window.location.reload();
	}
</script>

<h1>作品展示</h1>

<div class="grid">
	{#each data.items as w}
		<div class="card">
			<h2 style="margin: 0 0 0.5rem; font-size: 1rem;">{w.title}</h2>
			{#if w.description}
				<p style="margin: 0 0 0.75rem; font-size: 0.9rem; color: var(--muted);">{w.description}</p>
			{/if}
			<div class="work-thumb">
				{#if isImage(w.mime)}
					<img src={fileUrl(w.stored_name)} alt={w.original_name} />
				{:else if isVideo(w.mime)}
					<!-- svelte-ignore a11y_media_has_caption -->
					<video src={fileUrl(w.stored_name)} controls preload="metadata"></video>
				{:else}
					<a href={fileUrl(w.stored_name)} class="btn secondary">下载 {w.original_name}</a>
				{/if}
			</div>
			<p style="margin: 0.5rem 0 0; font-size: 0.8rem; color: var(--muted);">{w.created_at}</p>
		</div>
	{:else}
		<p class="card">暂无作品，欢迎上传。</p>
	{/each}
</div>

<h2>上传作品</h2>
<p style="color: var(--muted); font-size: 0.9rem;">
	支持常见图片、PDF、MP4、ZIP，单文件最大 20MB。若配置了 <code>ADMIN_SECRET</code> 请填写密钥。
</p>
<form onsubmit={submit} class="card">
	<label for="title">标题</label>
	<input id="title" type="text" bind:value={title} required />

	<label for="desc">简介（可选）</label>
	<input id="desc" type="text" bind:value={description} />

	<label for="file">文件</label>
	<input id="file" type="file" bind:this={fileInput} required />

	<label for="adm">管理密钥（可选）</label>
	<input id="adm" type="password" bind:value={adminToken} autocomplete="off" />

	<p style="margin-top: 1rem;">
		<button type="submit" disabled={loading}>{loading ? '上传中…' : '上传'}</button>
	</p>
	{#if err}<p class="err">{err}</p>{/if}
</form>
