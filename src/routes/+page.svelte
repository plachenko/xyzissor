<script>
	import { onMount } from 'svelte';

	import SceneList from '../components/SceneList.svelte';
	import PointerTracker from '../components/ChatGPT/PointerTracker.svelte';
	import Pane from '../components/Claude/Pane.svelte';
	import RadialMenu from '../components/Claude/RadialMenu.svelte';
	import View3D from '../components/View3D.svelte';

	let pointerDn = $state(null);
	let selectedIdx = $state(null);
	let setPointerLock = $state(false);
	let scene = $state(null);

	$effect(() => {
		$inspect(pointerDn);
	});

	let controls = $state(null);
	let pointPos = $state(null);

	let pointerCapture = $state(false);

	function setPointerDn(pos) {
		if (!pos) {
			pointPos = null;
			return;
		}

		pointPos = {
			y: ~~pos.y - 1,
			x: ~~pos.x - 1
		};
	}
</script>

<RadialMenu {pointPos} />
<div class=" absolute w-full h-full pointer-events-none">
	<!-- Object List -->

	<!-- <div class="absolute left-0 top-0 pointer-events-auto w-full h-full" bind:this={sceneEl}></div> -->
	<!-- <Pane {sceneEl} /> -->

	<PointerTracker {setPointerDn} {setPointerLock} />
	<!--
	<div
		class={`${pointerCapture ? 'pointer-events-auto visible' : 'pointer-events-none invisible'} bg-red-400 w-full h-full absolute left-0 top-0 z-[9999]`}
		onlostpointercapture={() => {
			pointerCapture = false;
		}}
		bind:this={pointerEl}
	></div>
	<SceneList {selectedIdx} {setPointerCapture} {sceneObj} {addFunc} {remFunc} />
	<div class="z-998 select-none pointer-events-none h-full w-full absolute top-0 left-0">
		<div class="rounded-md bg-red-300 w-full pointer-events-auto absolute bottom-0 flex flex-col">
			<div class="p-1 flex gap-1 border-b-2 border-dashd">
				<button onclick={() => (camLock = !camLock)} class={`${camLock ? 'font-bold' : ''} w-full`}
					>Lock Cam</button
				>
				<button onclick={resetGeoParams} class="w-full">Reset</button>
			</div>
			<div class="flex p-1 gap-1">
				{#each geoControls as control, idx}
					<button
						onclick={() => switchGeoMode(idx)}
						class={`${idx == geoMode ? 'font-bold border-2' : ''} flex-1`}>{control}</button
					>
				{/each}
			</div>
			<div class="flex">
				{#each Object.keys(geoParamArray[geoMode]) as paramName, idx}
					<div class="flex-1 flex flex-col items-center w-full p-2 last:border-r-0 border-r-2">
						<div class="mb-2 border-b-2 border-slate-600/70 border-dashed w-full text-center">
							{paramName}: {geoParamArray[geoMode][paramName]}
						</div>
						<input
							class="w-full"
							max={2}
							min={-2}
							step=".01"
							type="range"
							bind:value={geoParamArray[geoMode][paramName]}
						/>
					</div>
				{/each}
			</div>
		</div>
	</div>
  -->
</div>
