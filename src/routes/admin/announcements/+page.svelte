<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>公示管理 · Fantasy动漫社</title>
</svelte:head>

<h1>信息公示管理</h1>
<p class="card intro">
	<a class="btn" href="/admin/announcements/new">＋ 新建公告</a>
</p>

<ul class="adm-list">
	{#each data.items as a}
		<li class="card row">
			<div>
				<strong>{a.title}</strong>
				<p class="sub">{a.created_at}</p>
			</div>
			<a class="btn secondary" href="/admin/announcements/{a.id}/edit">编辑</a>
		</li>
	{:else}
		<li class="card">暂无公告，点击上方新建。</li>
	{/each}
</ul>

<style>
	.intro {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: center;
	}
	.adm-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}
	.sub {
		margin: 0.35rem 0 0;
		font-size: 0.85rem;
		color: var(--muted);
	}
</style>
