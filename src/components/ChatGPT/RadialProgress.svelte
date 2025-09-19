<script lang="ts">
	import { scale } from 'svelte/transition';
	// props() with defaults
	const {
		ticks = 4,
		tickInt = 3,
		size = 120,
		gap = 0, // degrees
		filledColor = '#3b82f6',
		emptyColor = '#e5e7eb'
	} = $props();

	// reactive state
	let count = $state(0);
	let slice = $state(0);
	let gradient = $state('');

	// recompute when inputs change
	$effect(() => {
		count = Math.max(0, Math.min(ticks, tickInt));
		slice = 360 / ticks;

		const filledSegments = Array.from({ length: ticks }, (_, i) => i < count);

		gradient =
			filledSegments
				.map((filled, i) => {
					const start = i * slice;
					const end = start + slice - gap;
					const col = filled ? filledColor : emptyColor;
					return `${col} ${start}deg ${end}deg`;
				})
				.join(', ') + `, ${emptyColor} 0deg 360deg`;
	});
</script>

{#if tickInt}
	<div
		transition:scale
		class="radial"
		style="
    width:{size}px;
    height:{size}px;
    background:conic-gradient({gradient});
    border-radius:50%;
    position:relative;
    display:grid;
    place-items:center;
  z-index: 9999;
  "
	>
		<div
			class="inner"
			style="
      width:{size * 0.65}px;
      height:{size * 0.65}px;
      border-radius:50%;
      background:white;
      display:flex;
      align-items:center;
      justify-content:center;
      font-weight:600;
      font-size:clamp(0.8rem,{size / 6}px,1.4rem);
      user-select:none;
    "
		>
			{count}/{ticks}
		</div>
	</div>
{/if}

<style>
	.radial {
		box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.15);
	}
</style>
