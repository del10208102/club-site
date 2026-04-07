<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>信息公示 · Fantasy动漫社</title>
</svelte:head>

<h1>信息公示</h1>
<p class="page-intro">通知公告目录，点击查看完整内容与排版。</p>

<ul class="ann-index">
	{#each data.items as a}
		<li>
			<a class="ann-row card" href="/announcements/{a.id}">
				<div>
					<h2 class="ann-title">{a.title}</h2>
					<p class="ann-excerpt">{a.list_excerpt}</p>
					<time class="ann-time" datetime={a.created_at}>{a.created_at}</time>
				</div>
				<span class="ann-go">查看 →</span>
			</a>
		</li>
	{:else}
		<li class="card">暂无公告。</li>
	{/each}
</ul>

<style>
	.page-intro {
		color: var(--muted);
		margin: -0.25rem 0 1.25rem;
		font-size: 0.95rem;
	}
	.ann-index {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}
	.ann-row {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		padding: 1.1rem 1.25rem;
		color: inherit;
	}
	.ann-row:hover {
		border-color: rgba(183, 148, 246, 0.4);
		text-decoration: none;
		color: inherit;
	}
	.ann-title {
		margin: 0 0 0.4rem;
		font-size: 1.08rem;
		font-weight: 600;
	}
	.ann-excerpt {
		margin: 0 0 0.5rem;
		font-size: 0.9rem;
		color: var(--muted);
		line-height: 1.55;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.ann-time {
		font-size: 0.8rem;
		color: var(--muted);
	}
	.ann-go {
		flex-shrink: 0;
		font-weight: 600;
		color: var(--accent);
	}
</style>
