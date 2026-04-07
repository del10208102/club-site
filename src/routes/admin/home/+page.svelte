<script lang="ts">
	import { onMount } from 'svelte';

	type Slide = {
		id: string;
		image: string;
		title?: string;
		subtitle?: string;
		href?: string;
	};

	let { data } = $props();

	let slides = $state<Slide[]>([]);
	let interval_ms = $state(6000);
	let err = $state('');
	let ok = $state(false);
	let uploadBusy = $state(false);

	onMount(() => {
		slides = data.carousel.slides.length
			? [...data.carousel.slides]
			: [];
		interval_ms = data.carousel.interval_ms;
	});

	function addSlide() {
		const id =
			typeof crypto !== 'undefined' && crypto.randomUUID
				? crypto.randomUUID()
				: `s-${Date.now()}-${Math.random().toString(36).slice(2)}`;
		slides = [
			...slides,
			{
				id,
				image: '',
				title: '',
				subtitle: '',
				href: ''
			}
		];
	}

	function removeAt(i: number) {
		slides = slides.filter((_, j) => j !== i);
	}

	async function uploadForIndex(i: number, ev: Event) {
		const input = ev.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;
		uploadBusy = true;
		err = '';
		const fd = new FormData();
		fd.append('file', file);
		const r = await fetch('/api/upload/rich-image', { method: 'POST', body: fd, credentials: 'include' });
		uploadBusy = false;
		if (!r.ok) {
			err = '图片上传失败';
			return;
		}
		const j = (await r.json()) as { url?: string };
		if (!j.url) return;
		const next = [...slides];
		next[i] = { ...next[i], image: j.url };
		slides = next;
	}

	async function save(e: Event) {
		e.preventDefault();
		err = '';
		ok = false;
		const cleaned = slides
			.map((s) => ({
				id: s.id,
				image: s.image.trim(),
				...(s.title?.trim() ? { title: s.title.trim() } : {}),
				...(s.subtitle?.trim() ? { subtitle: s.subtitle.trim() } : {}),
				...(s.href?.trim() ? { href: s.href.trim() } : {})
			}))
			.filter((s) => s.image.length > 0);
		const r = await fetch('/api/admin/home-carousel', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ slides: cleaned, interval_ms })
		});
		if (!r.ok) {
			try {
				const j = await r.json();
				err = j.message ?? '保存失败';
			} catch {
				err = '保存失败';
			}
			return;
		}
		ok = true;
	}
</script>

<svelte:head>
	<title>首页轮播 · 管理</title>
</svelte:head>

<h1>首页轮播</h1>
<p class="card intro">
	轮播显示在网站首页顶部。图片可使用 <code>/images</code> 下成员作品（下拉选择），或上传新图（保存于
	<code>/files/</code>）。可填写标题、副标题与可选跳转链接。
</p>

<form class="card" onsubmit={save}>
	<label for="int">切换间隔（毫秒，2000–120000）</label>
	<input id="int" type="number" min="2000" max="120000" step="500" bind:value={interval_ms} />

	<h2 class="section-h">幻灯片</h2>
	<ul class="slide-list">
		{#each slides as s, i (s.id)}
			<li class="slide-item">
				<p class="slide-head">第 {i + 1} 张</p>
				<label for="slide-img-{s.id}">图片地址 <span class="req">*</span></label>
				<input id="slide-img-{s.id}" type="text" bind:value={s.image} placeholder="/images/xxx.png 或 /files/..." />
				{#if data.staticImages.length}
					<label class="sub" for="slide-sel-{s.id}">从 static/images 选择</label>
					<select
						id="slide-sel-{s.id}"
						onchange={(e) => {
							const v = (e.currentTarget as HTMLSelectElement).value;
							if (v) {
								const next = [...slides];
								next[i] = { ...next[i], image: v };
								slides = next;
							}
						}}
					>
						<option value="">— 请选择 —</option>
						{#each data.staticImages as path}
							<option value={path}>{path}</option>
						{/each}
					</select>
				{/if}
				<label class="sub" for="slide-up-{s.id}">或上传图片</label>
				<input
					id="slide-up-{s.id}"
					type="file"
					accept="image/*"
					disabled={uploadBusy}
					onchange={(e) => uploadForIndex(i, e)}
				/>

				<label for="slide-ti-{s.id}">标题（可选）</label>
				<input id="slide-ti-{s.id}" type="text" bind:value={s.title} />
				<label for="slide-st-{s.id}">副标题（可选）</label>
				<input id="slide-st-{s.id}" type="text" bind:value={s.subtitle} />
				<label for="slide-hr-{s.id}">链接（可选，站内路径如 /works）</label>
				<input id="slide-hr-{s.id}" type="text" bind:value={s.href} placeholder="/announcements" />

				<p class="row-remove">
					<button type="button" class="danger" onclick={() => removeAt(i)}>移除此张</button>
				</p>
			</li>
		{/each}
	</ul>

	<p class="add-row">
		<button type="button" class="secondary" onclick={addSlide}>＋ 添加一张</button>
	</p>

	<p class="actions">
		<button type="submit">保存轮播</button>
		<a class="btn secondary" href="/">预览首页</a>
	</p>
	{#if err}<p class="err">{err}</p>{/if}
	{#if ok}<p class="ok">已保存。</p>{/if}
</form>

<style>
	.intro {
		font-size: 0.9rem;
		color: var(--muted);
		line-height: 1.65;
		margin-bottom: 1rem;
	}
	.intro code {
		font-size: 0.85em;
	}
	.section-h {
		margin: 1.25rem 0 0.75rem;
		font-size: 1rem;
		font-weight: 600;
		color: var(--accent-soft);
	}
	.slide-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}
	.slide-item {
		padding: 1rem;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border-strong);
		background: rgba(0, 0, 0, 0.15);
	}
	.slide-head {
		margin: 0 0 0.75rem;
		font-weight: 600;
		font-size: 0.9rem;
	}
	.sub {
		margin-top: 0.5rem;
		font-size: 0.82rem;
	}
	.req {
		color: var(--accent-soft);
	}
	.row-remove {
		margin: 0.75rem 0 0;
	}
	button.danger {
		background: rgba(240, 168, 168, 0.1);
		border: 1px solid rgba(240, 168, 168, 0.35);
		color: var(--danger);
		cursor: pointer;
		border-radius: var(--radius-sm);
		font: inherit;
		padding: 0.35rem 0.75rem;
		font-size: 0.88rem;
	}
	.add-row {
		margin: 1rem 0 0;
	}
	.actions {
		margin-top: 1.25rem;
	}
	select {
		width: 100%;
		margin-bottom: 0.35rem;
	}
</style>
