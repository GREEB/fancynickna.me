<script lang="ts">
	import '../app.css';
	import { Toaster } from 'svelte-sonner';
	let { children } = $props();
</script>

{@render children()}

<Toaster
	position="bottom-center"
	toastOptions={{
		style:
			'background: var(--fg); color: var(--bg); border-radius: 999px; padding: 12px 20px; font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.02em; box-shadow: 0 8px 24px rgba(0,0,0,0.18); border: none;'
	}}
/>
