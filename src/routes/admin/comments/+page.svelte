<script lang="ts">
	let { data } = $props();

	let err = $state('');
	let busyId = $state<number | null>(null);

	async function setStatus(id: number, status: 'approved' | 'rejected') {
		err = '';
		busyId = id;
		const r = await fetch(`/api/admin/comments/${id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ status })
		});
		busyId = null;
		if (!r.ok) {
			try {
				const j = await r.json();
				err = j.message ?? '操作失败';
			} catch {
				err = '操作失败';
			}
			return;
		}
		location.reload();
	}
</script>

<svelte:head>
	<title>评论审核 · 管理</title>
</svelte:head>

<h1>评论审核</h1>
<p class="card intro">以下为待审核评论；通过后将在对应作品页展示，拒绝则不予公开。</p>

{#if err}<p class="err">{err}</p>{/if}

{#if data.pending.length === 0}
	<p class="card empty">暂无待审核评论。</p>
{:else}
	<ul class="mod-list">
		{#each data.pending as c (c.id)}
			<li class="card mod-item">
				<p class="mod-meta">
					<strong>{c.username}</strong>
					<span class="work-title">《{c.work_title}》</span>
					<time datetime={c.created_at}>{c.created_at}</time>
				</p>
				<p class="mod-body">{c.body}</p>
				<p class="mod-actions">
					<button
						type="button"
						disabled={busyId === c.id}
						onclick={() => setStatus(c.id, 'approved')}>通过</button
					>
					<button type="button" class="secondary" disabled={busyId === c.id} onclick={() => setStatus(c.id, 'rejected')}
						>拒绝</button
					>
					<a class="btn secondary" href="/works/{c.work_id}">查看作品</a>
				</p>
			</li>
		{/each}
	</ul>
{/if}

<style>
	.intro {
		font-size: 0.9rem;
		color: var(--muted);
		line-height: 1.6;
		margin-bottom: 1rem;
	}
	.empty {
		color: var(--muted);
	}
	.mod-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.mod-meta {
		margin: 0 0 0.5rem;
		font-size: 0.85rem;
		color: var(--muted);
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem 0.75rem;
		align-items: baseline;
	}
	.work-title {
		color: var(--accent-soft);
		font-weight: 600;
	}
	.mod-body {
		margin: 0 0 0.75rem;
		font-size: 0.92rem;
		line-height: 1.6;
		white-space: pre-wrap;
		word-break: break-word;
	}
	.mod-actions {
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: center;
	}
</style>
