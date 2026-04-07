<script lang="ts">
	import HomeCarousel from '$lib/components/HomeCarousel.svelte';
	let { data } = $props();
</script>

<svelte:head>
	<title>Fantasy动漫社 · 浙江大学</title>
</svelte:head>

<HomeCarousel slides={data.carousel.slides} intervalMs={data.carousel.interval_ms} />

<section class="hero hero-site">
	<p class="hero-eyebrow">浙江大学 · 学生社团</p>
	<h1>Fantasy动漫社</h1>
	<p class="hero-lead">
		欢迎访问 Fantasy 官方页面。在这里阅读<strong>社团新闻</strong>与<strong>活动记录</strong>，查看<strong>信息公示</strong>、<strong>社员作品</strong>，以及最新<strong>招新</strong>说明。
	</p>
</section>

<div class="feature-grid">
	<a class="feature-card" href="/news">
		<div class="icon" aria-hidden="true">📰</div>
		<h2>社团新闻</h2>
		<p>活动报道与社团动态，支持点进全文阅读。</p>
	</a>
	<a class="feature-card" href="/announcements">
		<div class="icon" aria-hidden="true">📢</div>
		<h2>信息公示</h2>
		<p>重要通知与简短公告。</p>
	</a>
	<a class="feature-card" href="/works">
		<div class="icon" aria-hidden="true">🎨</div>
		<h2>作品展示</h2>
		<p>浏览社员上传的文字、画作与多媒体作品。</p>
	</a>
	<a class="feature-card" href="/recruit">
		<div class="icon" aria-hidden="true">👥</div>
		<h2>社团招新</h2>
		<p>招新时间、报名方式与联系方式。</p>
	</a>
</div>
