<script>
	import { fade } from 'svelte/transition';
	let { options = [] } = $props();
	const radius = 100; // distance from center

	// Compute positions + angles
	$effect(() => {
		options.forEach((opt, i) => {
			const angle = (i / options.length) * 2 * Math.PI;
			opt.angle = angle * (180 / Math.PI); // in degrees
			opt.x = Math.cos(angle) * radius;
			opt.y = Math.sin(angle) * radius;
		});
	});
</script>

<div class="relative w-[301px] h-[300px] flex items-center justify-center">
	<!-- Center button -->
	<div
		class="z-10 w-14 h-14 flex items-center justify-center rounded-full bg-gray-900 text-white border border-gray-600"
	>
		+
	</div>

	{#each options as opt, idx}
		<button
			class="menu-btn absolute"
			style={`left:calc(50% + ${opt.x}px - 1.5rem); top:calc(50% + ${opt.y}px - 1.5rem);`}
			on:click={() => opt.action?.()}
			title={opt.name}
		>
			<div class="text-xl">{opt.icon}</div>
			<div class="text-[10px]">{opt.name}</div>
		</button>
	{/each}
</div>

<style>
	/*
	.menu-btn {
		@apply absolute flex flex-col items-center justify-center 
      w-12 h-12 rounded-full bg-gray-700 text-white 
      hover:bg-blue-600 transition;
	}
*/
</style>
