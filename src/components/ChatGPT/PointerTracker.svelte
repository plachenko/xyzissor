<script>
	import { fade, scale } from 'svelte/transition';
	import { onMount } from 'svelte';

	let x = $state(0);
	let y = $state(0);
	let touchEl = $state(null);
	let { resetControls } = $props();
	let touchIdx = $state(0);

	let mirrorMode = $state(false);
	let mirrorCenter = $state(false);

	let moved = $state(false);

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

	/*
	const handlePointerMove = (e) => {
		if (pointers.has(e.pointerId)) {
			if(pointers.has(touchIdx) && e.pointerId == touchIdx){
				// right click
				return;
			}

			pointers.set(e.pointerId, {
				...pointers.get(e.pointerId),
				x: e.clientX,
				y: e.clientY
			});
			
			pointerArr = Array.from(pointers.entries());
			moved = true;
		}
	};
	*/

const handlePointerDown = (e) => {
	// Right click (mouse) -> persistent static point
	if (e.button === 0 && e.pointerType === "mouse" && e.shiftKey) {
		pointers.set(`mouse-${Date.now()}`, {
			x: e.clientX,
			y: e.clientY,
			color: getColor(e.pointerId),
			locked: true
		});
		pointerArr = Array.from(pointers.entries());
		return;
	} 
	
	if(e.button === 2 && e.pointerType === "mouse"){
		pointers.set(`mouse-${Date.now()}`, {
			x: e.clientX,
			y: e.clientY,
			color: getColor(e.pointerId),
			locked: false
		});
		pointerArr = Array.from(pointers.entries());
	}


	// Normal pointer (touch, left click, pen, etc.)
	pointers.set(e.pointerId, {
		x: e.clientX,
		y: e.clientY,
		color: getColor(e.pointerId),
		locked: false
	});

	pointerArr = Array.from(pointers.entries());
};

const handlePointerMove = (e) => {
	if (pointers.has(e.pointerId)) {
		const pointer = pointers.get(e.pointerId);

		// Skip locked (persistent right-click) points
		if (pointer.locked) return;

		pointers.set(e.pointerId, {
			...pointer,
			x: e.clientX,
			y: e.clientY
		});

		pointerArr = Array.from(pointers.entries());
		moved = true;
	}
};

const handlePointerUpOrLeave = (e) => {
	if (!moved && pointerArr.length === 2) {
		// resetControls();
	}

	// Don't delete persistent right-click points
	const pointer = pointers.get(e.pointerId);
	if (pointer && pointer.locked) {
		return;
	}

	// Remove normal pointers
	pointers.delete(e.pointerId);
	pointerArr = Array.from(pointers.entries());
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

<button>lock  </button>

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
