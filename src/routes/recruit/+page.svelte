<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>社团招新 · Fantasy动漫社</title>
</svelte:head>

<h1>社团招新</h1>

<div class="card recruit-card">
	<p style="white-space: pre-wrap; margin: 0;">{data.content}</p>
	<p style="margin: 1rem 0 0; font-size: 0.85rem; color: var(--muted);">更新于 {data.updated_at}</p>
</div>
