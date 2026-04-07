<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	type Props = {
		initialHtml?: string;
		placeholder?: string;
		onChange?: (html: string) => void;
		/** 富文本图片上传接口（须已登录管理端） */
		uploadImageUrl?: string;
	};
	let {
		initialHtml = '',
		placeholder = '在此输入正文，支持标题、列表、引用、插图等排版…',
		onChange,
		uploadImageUrl = '/api/upload/rich-image'
	}: Props = $props();

	let el = $state<HTMLDivElement | null>(null);
	let quill: import('quill').default | null = null;

	onMount(async () => {
		if (!browser || !el) return;
		const Quill = (await import('quill')).default;
		await import('quill/dist/quill.snow.css');

		const toolbarOptions = [
			[{ header: [1, 2, 3, false] }],
			['bold', 'italic', 'underline', 'strike'],
			[{ list: 'ordered' }, { list: 'bullet' }],
			['blockquote', 'code-block'],
			['link', 'image'],
			['clean']
		];

		quill = new Quill(el, {
			theme: 'snow',
			placeholder,
			modules: {
				toolbar: {
					container: toolbarOptions,
					handlers: {
						image: function (this: { quill: import('quill').default }) {
							const q = this.quill;
							const input = document.createElement('input');
							input.setAttribute('type', 'file');
							input.setAttribute('accept', 'image/*');
							input.click();
							input.onchange = async () => {
								const file = input.files?.[0];
								if (!file) return;
								const fd = new FormData();
								fd.append('file', file);
								const r = await fetch(uploadImageUrl, {
									method: 'POST',
									body: fd,
									credentials: 'include'
								});
								if (!r.ok) return;
								const j = (await r.json()) as { url?: string };
								if (!j.url) return;
								const range = q.getSelection(true);
								const idx = range ? range.index : q.getLength();
								q.insertEmbed(idx, 'image', j.url);
								q.setSelection(idx + 1, 0);
							};
						}
					}
				}
			}
		});

		if (initialHtml?.trim()) {
			quill.clipboard.dangerouslyPasteHTML(initialHtml);
		}

		const emit = () => {
			const html = quill!.root.innerHTML;
			onChange?.(html);
		};
		quill.on('text-change', emit);
		emit();

		return () => {
			quill = null;
		};
	});
</script>

{#if browser}
	<div class="rich-editor-wrap">
		<div bind:this={el} class="ql-root"></div>
	</div>
{/if}

<style>
	.rich-editor-wrap {
		border-radius: var(--radius-sm);
		border: 1px solid var(--border-strong);
		background: var(--bg-elevated);
		overflow: hidden;
	}
	.rich-editor-wrap :global(.ql-toolbar) {
		border: none;
		border-bottom: 1px solid var(--border-strong);
		background: rgba(0, 0, 0, 0.25);
	}
	.rich-editor-wrap :global(.ql-container) {
		border: none;
		font-family: inherit;
		font-size: 0.95rem;
		min-height: 220px;
		color: var(--text);
	}
	.rich-editor-wrap :global(.ql-editor) {
		min-height: 220px;
		line-height: 1.75;
	}
	.rich-editor-wrap :global(.ql-editor img) {
		max-width: 100%;
		height: auto;
		border-radius: var(--radius-sm);
	}
	.rich-editor-wrap :global(.ql-editor.ql-blank::before) {
		color: var(--muted);
		font-style: normal;
	}
	.rich-editor-wrap :global(.ql-snow .ql-stroke) {
		stroke: var(--muted);
	}
	.rich-editor-wrap :global(.ql-snow .ql-fill) {
		fill: var(--muted);
	}
	.rich-editor-wrap :global(.ql-snow .ql-picker-label) {
		color: var(--muted);
	}
</style>
