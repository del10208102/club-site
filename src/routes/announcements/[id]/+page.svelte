<script lang="ts">
	let { data } = $props();
	const a = $derived(data.item);
</script>

<svelte:head>
	<title>{a.title} · 信息公示 · Fantasy动漫社</title>
</svelte:head>

<article>
	<p class="back"><a href="/announcements">← 返回公示列表</a></p>
	<header class="card ann-head">
		<h1>{a.title}</h1>
		<time datetime={a.created_at}>{a.created_at}</time>
	</header>
	<div class="card prose-wrap">
		<div class="prose-paper">{@html a.body_html}</div>
	</div>
</article>

<style>
	.back {
		margin: 0 0 1rem;
		font-size: 0.9rem;
	}
	.ann-head h1 {
		margin: 0 0 0.5rem;
		font-size: clamp(1.35rem, 3vw, 1.75rem);
	}
	.ann-head time {
		font-size: 0.85rem;
		color: var(--muted);
	}
	.prose-wrap {
		margin-top: 1rem;
	}
</style>
