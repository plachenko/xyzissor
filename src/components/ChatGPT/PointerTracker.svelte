<script>
	import { fade } from 'svelte/transition';
	import {onMount} from 'svelte';

	let x = $state(0);
	let y = $state(0);
	let touchEl = $state(null);

	const handlePointerMove = (event) => {
		x = event.clientX;
		y = event.clientY;
	};

	let showDot = $state(false);

	// Store active pointers using their unique pointerId
	let pointers = new Map();

	const colors = ['red', 'blue', 'green', 'orange', 'purple', 'cyan', 'magenta'];

	function emulateMultiTouch(element, x, y, count = 2, radius = 30) {
		// count = number of touches
		// radius = distance from the main click center
		const angleStep = (2 * Math.PI) / count;

		for (let i = 0; i < count; i++) {
			const angle = i * angleStep;
			const offsetX = Math.cos(angle) * radius;
			const offsetY = Math.sin(angle) * radius;

			const touchX = x + offsetX;
			const touchY = y + offsetY;

			const event = new PointerEvent("pointerdown", {
			bubbles: true,
			cancelable: true,
			pointerId: i + 1,
			pointerType: "touch",
			clientX: touchX,
			clientY: touchY,
			pressure: 0.5,
			isPrimary: i === 0,
			});

			element.dispatchEvent(event);
		}
	}

	onMount(() => {

	});

	const getColor = (id) => {
		// Simple color assignment based on pointerId
		return colors[id % colors.length] || 'black';
	};

	/*
	const handlePointerMove = (e) => {
		if (pointers.has(e.pointerId)) {
			pointers.set(e.pointerId, {
				...pointers.get(e.pointerId),
				x: e.clientX,
				y: e.clientY
			});
		}
	};
  */

	const handlePointerDown = (e) => {
		showDot = true;
		console.log(e)

		pointers.set(e.pointerId, {
			x: e.clientX,
			y: e.clientY,
			color: getColor(e.pointerId)
		});
	};

	const handlePointerUpOrLeave = (e) => {
		pointers.delete(e.pointerId);
		showDot = false;
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
{#if showDot}
	<div transition:fade={{ duration: 200 }} class="dot" style="left: {x}px; top: {y}px;"></div>
{/if}

<style>
	.dot {
		position: fixed;
		width: 10px;
		height: 10px;
		background-color: red;
		border-radius: 50%;
		pointer-events: none;
		transform: translate(-50%, -50%);
		z-index: 9999;
	}
</style>
