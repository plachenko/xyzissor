<script>
	// Store active pointers using their unique pointerId
	let pointers = new Map();

	const colors = ['red', 'blue', 'green', 'orange', 'purple', 'cyan', 'magenta'];

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
		}
	};

	const handlePointerDown = (e) => {
		pointers.set(e.pointerId, {
			x: e.clientX,
			y: e.clientY,
			color: getColor(e.pointerId)
		});
	};

	const handlePointerUpOrLeave = (e) => {
		pointers.delete(e.pointerId);
	};
</script>

<svelte:window
	on:pointerdown={handlePointerDown}
	on:pointermove={handlePointerMove}
	on:pointerup={handlePointerUpOrLeave}
	on:pointercancel={handlePointerUpOrLeave}
	on:pointerleave={handlePointerUpOrLeave}
/>

{#each Array.from(pointers.entries()) as [id, pointer]}
	<div
		class="dot"
		style="
      left: {pointer.x}px;
      top: {pointer.y}px;
      background-color: {pointer.color};
    "
	/>
{/each}

<style>
	.dot {
		position: fixed;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		pointer-events: none;
		transform: translate(-50%, -50%);
		z-index: 9999;
		transition: opacity 0.2s;
	}
</style>
