<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<nav class="nav">
	<a href="/"><strong>社团站点</strong></a>
	<a href="/announcements">信息公示</a>
	<a href="/works">作品展示</a>
	<a href="/recruit">社团招新</a>
</nav>

<main>
	{@render children()}
</main>
