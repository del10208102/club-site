<script lang="ts">
	let { data } = $props();
	let editing = $state(false);
	let content = $state('');
	let adminToken = $state('');
	let err = $state('');
	let ok = $state(false);

	$effect(() => {
		if (!editing) content = data.content;
	});

	async function save(e: Event) {
		e.preventDefault();
		err = '';
		ok = false;
		const fd = new FormData();
		fd.set('content', content);
		if (adminToken) fd.set('admin_token', adminToken);
		const headers: Record<string, string> = {};
		if (adminToken) headers['x-admin-secret'] = adminToken;
		const r = await fetch('/api/recruit', { method: 'PUT', body: fd, headers });
		if (!r.ok) {
			try {
				const j = await r.json();
				err = j.message ?? r.statusText;
			} catch {
				err = '保存失败';
			}
			return;
		}
		ok = true;
		editing = false;
		window.location.reload();
	}
</script>

<h1>社团招新</h1>

{#if !editing}
	<div class="card">
		<p style="white-space: pre-wrap; margin: 0;">{data.content}</p>
		<p style="margin: 1rem 0 0; font-size: 0.85rem; color: var(--muted);">更新于 {data.updated_at}</p>
	</div>
	<p>
		<button
			type="button"
			class="secondary"
			onclick={() => {
				editing = true;
				content = data.content;
			}}>编辑内容</button>
	</p>
{:else}
	<form onsubmit={save} class="card">
		<label for="c">招新说明（纯文本，可换行）</label>
		<textarea id="c" bind:value={content} rows="12"></textarea>

		<label for="adm">管理密钥（若已配置）</label>
		<input id="adm" type="password" bind:value={adminToken} autocomplete="off" />

		<p style="margin-top: 1rem;">
			<button type="submit">保存</button>
			<button type="button" class="secondary" onclick={() => (editing = false)}>取消</button>
		</p>
		{#if err}<p class="err">{err}</p>{/if}
		{#if ok}<p class="ok">已保存</p>{/if}
	</form>
{/if}
