<script lang="ts">
	import { page } from '$app/state';
	let { data } = $props();

	const isArt = $derived(data.work.work_kind === 'art');

	let likesCount = $state(0);
	let likedByMe = $state(false);
	let commentText = $state('');
	let commentMsg = $state('');
	let actionErr = $state('');
	let likeBusy = $state(false);

	$effect(() => {
		likesCount = data.social.likesCount;
		likedByMe = data.social.likedByMe;
	});

	function fileUrl(stored: string) {
		return `/files/${encodeURIComponent(stored)}`;
	}
	function isImage(m: string) {
		return m.startsWith('image/');
	}
	function isVideo(m: string) {
		return m.startsWith('video/');
	}
	function isAudio(m: string) {
		return m.startsWith('audio/') || m === 'audio/mp3';
	}
	function isDocx(m: string, name: string) {
		return (
			m === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
			name.toLowerCase().endsWith('.docx')
		);
	}

	async function toggleLike() {
		if (!data.guest) {
			const r = page.url.pathname + page.url.search;
			window.location.href = `/auth/login?redirectTo=${encodeURIComponent(r)}`;
			return;
		}
		likeBusy = true;
		actionErr = '';
		const r = await fetch(`/api/works/${data.work.id}/like`, { method: 'POST', credentials: 'include' });
		likeBusy = false;
		if (!r.ok) {
			try {
				const j = await r.json();
				actionErr = j.message ?? '操作失败';
			} catch {
				actionErr = '操作失败';
			}
			return;
		}
		const j = (await r.json()) as { liked?: boolean; count?: number };
		if (typeof j.count === 'number') likesCount = j.count;
		if (typeof j.liked === 'boolean') likedByMe = j.liked;
	}

	async function submitComment(e: Event) {
		e.preventDefault();
		actionErr = '';
		commentMsg = '';
		if (!data.guest) {
			const r = page.url.pathname + page.url.search;
			window.location.href = `/auth/login?redirectTo=${encodeURIComponent(r)}`;
			return;
		}
		const r = await fetch(`/api/works/${data.work.id}/comment`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ body: commentText })
		});
		if (!r.ok) {
			try {
				const j = await r.json();
				actionErr = j.message ?? '发送失败';
			} catch {
				actionErr = '发送失败';
			}
			return;
		}
		const j = (await r.json()) as { message?: string };
		commentMsg = j.message ?? '已提交';
		commentText = '';
	}
</script>

<svelte:head>
	<title>{data.work.title} · 作品 · Fantasy动漫社</title>
</svelte:head>

<article class="work-detail">
	<p class="back"><a href="/works">← 返回作品列表</a></p>

	<header class="card work-detail-head">
		<h1>{data.work.title}</h1>
		<p class="meta-line">
			<span class="pill">{data.work.department || '—'}</span>
			<span>作者：{data.work.author || '—'}</span>
			<time datetime={data.work.created_at}>{data.work.created_at}</time>
		</p>
		{#if data.work.description}
			<p class="lead">{data.work.description}</p>
		{/if}
	</header>

	{#if isImage(data.work.mime)}
		<div class="card media-block" class:art-hero={isArt} style="padding: 0; overflow: hidden;">
			<img
				src={fileUrl(data.work.stored_name)}
				alt={data.work.original_name}
				class="media-full"
				class:art-img={isArt}
			/>
		</div>
	{:else if isVideo(data.work.mime)}
		<div class="card media-block" style="padding: 0;">
			<!-- svelte-ignore a11y_media_has_caption -->
			<video src={fileUrl(data.work.stored_name)} controls class="media-full" preload="metadata"></video>
		</div>
	{:else if isAudio(data.work.mime)}
		<div class="card media-block audio-wrap">
			<span class="lbl">音频附件</span>
			<audio src={fileUrl(data.work.stored_name)} controls preload="metadata" class="audio-el"></audio>
		</div>
	{:else}
		<div class="card media-block file-wrap">
			{#if data.admin}
				{#if isDocx(data.work.mime, data.work.original_name)}
					<a href={fileUrl(data.work.stored_name)} class="btn secondary"
						>下载 Word 原文 · {data.work.original_name}</a
					>
				{:else}
					<a href={fileUrl(data.work.stored_name)} class="btn secondary"
						>下载附件 · {data.work.original_name}</a
					>
				{/if}
			{:else}
				<p class="no-dl-hint">
					附件文件不对访客提供下载；正文内容（若有）请在下方阅读。如需存档请联系社团管理员。
				</p>
			{/if}
		</div>
	{/if}

	{#if data.work.content_html?.trim()}
		<section class="card prose-wrap">
			<h2 class="section-h">{isArt ? '创作手记 / 说明' : '正文'}</h2>
			<div class="prose-paper">{@html data.work.content_html}</div>
		</section>
	{/if}

	<section class="card social-block" aria-label="互动">
		<div class="like-row">
			<button
				type="button"
				class="like-btn"
				disabled={likeBusy}
				onclick={toggleLike}
				aria-pressed={likedByMe}
			>
				<span class="like-icon" aria-hidden="true">{likedByMe ? '♥' : '♡'}</span>
				点赞 · {likesCount}
			</button>
			{#if !data.guest}
				<p class="login-hint">登录访客账号后即可点赞与评论。</p>
			{/if}
		</div>

		<h2 class="section-h">评论区</h2>
		{#if data.guest}
			<form class="comment-form" onsubmit={submitComment}>
				<label for="cbody">发表评论（提交后需管理员审核通过才公开显示）</label>
				<textarea id="cbody" rows="3" bind:value={commentText} placeholder="文明发言…" maxlength="2000"
				></textarea>
				<p class="form-actions">
					<button type="submit">提交评论</button>
				</p>
				{#if commentMsg}<p class="ok">{commentMsg}</p>{/if}
			</form>
		{:else}
			<p class="login-hint">
				<a href="/auth/login?redirectTo={encodeURIComponent(page.url.pathname + page.url.search)}">登录访客账号</a
				>后可发表评论。
			</p>
		{/if}

		{#if actionErr}<p class="err">{actionErr}</p>{/if}

		<ul class="comment-list">
			{#each data.social.comments as c (c.id)}
				<li class="comment-item">
					<p class="comment-meta">
						<strong>{c.username}</strong>
						<time datetime={c.created_at}>{c.created_at}</time>
					</p>
					<p class="comment-body">{c.body}</p>
				</li>
			{:else}
				<li class="comment-empty">暂无已通过的评论。</li>
			{/each}
		</ul>
	</section>
</article>

<style>
	.back {
		margin: 0 0 1rem;
		font-size: 0.9rem;
	}
	.work-detail-head h1 {
		margin: 0 0 0.65rem;
		font-size: clamp(1.35rem, 3vw, 1.65rem);
	}
	.meta-line {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 1rem;
		margin: 0;
		font-size: 0.88rem;
		color: var(--muted);
	}
	.pill {
		display: inline-block;
		padding: 0.15rem 0.55rem;
		border-radius: 999px;
		background: rgba(183, 148, 246, 0.14);
		border: 1px solid rgba(183, 148, 246, 0.25);
		color: var(--accent-soft);
		font-size: 0.8rem;
	}
	.lead {
		margin: 0.85rem 0 0;
		font-size: 0.95rem;
		color: var(--muted);
		line-height: 1.6;
	}
	.media-full {
		display: block;
		width: 100%;
		max-height: min(70vh, 560px);
		object-fit: contain;
		background: var(--bg-elevated);
	}
	.art-hero {
		border: 1px solid rgba(183, 148, 246, 0.25);
	}
	.media-full.art-img {
		max-height: min(78vh, 640px);
		object-fit: contain;
	}
	.audio-wrap {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.lbl {
		font-size: 0.85rem;
		color: var(--muted);
	}
	.audio-el {
		width: 100%;
	}
	.file-wrap {
		text-align: center;
		padding: 1.25rem;
	}
	.no-dl-hint {
		margin: 0;
		font-size: 0.92rem;
		color: var(--muted);
		line-height: 1.65;
		text-align: left;
	}
	.prose-wrap {
		margin-top: 1rem;
	}
	.section-h {
		margin: 0 0 1rem;
		font-size: 1rem;
		font-weight: 600;
		color: var(--accent-soft);
		border-bottom: 1px solid var(--border);
		padding-bottom: 0.5rem;
	}
	.social-block {
		margin-top: 1rem;
	}
	.social-block .section-h {
		margin-top: 1.25rem;
	}
	.like-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem 1rem;
		margin-bottom: 0.25rem;
	}
	.like-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.45rem 0.95rem;
		border-radius: var(--radius-sm);
		border: 1px solid rgba(183, 148, 246, 0.35);
		background: rgba(183, 148, 246, 0.1);
		color: var(--text);
		font: inherit;
		cursor: pointer;
	}
	.like-btn:hover:not(:disabled) {
		background: rgba(183, 148, 246, 0.18);
	}
	.like-btn:disabled {
		opacity: 0.65;
		cursor: wait;
	}
	.like-icon {
		font-size: 1.1rem;
		color: var(--accent-soft);
	}
	.login-hint {
		margin: 0;
		font-size: 0.88rem;
		color: var(--muted);
	}
	.comment-form label {
		margin-top: 0;
	}
	.comment-form textarea {
		width: 100%;
		margin-top: 0.35rem;
		resize: vertical;
		min-height: 4.5rem;
	}
	.form-actions {
		margin-top: 0.65rem;
	}
	.comment-list {
		list-style: none;
		padding: 0;
		margin: 1rem 0 0;
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}
	.comment-item {
		padding: 0.75rem 0.9rem;
		border-radius: var(--radius-sm);
		background: rgba(0, 0, 0, 0.18);
		border: 1px solid var(--border);
	}
	.comment-meta {
		margin: 0 0 0.4rem;
		font-size: 0.82rem;
		color: var(--muted);
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.5rem 0.75rem;
	}
	.comment-meta strong {
		color: var(--accent-soft);
	}
	.comment-body {
		margin: 0;
		font-size: 0.92rem;
		line-height: 1.6;
		white-space: pre-wrap;
		word-break: break-word;
	}
	.comment-empty {
		color: var(--muted);
		font-size: 0.9rem;
	}
</style>
