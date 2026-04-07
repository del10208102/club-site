<script lang="ts">
	let { data } = $props();
	const n = $derived(data.item);
</script>

<svelte:head>
	<title>{n.title} · Fantasy动漫社</title>
</svelte:head>

<article class="news-article">
	<p class="back"><a href="/news">← 返回新闻列表</a></p>
	<header class="card news-header">
		<h1>{n.title}</h1>
		<time datetime={n.created_at}>{n.created_at}</time>
	</header>
	{#if n.cover_image}
		<div class="news-hero card" style="padding: 0; overflow: hidden;">
			<img src={n.cover_image} alt="" class="news-hero-img" />
		</div>
	{/if}
	<div class="card news-body">
		<div class="prose">{n.body}</div>
	</div>
</article>

<style>
	.back {
		margin: 0 0 1rem;
		font-size: 0.9rem;
	}
	.news-header h1 {
		margin: 0 0 0.5rem;
		font-size: clamp(1.35rem, 3vw, 1.75rem);
	}
	.news-header time {
		font-size: 0.85rem;
		color: var(--muted);
	}
	.news-hero-img {
		width: 100%;
		max-height: 360px;
		object-fit: cover;
		display: block;
	}
	.prose {
		line-height: 1.8;
		white-space: pre-wrap;
		word-break: break-word;
	}
</style>
