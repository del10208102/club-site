<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	let { data, children } = $props();

	const pathname = $derived(page.url.pathname);

	function navClass(href: string) {
		const p = pathname;
		if (href === '/') return p === '/' ? 'active' : '';
		return p === href || p.startsWith(href + '/') ? 'active' : '';
	}

	async function guestLogout() {
		await fetch('/api/auth/guest/logout', { method: 'POST', credentials: 'include' });
		location.href = '/';
	}
</script>

<div class="shell">
	<nav class="nav" aria-label="主导航">
		<div class="nav-inner">
			<a class="nav-brand" href="/">
				<img
					class="nav-logo"
					src="/images/logo.png"
					alt=""
					width="40"
					height="40"
					onerror={(e) => {
						e.currentTarget.style.display = 'none';
					}} />
				<span class="nav-brand-text">
					<span class="nav-club">Fantasy动漫社</span>
					<span class="nav-sub">浙江大学</span>
				</span>
			</a>
			<div class="nav-links">
				<a href="/" class={navClass('/')}>首页</a>
				<a href="/news" class={navClass('/news')}>社团新闻</a>
				<a href="/announcements" class={navClass('/announcements')}>信息公示</a>
				<a href="/works" class={navClass('/works')}>作品展示</a>
				<a href="/recruit" class={navClass('/recruit')}>社团招新</a>
				{#if data.admin}
					<a href="/admin" class={navClass('/admin')}>管理</a>
					<a href="/logout" class="nav-auth">管理员退出</a>
				{/if}
				{#if data.guest}
					<span class="nav-guest" title="访客账号">{data.guest.username}</span>
					<button type="button" class="nav-auth nav-btn" onclick={guestLogout}>访客退出</button>
				{:else if !data.admin}
					<a href="/auth/login" class="nav-auth">访客登录</a>
					<a href="/auth/register">注册</a>
				{/if}
				{#if !data.admin}
					<a href="/login" class="nav-auth">管理员登录</a>
				{/if}
			</div>
		</div>
	</nav>

	<main>
		{@render children()}
	</main>

	<footer class="page-foot">
		Fantasy动漫社 · 浙江大学 · 访客请浏览各栏目；内容更新请使用管理员登录
	</footer>
</div>

<style>
	.nav-brand {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		text-decoration: none;
		color: var(--text);
		margin-right: 0.5rem;
	}
	.nav-brand:hover {
		color: var(--text);
		text-decoration: none;
	}
	.nav-logo {
		border-radius: 10px;
		object-fit: cover;
		background: var(--surface);
		border: 1px solid var(--border);
	}
	.nav-brand-text {
		display: flex;
		flex-direction: column;
		line-height: 1.2;
	}
	.nav-club {
		font-weight: 700;
		font-size: 1.02rem;
		letter-spacing: -0.02em;
	}
	.nav-sub {
		font-size: 0.72rem;
		color: var(--muted);
		font-weight: 500;
	}
	.nav-links a.active {
		color: var(--text);
		background: rgba(167, 139, 250, 0.15);
	}
	.nav-auth {
		color: var(--accent-soft) !important;
	}
	.nav-guest {
		font-size: 0.85rem;
		color: var(--muted);
		padding: 0.35rem 0.5rem;
		max-width: 8rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.nav-btn {
		background: none;
		border: none;
		cursor: pointer;
		font: inherit;
		padding: 0.35rem 0.5rem;
	}
	.nav-btn:hover {
		color: var(--accent-hover) !important;
	}
</style>
