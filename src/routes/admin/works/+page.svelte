<script lang="ts">
	let { data } = $props();

	let err = $state('');
	let busyId = $state<number | null>(null);

	async function remove(id: number) {
		if (!confirm('确定删除该作品？附件文件将一并删除，且不可恢复。')) return;
		err = '';
		busyId = id;
		const r = await fetch(`/api/works/${id}`, { method: 'DELETE', credentials: 'include' });
		busyId = null;
		if (!r.ok) {
			try {
				const j = await r.json();
				err = j.message ?? '删除失败';
			} catch {
				err = '删除失败';
			}
			return;
		}
		location.reload();
	}
</script>

<svelte:head>
	<title>作品管理 · 管理</title>
</svelte:head>

<h1>作品管理</h1>
<p class="card intro">
	以下为已发布作品。您只能删除或编辑<strong>本人账号上传</strong>的作品（旧数据无归属时，所有管理员均可管理）。正文排版请进入「编辑」。
</p>

<p class="quick-links">
	<a class="btn" href="/admin/works/literary">上传文字类作品</a>
	<a class="btn secondary" href="/admin/works/art">上传画作</a>
</p>

{#if err}<p class="err">{err}</p>{/if}

<ul class="work-admin-list">
	{#each data.items as w}
		<li class="card row">
			<div class="row-main">
				<div class="row-title">
					<span class="kind">{w.work_kind === 'art' ? '画作' : '文字'}</span>
					<strong>{w.title}</strong>
				</div>
				<p class="meta">{w.department} · {w.author} · {w.created_at}</p>
			</div>
			<div class="row-actions">
				{#if w.can_manage}
					<a class="btn secondary sm" href="/works/{w.id}">预览</a>
					<a class="btn secondary sm" href="/admin/works/{w.id}/edit">编辑</a>
					<button type="button" class="danger sm" disabled={busyId === w.id} onclick={() => remove(w.id)}>
						{busyId === w.id ? '删除中…' : '删除'}
					</button>
				{:else}
					<span class="muted">无权限</span>
				{/if}
			</div>
		</li>
	{:else}
		<li class="card">暂无作品，请先上传。</li>
	{/each}
</ul>

<style>
	.intro {
		font-size: 0.9rem;
		color: var(--muted);
		line-height: 1.6;
		margin-bottom: 1rem;
	}
	.quick-links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.65rem;
		margin-bottom: 1.25rem;
	}
	.work-admin-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 0;
	}
	.row-main {
		flex: 1;
		min-width: 0;
	}
	.row-title {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.35rem;
	}
	.kind {
		font-size: 0.72rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		padding: 0.12rem 0.45rem;
		border-radius: 999px;
		background: rgba(183, 148, 246, 0.15);
		border: 1px solid rgba(183, 148, 246, 0.25);
		color: var(--accent-soft);
	}
	.meta {
		margin: 0;
		font-size: 0.85rem;
		color: var(--muted);
	}
	.row-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.45rem;
	}
	.btn.sm,
	button.sm {
		padding: 0.35rem 0.75rem;
		font-size: 0.85rem;
	}
	button.danger {
		background: rgba(240, 168, 168, 0.12);
		border: 1px solid rgba(240, 168, 168, 0.35);
		color: var(--danger);
		cursor: pointer;
		border-radius: var(--radius-sm);
		font: inherit;
	}
	button.danger:hover:not(:disabled) {
		background: rgba(240, 168, 168, 0.2);
	}
	.muted {
		font-size: 0.85rem;
		color: var(--muted);
	}
</style>
