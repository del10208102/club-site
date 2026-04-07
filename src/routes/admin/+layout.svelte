<script lang="ts">
	let { children } = $props();
</script>

<header class="admin-header card">
	<div class="admin-header-top">
		<div>
			<p class="admin-kicker">Fantasy动漫社 · 浙江大学</p>
			<h1 class="admin-heading">管理后台</h1>
		</div>
		<a class="admin-exit" href="/logout">退出登录</a>
	</div>
	<nav class="admin-nav" aria-label="管理导航">
		<a href="/admin">总览</a>
		<a href="/admin/comments">评论审核</a>
		<a href="/admin/home">首页轮播</a>
		<a href="/admin/news/new">发布新闻</a>
		<a href="/admin/announcements">公示列表</a>
		<a href="/admin/announcements/new">新建公示</a>
		<a href="/admin/works">作品管理</a>
		<a href="/admin/recruit">编辑招新</a>
	</nav>
</header>

{@render children()}

<style>
	.admin-header {
		margin-bottom: 1.5rem;
		padding: 1.1rem 1.35rem;
		border: 1px solid rgba(183, 148, 246, 0.2);
		background: linear-gradient(145deg, rgba(22, 15, 34, 0.95), rgba(16, 10, 24, 0.98));
	}
	.admin-header-top {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1rem;
	}
	.admin-kicker {
		margin: 0 0 0.25rem;
		font-size: 0.78rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.admin-heading {
		margin: 0;
		font-size: 1.35rem;
		font-weight: 700;
		letter-spacing: -0.02em;
	}
	.admin-exit {
		font-size: 0.88rem;
		padding: 0.4rem 0.85rem;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border-strong);
		color: var(--muted);
	}
	.admin-exit:hover {
		color: var(--text);
		background: rgba(255, 255, 255, 0.06);
		text-decoration: none;
	}
	.admin-nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}
	.admin-nav a {
		padding: 0.45rem 0.85rem;
		border-radius: var(--radius-sm);
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--muted);
		background: rgba(183, 148, 246, 0.06);
		border: 1px solid transparent;
	}
	.admin-nav a:hover {
		color: var(--text);
		background: rgba(183, 148, 246, 0.14);
		border-color: rgba(183, 148, 246, 0.2);
		text-decoration: none;
	}
</style>
