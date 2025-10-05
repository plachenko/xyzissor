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
	let pointerLocked = $state(false);

	let radialEl = $state(null);

	let x = $state(0);
	let y = $state(0);
	let touchEl = $state(null);
	let { resetControls, scene, setPointerLock, pointerposArr } = $props();
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

	onMount(() => {
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

	let dx = $state(0);
	let dy = $state(0);
	let distance = $state(0);

	/*
	let dx = $derived(pointers?.size >= 2 ? pointerArr[1][1].x - pointerArr[0][1].x : 0);
	let dy = $derived(pointers?.size >= 2 ? pointerArr[1][1].y - pointerArr[0][1].y : 0);
	let distance = $derived(Math.sqrt(dx * dx + dy * dy));

	*/

	$effect(() => {
		dx = pointerArr?.length >= 2 ? pointerArr[1][1].x - pointerArr[0][1].x : 0;
		dy = pointerArr?.length >= 2 ? pointerArr[1][1].y - pointerArr[0][1].y : 0;
		distance = Math.sqrt(dx * dx + dy * dy);

		if (pointerArr) {
			pointerposArr = [{ x: pointerArr[0]?.x, y: pointerArr[0]?.y }];
		}
	});

	const handlePointerDown = (e) => {
		// Right click (mouse) -> persistent static point
		//
		//e.preventDefault();
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
	on:contextmenu={(e) => e.preventDefault()}
/>

<div class="select-none absolute z-[9999]">
	<button
		onclick={() => {
			pointerLocked = !pointerLocked;
			setPointerLock(pointerLocked);
		}}
		class={`pointer-events-auto ${pointerLocked ? 'font-bold' : ''}`}
		>lock
	</button>
	{#if pointerArr?.length && !showMenu}
		<div
			transition:fade
			class="absolute z-[9999] opacity-55"
			style={`
			left: ${pointerArr[0][1].x - 68}px; 
			top: ${pointerArr[0][1].y - 68}px;
			`}
		>
			<RadialProgress {tickInt} {ticks} />
		</div>
	{/if}

	<!-- Dot following the pointer -->
	{#each pointerArr as pointer}
		<div
			transition:fade={{ duration: 200 }}
			class={`size-${distance < 60 ? '5' : '22'} dot flex justify-center items-center`}
			style={`
			background-color: ${pointer[1].color}; 
			left: ${~~pointer[1].x + 6}px; 
			top: ${~~pointer[1].y + 6}px;
			`}
		>
			<div
				transition:scale={{ x: 600, y: 600 }}
				class="size-22 border-2 border-dashed border-white rounded-full absolute"
			></div>
		</div>
	{/each}
	{#if pointerArr && pointerArr.length >= 2}
		<div transition:fade>
			<Connector
				p1={{ x: pointerArr[0][1].x, y: pointerArr[0][1].y }}
				p2={{ x: pointerArr[1][1].x, y: pointerArr[1][1].y }}
			/>
		</div>
	{/if}
</div>

<!--
<div style="pointer-events: none;" class="w-30 h-30 absolute left-0 top-0 z-[9998]">
	{#if showMenu}
		<div
			bind:this={radialEl}
			style={`
      pointer-events: none;
          left: ${~~pointerArr[0][1].x} px; 
          top: ${~~pointerArr[0][1].y} px; 
        `}
			class={`
      absolute 
      bg-red-300
      w-full 
      h-full 
      z-[9999]`}
		>
			<span class="text-white">{pointerArr[0][1].x}{pointerArr[0].x}</span>
			<RadialMenu {options} />
		</div>
	{/if}
</div>
-->

<style>
	.dot {
		position: fixed;
		opacity: 0.5;
		border-radius: 50%;
		pointer-events: none;
		transform: translate(-50%, -50%);
		z-index: 9998;
	}
</style>
