<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>社团新闻 · Fantasy动漫社</title>
</svelte:head>

<h1>社团新闻</h1>
<p class="page-intro">活动报道、招新回顾与社团动态。</p>

<div class="news-list">
	{#each data.items as n}
		<a class="news-card card" href="/news/{n.id}">
			{#if n.cover_image}
				<div class="news-cover">
					<img src={n.cover_image} alt="" />
				</div>
			{/if}
			<div class="news-card-body">
				<h2>{n.title}</h2>
				<p class="news-summary">{n.summary}</p>
				<time datetime={n.created_at}>{n.created_at}</time>
			</div>
		</a>
	{:else}
		<p class="card">暂无新闻，敬请期待。</p>
	{/each}
</div>

<style>
	.page-intro {
		color: var(--muted);
		margin: -0.25rem 0 1.5rem;
	}
	.news-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.news-card {
		display: grid;
		grid-template-columns: minmax(0, 140px) 1fr;
		gap: 1rem;
		align-items: stretch;
		padding: 0;
		overflow: hidden;
		color: inherit;
		transition: transform 0.2s ease, border-color 0.2s ease;
	}
	.news-card:hover {
		transform: translateY(-2px);
		border-color: rgba(167, 139, 250, 0.35);
		text-decoration: none;
		color: inherit;
	}
	@media (max-width: 520px) {
		.news-card {
			grid-template-columns: 1fr;
		}
	}
	.news-cover {
		background: var(--bg-elevated);
		min-height: 100px;
	}
	.news-cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		min-height: 120px;
	}
	.news-card-body {
		padding: 1rem 1.25rem 1.1rem;
	}
	.news-card h2 {
		margin: 0 0 0.5rem;
		font-size: 1.1rem;
		color: var(--text);
	}
	.news-summary {
		margin: 0 0 0.65rem;
		font-size: 0.9rem;
		color: var(--muted);
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	time {
		font-size: 0.8rem;
		color: var(--muted);
	}
</style>
