<script lang="ts">
	import { browser } from '$app/environment';
	import { untrack } from 'svelte';

	type Slide = {
		image: string;
		title?: string;
		subtitle?: string;
		href?: string;
	};

	let { slides, intervalMs = 6000 }: { slides: Slide[]; intervalMs?: number } = $props();

	let index = $state(0);

	$effect(() => {
		if (!browser || slides.length <= 1) return;
		if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			return;
		}
		const n = slides.length;
		const ms = Math.max(2000, intervalMs);
		const t = window.setInterval(() => {
			index = (untrack(() => index) + 1) % n;
		}, ms);
		return () => window.clearInterval(t);
	});

	$effect(() => {
		const n = slides.length;
		if (!n) return;
		index = untrack(() => index) % n;
	});

	function go(i: number) {
		const n = slides.length;
		if (!n) return;
		index = (i + n) % n;
	}
</script>

{#if slides.length > 0}
	<div class="home-carousel-frame">
	<div class="home-carousel" aria-roledescription="carousel" aria-label="首页推荐">
		<div class="home-carousel-viewport">
			{#each slides as s, i (s.image + i)}
				<div class="home-carousel-slide" class:active={i === index} aria-hidden={i !== index}>
					{#if s.href}
						<a href={s.href} class="home-carousel-link">
							<img src={s.image} alt="" class="home-carousel-img" loading={i === 0 ? 'eager' : 'lazy'} />
							{#if s.title || s.subtitle}
								<div class="home-carousel-caption">
									{#if s.title}<p class="home-carousel-title">{s.title}</p>{/if}
									{#if s.subtitle}<p class="home-carousel-sub">{s.subtitle}</p>{/if}
								</div>
							{/if}
						</a>
					{:else}
						<div class="home-carousel-link nolink">
							<img src={s.image} alt="" class="home-carousel-img" loading={i === 0 ? 'eager' : 'lazy'} />
							{#if s.title || s.subtitle}
								<div class="home-carousel-caption">
									{#if s.title}<p class="home-carousel-title">{s.title}</p>{/if}
									{#if s.subtitle}<p class="home-carousel-sub">{s.subtitle}</p>{/if}
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
		{#if slides.length > 1}
			<div class="home-carousel-nav">
				<button type="button" class="home-carousel-arrow" aria-label="上一张" onclick={() => go(index - 1)}
					>‹</button
				>
				<div class="home-carousel-dots" role="tablist">
					{#each slides as _, i}
						<button
							type="button"
							role="tab"
							aria-selected={i === index}
							class="home-carousel-dot"
							aria-label="第 {i + 1} 张"
							onclick={() => go(i)}
						></button>
					{/each}
				</div>
				<button type="button" class="home-carousel-arrow" aria-label="下一张" onclick={() => go(index + 1)}
					>›</button
				>
			</div>
		{/if}
	</div>
	</div>
{/if}

<style>
	.home-carousel-frame {
		width: 100%;
		max-width: min(100%, 52rem);
		margin: -0.5rem auto 2rem;
		padding: 0 1rem;
		box-sizing: border-box;
	}

	.home-carousel {
		position: relative;
		border-radius: var(--radius);
		overflow: hidden;
		box-shadow: var(--shadow);
		border: 1px solid var(--border-strong);
	}

	.home-carousel-viewport {
		position: relative;
		aspect-ratio: 21 / 9;
		min-height: 160px;
		max-height: min(38vh, 320px);
		background: var(--bg-elevated);
	}

	@media (max-width: 640px) {
		.home-carousel-viewport {
			aspect-ratio: 16 / 9;
			max-height: 36vh;
			min-height: 140px;
		}
	}

	@media (min-width: 900px) {
		.home-carousel-viewport {
			max-height: min(36vh, 300px);
		}
	}

	.home-carousel-slide {
		position: absolute;
		inset: 0;
		opacity: 0;
		transition: opacity 0.65s ease;
		pointer-events: none;
	}

	.home-carousel-slide.active {
		opacity: 1;
		pointer-events: auto;
		z-index: 1;
	}

	.home-carousel-link {
		display: block;
		width: 100%;
		height: 100%;
		position: relative;
		color: inherit;
		text-decoration: none;
	}

	.home-carousel-link.nolink {
		cursor: default;
	}

	.home-carousel-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
		display: block;
	}

	.home-carousel-caption {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 1.25rem 1.5rem 1.75rem;
		background: linear-gradient(transparent, rgba(10, 6, 18, 0.88));
	}

	.home-carousel-title {
		margin: 0 0 0.25rem;
		font-size: clamp(1.1rem, 2.5vw, 1.45rem);
		font-weight: 700;
		text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
	}

	.home-carousel-sub {
		margin: 0;
		font-size: 0.92rem;
		color: rgba(240, 232, 255, 0.88);
		text-shadow: 0 1px 8px rgba(0, 0, 0, 0.45);
	}

	.home-carousel-nav {
		position: absolute;
		bottom: 0.65rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 2;
		display: flex;
		align-items: center;
		gap: 0.65rem;
		padding: 0.35rem 0.6rem;
		border-radius: 999px;
		background: rgba(10, 6, 18, 0.45);
		backdrop-filter: blur(8px);
	}

	.home-carousel-arrow {
		border: none;
		background: transparent;
		color: var(--text);
		font-size: 1.35rem;
		line-height: 1;
		cursor: pointer;
		padding: 0.15rem 0.35rem;
		border-radius: var(--radius-sm);
		font-family: inherit;
	}

	.home-carousel-arrow:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	.home-carousel-dots {
		display: flex;
		gap: 0.35rem;
	}

	.home-carousel-dot {
		width: 8px;
		height: 8px;
		border-radius: 999px;
		border: none;
		padding: 0;
		background: rgba(255, 255, 255, 0.35);
		cursor: pointer;
	}

	.home-carousel-dot[aria-selected='true'] {
		background: var(--accent);
		width: 22px;
	}
</style>
