<svelte:head>
	<title>管理总览 · Fantasy动漫社</title>
</svelte:head>

<h1 class="dash-title">快速入口</h1>
<p class="card dash-intro">
	数据保存在 <code>data/site.json</code>，作品文件在 <code>uploads/</code>。默认账号一般为 <code>admin</code>，密码见服务器
	<code>.env</code> 中的 <code>ADMIN_PASSWORD</code>（未配置时仅开发环境可用默认密码）。请定期备份数据目录。
</p>
<ul class="admin-tiles">
	<li><a class="feature-card" href="/admin/news/new"><span class="icon">📰</span><strong>发布新闻</strong><p>撰写活动报道与社团动态</p></a></li>
	<li><a class="feature-card" href="/admin/announcements"><span class="icon">📢</span><strong>信息公示</strong><p>列表、新建与富文本编辑</p></a></li>
	<li><a class="feature-card" href="/admin/comments"><span class="icon">💬</span><strong>评论审核</strong><p>通过或拒绝访客评论</p></a></li>
	<li><a class="feature-card" href="/admin/home"><span class="icon">🖼</span><strong>首页轮播</strong><p>配置首页顶部滚动大图与链接</p></a></li>
	<li><a class="feature-card" href="/admin/works"><span class="icon">🎨</span><strong>作品管理</strong><p>上传文字/画作、编辑与删除</p></a></li>
	<li><a class="feature-card" href="/admin/recruit"><span class="icon">👥</span><strong>招新说明</strong><p>编辑招新页正文</p></a></li>
</ul>

<style>
	.dash-title {
		font-size: 1.35rem;
		margin: 0 0 1rem;
	}
	.dash-intro {
		color: var(--muted);
		font-size: 0.9rem;
		line-height: 1.65;
	}
	.admin-tiles {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
	}
	.admin-tiles li {
		margin: 0;
	}
	.admin-tiles .feature-card {
		height: 100%;
	}
	.admin-tiles .icon {
		display: block;
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
	}
	.admin-tiles strong {
		display: block;
		margin-bottom: 0.35rem;
		color: var(--text);
	}
	.admin-tiles p {
		margin: 0;
		font-size: 0.88rem;
		color: var(--muted);
	}
</style>
