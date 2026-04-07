<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>作品展示 · Fantasy动漫社</title>
</svelte:head>

<h1>作品展示</h1>
<p class="page-intro">以下为社团作品目录，点选条目查看全文与附件。</p>

<ul class="work-index">
	{#each data.items as w}
		<li>
			<a class="work-row card" href="/works/{w.id}">
				<div class="work-row-main">
					<h2 class="work-row-title">
						<span class="kind-pill">{w.work_kind === 'art' ? '画作' : '文字'}</span>
						{w.title}
					</h2>
					<p class="work-row-excerpt">{w.list_excerpt}</p>
					<div class="work-row-meta">
						<span class="pill">{w.department || '—'}</span>
						<span class="work-row-author">{w.author || '—'}</span>
						<time datetime={w.created_at}>{w.created_at}</time>
					</div>
				</div>
				<span class="work-row-go">查看 →</span>
			</a>
		</li>
	{:else}
		<li class="card">暂无作品。</li>
	{/each}
</ul>

<style>
	.page-intro {
		color: var(--muted);
		margin: -0.25rem 0 1.25rem;
		font-size: 0.95rem;
	}
	.work-index {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}
	.work-row {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		padding: 1.1rem 1.25rem;
		color: inherit;
		transition: border-color 0.2s ease, transform 0.15s ease;
	}
	.work-row:hover {
		border-color: rgba(183, 148, 246, 0.4);
		transform: translateY(-1px);
		text-decoration: none;
		color: inherit;
	}
	.work-row-main {
		flex: 1;
		min-width: 0;
	}
	.work-row-title {
		margin: 0 0 0.45rem;
		font-size: 1.08rem;
		font-weight: 600;
		color: var(--text);
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.45rem;
	}
	.kind-pill {
		flex-shrink: 0;
		font-size: 0.68rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 0.1rem 0.4rem;
		border-radius: 999px;
		background: rgba(183, 148, 246, 0.14);
		border: 1px solid rgba(183, 148, 246, 0.28);
		color: var(--accent-soft);
	}
	.work-row-excerpt {
		margin: 0 0 0.65rem;
		font-size: 0.9rem;
		color: var(--muted);
		line-height: 1.55;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.work-row-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 0.85rem;
		font-size: 0.8rem;
		color: var(--muted);
	}
	.pill {
		display: inline-block;
		padding: 0.12rem 0.5rem;
		border-radius: 999px;
		background: rgba(183, 148, 246, 0.12);
		border: 1px solid rgba(183, 148, 246, 0.22);
		color: var(--accent-soft);
		font-size: 0.75rem;
	}
	.work-row-author::before {
		content: '作者：';
		opacity: 0.75;
	}
	.work-row-go {
		flex-shrink: 0;
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--accent);
		padding-top: 0.15rem;
	}
</style>
