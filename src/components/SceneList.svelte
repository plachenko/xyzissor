<script>
	let { setPointerCapture, ypos, sceneObj, addFunc, remFunc } = $props();
	let toggleShow = $state(true);
	let selected = $state(0);
	let maxHeight = 100;
	let resizing = $state(false);

	$effect(() => {
		console.log(ypos);
		if (sceneObj.geometry.length) {
			selected = sceneObj.geometry.length - 1;
			scroll();
		}
	});

	function scroll(blk = 'start') {
		document
			.getElementsByClassName('selected')[0]
			?.scrollIntoView({ behavior: 'smooth', block: blk });
	}

	function selectIdx(idx) {
		selected = idx;
		scroll('start');
		console.log('selecting..', idx);
	}


	function toggleShowHandle() {
		toggleShow = !toggleShow;
	}

	function handlePointerMove(e) {
		if (resizing) {
			maxHeight = e.clientY - 20;
			console.log(maxHeight);
		}
	}
</script>

<svelte:window
	on:pointermove={handlePointerMove}
/>

<div
	class="select-none border-slate-500 border-1 pointer-events-auto text-sm p-1 bg-slate-300/20 h-max-[300px] flex items-center flex-col text-white absolute right-1 py-1 rounded-md z-[9999]"
>
	<!-- set as options -->
	<div class="flex gap-1 p-2 w-full flex items-center justify-center">
		<div class="flex-1 h-full">
			<button
				disabled={sceneObj.geometry.length == 0}
				onclick={() => remFunc(selected)}
				class="w-full h-full">-</button
			>
		</div>
		<button onclick={() => toggleShowHandle()} class="flex-1 bg-slate-900 rounded-md px-2">
			{sceneObj.geometry.length} Item{sceneObj.geometry.length == 1 ? '' : 's'}
		</button>
		<div class="flex-1">
			<button onclick={addFunc} class="w-full">+</button>
		</div>
	</div>
	{#if toggleShow}
		<ul
			class={`m-0 p-0 border-t-2 max-h-[${maxHeight}px] overflow-y-auto pointer-events-auto border-slate-300/20 border-dashed`}
		>
			{#each sceneObj.geometry as geo, idx}
				<li
					class={`${selected == idx ? 'selected' : ''} relative border-b-1 border-slate-500 ${selected == idx ? 'bg-slate-900' : ''} last:border-none p-2`}
				>
					<!-- <div class="scrollDiv absolute top-[-20px] bg-red-400 w-full h-full"></div> -->
					<div class="flex gap-2">
						<button
							class={idx == selected ? 'border-1' : ''}
							onclick={() => {
								selectIdx(idx);
							}}
						>
							{geo.type}
						</button>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
	{#if sceneObj.geometry.length}
		<div class="border-t-1 w-full pt-2">
			<button class="w-full">Clear All</button>
		</div>
	{/if}
	<button
		onpointerdown={() => resizing = true}
		onpointerleave={() => resizing = false}
		onpointerup={() => resizing = false}
		class="h-[15px] pointer-events-auto w-full absolute left-0 bottom-[-20px] rounded-md bg-slate-500"
	></button>
</div>
