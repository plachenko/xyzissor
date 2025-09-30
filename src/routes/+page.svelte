<script>
	import * as THREE from 'three';
	import { onMount } from 'svelte';
	import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
	import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
	import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';

	import SceneList from '../components/SceneList.svelte';
	import PointerTracker from '../components/ChatGPT/PointerTracker.svelte';

	let scene = $state(null);
	const cursorMesh = $state(new THREE.CircleGeometry(0.01));
	let cursorMat = $state(null);
	let cursor = $state(null);

	let geoParams = $state({
		x: 0.2,
		y: 0.2,
		z: 0.2
	});

	let camLock = $state(false);

	let geoParamArray = $state([{ ...geoParams }, { ...geoParams }]);

	function switchGeoMode(_mode) {
		geoMode = _mode;
	}

	$effect(() => {
		// console.log(camLock);
		$inspect(camLock);

		if (camLock && camera) {
			camera.position.set(
				geoParamArray[geoMode].x + 0.2,
				geoParamArray[geoMode].y + 0.2,
				geoParamArray[geoMode].z + 0.2
			);
			camera.lookAt(cursor);
		}
		//console.log('changeMode');
		// geoParamArray[geoMode] = {...geoParams};
		$inspect(geoParamArray);
		/*


    */
		if (cursor) {
			if (geoMode == 0) {
				cursor.position.x = geoParamArray[0].x;
				cursor.position.y = geoParamArray[0].y;
				cursor.position.z = geoParamArray[0].z;
			}
		}
	});

	let controls = $state(null);

	let pointerCapture = $state(false);

	let sceneEl = $state(null);
	let pointerEl = $state(null);

	let geoMode = $state(0);
	let geoControls = $state(['cursor', 'geometry']);

	const sceneObj = $state({
		title: 'untitled',
		geometry: []
	});

	function resetGeoParams() {
		console.log('huh');
		geoParams = {
			x: 0,
			y: 0,
			z: 0
		};
		geoParamArray[geoMode] = { ...geoParams };
	}

	function addObj(type = 'BoxGeometry') {
		const meshInfo = {
			mesh: null,
			geo: null,
			mat: null
		};

		switch (type) {
			case 'BoxGeometry':
				meshInfo.geo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
				meshInfo.mat = new THREE.MeshNormalMaterial();
				meshInfo.mesh = new THREE.Mesh(meshInfo.geo, meshInfo.mat);
				break;
		}

		return meshInfo;
	}

	function remFunc(idx) {
		// if (!idx) return;
		let curObj = sceneObj.geometry[idx];
		sceneObj.geometry.splice(idx, 1);

		scene.remove(curObj.meshInfo.mesh);
	}

	function addFunc() {
		const geometry = new THREE.BoxGeometry(
			geoParamArray[1].x,
			geoParamArray[1].y,
			geoParamArray[1].z
		);
		const mat = new THREE.MeshNormalMaterial();
		const mesh = new THREE.Mesh(geometry, mat);

		scene.add(mesh);

		let _obj = {
			type: 'BoxGeometry',
			size: new THREE.Vector3(0.2, 0.2, 0.2),
			pos: new THREE.Vector3(...cursor.position)
		};

		mesh.position.set(...cursor.position);
		console.log(cursor.position);

		// _obj.meshInfo = addObj([_obj.type]);
		_obj.meshInfo = {
			geo: geometry,
			mat: mat,
			mesh: mesh
		};

		sceneObj.geometry.push({
			..._obj
		});
	}

	const opts = $state([
		{
			name: 'add',
			func: () => {
				addFunc();
			}
		},
		{
			name: 'del',
			func: () => {}
		},
		{
			name: 'clr',
			func: () => {
				clearAll();
			}
		}
	]);

	const cursorObj = {
		pos: new THREE.Vector3(0, 0, 0)
	};

	function clickHndl(obj, evt) {
		obj.func();
	}
	let camera = $state(null);

	function clearAll() {
		sceneObj.geometry.forEach((e) => {
			if (e?.meshInfo) return;
			/*
			scene.remove(e.meshInfo.mesh);
			e.meshInfo.geometry.dispose();
			e.meshInfo.material.dispose();
      */
		});
	}

	/*
  addSceneListObj(){
    addObj();

  }
  */

	function addSceneObjs(list) {
		if (!list?.length) return;

		list.forEach((itm) => {
			let mesh = addObj(itm.type).mesh;
			scene.add(mesh);
		});
	}

	function resetControls() {
		controls.reset();
	}

	onMount(() => {
		const width = window.innerWidth;
		const height = window.innerHeight;

		camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 10);
		camera.position.z = 0.5;
		camera.position.y = 0.5;
		camera.position.x = 0.5;
		camera.lookAt(new THREE.Vector3(0, 0, 0));

		scene = new THREE.Scene();

		const size = 10;
		const divisions = 10;
		const gridHelper = new THREE.GridHelper(size, divisions);
		scene.add(gridHelper);

		cursorMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
		cursorMat.depthTest = false;
		cursorMat.depthWrite = false;
		cursorMat.renderOrder = 9;

		cursor = new THREE.Mesh(cursorMesh, cursorMat);
		scene.add(cursor);

		const renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize(width, height);
		renderer.setAnimationLoop(animate);
		sceneEl.appendChild(renderer.domElement);

		controls = new OrbitControls(camera, renderer.domElement);
		controls.update();

		window.addEventListener('resize', () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();

			renderer.setSize(window.innerWidth, window.innerHeight);
		});

		// animation

		function animate(time) {
			controls.update();

			cursor.lookAt(camera.position);

			renderer.render(scene, camera);
		}
	});

	function setPointerCapture(state = false) {
		pointerCapture = state;
	}
</script>

<div class="p-2 absolute w-full h-full pointer-events-none">
	<!-- Object List -->

	<PointerTracker {scene} {resetControls} />
	<div
		class={`${pointerCapture ? 'pointer-events-auto visible' : 'pointer-events-none invisible'} bg-red-400 w-full h-full absolute left-0 top-0 z-[9999]`}
		onlostpointercapture={() => {
			pointerCapture = false;
		}}
		bind:this={pointerEl}
	></div>
	<div class="absolute left-0 top-0 pointer-events-auto" bind:this={sceneEl}></div>
	<SceneList {setPointerCapture} {sceneObj} {addFunc} {remFunc} />

	<!--
	{#each opts as optItem}
		<button
			onclick={(e) => {
				clickHndl(optItem, e);
			}}
			class="mt-1 bg-red-300 size-10 pointer-events-auto rounded-md flex items-center justify-center"
		>
			{optItem.name}
		</button>
	{/each}
  -->
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
</div>
