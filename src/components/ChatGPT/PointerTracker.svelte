<script>
	import { Vector3 } from 'three';
	import { fade, scale } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { LineBetween } from './LineBetween';
	import Connector from './Connector.svelte';
	import RadialMenu from './RadialMenu.svelte';
	import RadialProgress from './RadialProgress.svelte';

	let options = [
		{ name: 'Home', icon: '🏠', action: () => alert('Go Home') },
		{ name: 'Search', icon: '🔍', action: () => alert('Search...') },
		{ name: 'Save', icon: '💾', action: () => alert('Saved!') },
		{ name: 'Delete', icon: '🗑️', action: () => alert('Deleted!') },
		{ name: 'Settings', icon: '⚙️', action: () => alert('Settings opened') }
	];

	let ticks = $state(1);

	let radialEl = $state(null);

	let x = $state(0);
	let y = $state(0);
	let touchEl = $state(null);
	let { resetControls, scene } = $props();
	let touchIdx = $state(0);

	let mirrorMode = $state(false);
	let mirrorCenter = $state(false);

	let p1 = $state(new Vector3(0, 0, 0));
	let p2 = $state(new Vector3(0, 10, 5));

	let tickInt = $state(0);
	let pointerTick = $state(null);

	let pointerArr = $state(null);

	// Store active pointers using their unique pointerId
	let pointers = new Map();

	const colors = ['red', 'blue', 'green', 'orange', 'purple', 'cyan', 'magenta'];

	const lineObj = new LineBetween(p1, p2);

	function distance() {}

	onMount(() => {
		console.log(scene);
		// scene.add(lineObj);
	});

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

	let showMenu = $state(false);

	const handlePointerDown = (e) => {
		// Right click (mouse) -> persistent static point
		//
		if (e.button === 0 && e.pointerType === 'mouse' && e.shiftKey) {
			pointers.set(`mouse-${Date.now()}`, {
				x: e.clientX,
				y: e.clientY,
				color: getColor(e.pointerId),
				locked: true
			});
			pointerArr = Array.from(pointers.entries());
			return;
		}

		if (e.button === 2 && e.pointerType === 'mouse') {
			pointers.set(`mouse-${e.pointerId}`, {
				x: e.clientX,
				y: e.clientY,
				color: getColor(~~(Math.random() * (colors.length - 1))),
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
		handleTick();
	};

	function handleTick() {
		if (pointerArr.length == 1) {
			pointerTick = setInterval((evt) => {
				if (tickInt >= ticks) {
					showMenu = true;
					console.log(radialEl?.getBoundingClientRect());
					clearInterval(pointerTick);
					pointerTick = null;
					return;
				}
				tickInt++;
			}, 500);
		} else {
			clearInterval(pointerTick);
			pointerTick = null;
			tickInt = 0;
		}
	}

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
		}
	};

	const handlePointerUpOrLeave = (e) => {
		// Don't delete persistent right-click points
		showMenu = false;
		tickInt = 0;
		clearInterval(pointerTick);
		pointerTick = null;
		const pointer = pointers.get(e.pointerId);
		if (pointer && pointer.locked) {
			return;
		}

		if (e.button === 2 && e.pointerType === 'mouse') {
			pointers.delete('mouse-' + e.pointerId);
		}
		// Remove normal pointers
		pointers.delete(e.pointerId);
		pointerArr = Array.from(pointers.entries());
		handleTick();
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

<div class="select-none absolute z-[9999]">
	<button>lock </button>
	{#if pointerArr?.length && !showMenu}
		<div
			transition:fade
			style={`
    left: ${pointerArr[0][1].x - 60}px; 
    top: ${pointerArr[0][1].y - 60}px;
  `}
			class="absolute z-[9999] opacity-55"
		>
			<RadialProgress {tickInt} {ticks} />
		</div>
	{/if}

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
			{#if showMenu}
				<div
					bind:this={radialEl}
					class="absolute left-[-115px] top-[-115px] top-0 w-full h-full z-[9999]"
				>
					<RadialMenu {options} />
				</div>
			{/if}
		</div>
	{/each}
	{#if pointerArr && pointerArr.length >= 2}
		<div transition:scale>
			<Connector
				p1={{ x: pointerArr[0][1].x, y: pointerArr[0][1].y }}
				p2={{ x: pointerArr[1][1].x, y: pointerArr[1][1].y }}
			/>
		</div>
	{/if}
	{#if showMenu}
		<div class="absolute left-[-115px] top-[-115px] top-0 w-full h-full z-[9999]">
			<RadialMenu {options} />
		</div>
	{/if}
</div>

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
		z-index: 9998;
	}
</style>
