<script lang="ts">
	import RichEditor from '$lib/components/RichEditor.svelte';
	let { data } = $props();

	let title = $state('');
	let department = $state('');
	let author = $state('');
	let description = $state('');
	let html = $state('');
	let err = $state('');
	let ok = $state(false);

	$effect(() => {
		title = data.work.title;
		department = data.work.department;
		author = data.work.author;
		description = data.work.description;
	});

	async function saveAll(e: Event) {
		e.preventDefault();
		err = '';
		ok = false;
		const r = await fetch(`/api/works/${data.work.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({
				title,
				department,
				author,
				description,
				content_html: html
			})
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
	<title>编辑作品 · 管理</title>
</svelte:head>

<p class="back"><a href="/admin/works">← 返回作品管理</a></p>
<h1>编辑作品 · {data.work.title}</h1>

<p class="card edit-hint">
	{#if data.work.work_kind === 'art'}
		画作以主图展示；下方可编辑<strong>创作手记 / 说明文字</strong>（可选），支持插图与排版。
	{:else}
		可修改<strong>元信息</strong>与<strong>正文</strong>（Word 上传后的 HTML）。支持标题、加粗、列表、引用与<strong>插入图片</strong>。
	{/if}
	保存后访客在作品详情页可见。
</p>

<form class="card" onsubmit={saveAll}>
	<h2 class="section-h">基本信息</h2>
	<div class="field-grid">
		<div>
			<label for="t">题目 <span class="req">*</span></label>
			<input id="t" type="text" bind:value={title} required />
		</div>
		<div>
			<label for="dept">部门 <span class="req">*</span></label>
			<input id="dept" type="text" bind:value={department} required />
		</div>
	</div>
	<div class="field-grid">
		<div>
			<label for="auth">作者 <span class="req">*</span></label>
			<input id="auth" type="text" bind:value={author} required />
		</div>
		<div>
			<label for="desc">简介</label>
			<input id="desc" type="text" bind:value={description} placeholder="可选" />
		</div>
	</div>

	<h2 class="section-h">正文与排版</h2>
	<label for="ed">正文（富文本）</label>
	{#key data.work.id}
		<RichEditor initialHtml={data.work.content_html ?? ''} onChange={(h) => (html = h)} />
	{/key}

	<p class="actions">
		<button type="submit">保存全部</button>
		<a class="btn secondary" href="/works/{data.work.id}" style="display: inline-block; margin-left: 0.5rem;">预览访客页</a>
	</p>
	{#if err}<p class="err">{err}</p>{/if}
	{#if ok}<p class="ok">已保存。</p>{/if}
</form>

<style>
	.back {
		margin: 0 0 0.75rem;
		font-size: 0.9rem;
	}
	.edit-hint {
		font-size: 0.9rem;
		color: var(--muted);
		line-height: 1.65;
		margin-bottom: 1rem;
	}
	.section-h {
		margin: 0 0 0.75rem;
		font-size: 1rem;
		font-weight: 600;
		color: var(--accent-soft);
		border-bottom: 1px solid var(--border);
		padding-bottom: 0.4rem;
	}
	form > .section-h:not(:first-of-type) {
		margin-top: 1.35rem;
	}
	.field-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin-bottom: 0.5rem;
	}
	@media (max-width: 560px) {
		.field-grid {
			grid-template-columns: 1fr;
		}
	}
	.req {
		color: var(--accent-soft);
		font-weight: 600;
	}
	.actions {
		margin-top: 1.25rem;
	}
	form label {
		margin-top: 0.65rem;
	}
</style>
