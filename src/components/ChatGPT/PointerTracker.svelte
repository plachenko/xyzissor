<script>
	import { fade, scale } from 'svelte/transition';
	import { onMount } from 'svelte';

	let x = $state(0);
	let y = $state(0);
	let touchEl = $state(null);
	let { resetControls } = $props();

	let moved = $state(false);

	let showDot = $state(false);
	let pointerArr = $state(null);

	// Store active pointers using their unique pointerId
	let pointers = new Map();

	const colors = ['red', 'blue', 'green', 'orange', 'purple', 'cyan', 'magenta'];

	function distance() {}

	onMount(() => {});

	const getColor = (id) => {
		// Simple color assignment based on pointerId
		return colors[id % colors.length] || 'black';
	};

	const handlePointerMove = (e) => {
		if (pointers.has(e.pointerId)) {
			pointers.set(e.pointerId, {
				...pointers.get(e.pointerId),
				x: e.clientX,
				y: e.clientY
			});
			pointerArr = Array.from(pointers.entries());
			moved = true;
		}
	};

	const handlePointerDown = (e) => {
		showDot = true;

		pointers.set(e.pointerId, {
			x: e.clientX,
			y: e.clientY,
			color: getColor(e.pointerId)
		});

		pointerArr = Array.from(pointers.entries());
	};

	const handlePointerUpOrLeave = (e) => {
		if (!moved && pointerArr.length == 2) {
			//resetControls();
		}
		pointers.delete(e.pointerId);
		pointerArr = Array.from(pointers.entries());
		// showDot = false;
		moved = false;
	};
</script>

<!-- Listen to pointermove on the window -->
<svelte:window
	on:pointerdown={handlePointerDown}
	on:pointermove={handlePointerMove}
	on:pointerup={handlePointerUpOrLeave}
	on:pointercancel={handlePointerUpOrLeave}
	on:pointerleave={handlePointerUpOrLeave}
/>

<!-- Dot following the pointer -->
{#each pointerArr as pointer}
	<div
		transition:fade={{ duration: 200 }}
		class="dot flex justify-center items-center"
		style={`
      background-color: ${pointer[1].color}; 
      left: ${~~pointer[1].x}px; 
      top: ${~~pointer[1].y}px;
    `}
	>
		<div
			transition:scale={{ x: 600, y: 600 }}
			class="size-22 border-2 border-dashed border-white rounded-full absolute"
		></div>
	</div>
{/each}

<!--
{#if showDot}
	<div transition:fade={{ duration: 200 }} class="dot" style="left: {x}px; top: {y}px;"></div>
{/if}
-->

<style>
	.dot {
		position: fixed;
		opacity: 0.5;
		width: 70px;
		height: 70px;
		border-radius: 50%;
		pointer-events: none;
		transform: translate(-50%, -50%);
		z-index: 9999;
	}
</style>
