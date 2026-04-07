<script lang="ts">
	let department = $state('');
	let author = $state('');
	let title = $state('');
	let description = $state('');
	let fileInput: HTMLInputElement | undefined = $state();
	let err = $state('');
	let loading = $state(false);

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
		fd.set('work_kind', 'literary');
		fd.set('department', department);
		fd.set('author', author);
		fd.set('title', title);
		fd.set('description', description);
		fd.set('file', f);
		const r = await fetch('/api/works', { method: 'POST', body: fd, credentials: 'include' });
		loading = false;
		if (!r.ok) {
			try {
				const j = await r.json();
				err = j.message ?? '上传失败';
			} catch {
				err = '上传失败';
			}
			return;
		}
		const j = await r.json();
		if (typeof j.id === 'number') {
			window.location.href = `/admin/works/${j.id}/edit`;
		}
	}
</script>

<svelte:head>
	<title>上传文字类作品 · 管理</title>
</svelte:head>

<p class="back"><a href="/admin/works">← 返回作品管理</a></p>
<h1>上传文字类作品</h1>

<div class="admin-help card">
	<h2 class="section-title">填写说明</h2>
	<ul>
		<li><strong>部门</strong>：如「宣策部」「COS 部」等。</li>
		<li><strong>作者</strong>：社员昵称或署名。</li>
		<li><strong>题目</strong>：作品标题。</li>
		<li>
			<strong>文件</strong>：支持常见图片、<strong>Word（.docx）</strong>、<strong>MP3</strong> 等；Word 会转为网页正文。
		</li>
	</ul>
</div>

<form class="work-form card" onsubmit={submit}>
	<div class="field-grid">
		<div>
			<label for="dept">部门 <span class="req">*</span></label>
			<input id="dept" type="text" bind:value={department} required placeholder="例如：宣策部" />
		</div>
		<div>
			<label for="auth">作者 <span class="req">*</span></label>
			<input id="auth" type="text" bind:value={author} required placeholder="社员署名" />
		</div>
	</div>

	<label for="tit">题目 <span class="req">*</span></label>
	<input id="tit" type="text" bind:value={title} required placeholder="作品标题" />

	<label for="desc">简介（可选）</label>
	<input id="desc" type="text" bind:value={description} placeholder="一句话介绍" />

	<label for="file">选择文件 <span class="req">*</span></label>
	<input
		id="file"
		type="file"
		bind:this={fileInput}
		accept="image/*,.doc,.docx,audio/mpeg,audio/mp3,.mp3"
		required
	/>

	<p class="form-actions">
		<button type="submit" disabled={loading}>{loading ? '上传中…' : '提交作品'}</button>
	</p>
	{#if err}<p class="err">{err}</p>{/if}
</form>

<style>
	.back {
		margin: 0 0 0.75rem;
		font-size: 0.9rem;
	}
	.section-title {
		margin: 0 0 0.75rem;
		font-size: 1rem;
		font-weight: 600;
	}
	.admin-help {
		margin-bottom: 1.25rem;
	}
	.admin-help ul {
		margin: 0;
		padding-left: 1.2rem;
		color: var(--muted);
		font-size: 0.9rem;
		line-height: 1.65;
	}
	.field-grid {
		display: grid;
		gap: 1rem;
		grid-template-columns: 1fr 1fr;
		margin-bottom: 0.5rem;
	}
	@media (max-width: 520px) {
		.field-grid {
			grid-template-columns: 1fr;
		}
	}
	.req {
		color: var(--accent-soft);
		font-weight: 600;
	}
	.form-actions {
		margin-top: 1.25rem;
	}
	.work-form label {
		margin-top: 0.75rem;
	}
	.work-form label:first-of-type {
		margin-top: 0;
	}
</style>
