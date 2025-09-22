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

	let controls = $state(null);

	let pointerCapture = $state(false);

	let sceneEl = $state(null);
	let pointerEl = $state(null);

	const sceneObj = $state({
		title: 'untitled',
		geometry: []
	});

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
		const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
		const mat = new THREE.MeshNormalMaterial();
		const mesh = new THREE.Mesh(geometry, mat);

		scene.add(mesh);

		let _obj = {
			type: 'BoxGeometry',
			size: new THREE.Vector3(0.2, 0.2, 0.2),
			pos: new THREE.Vector3(0.2, 0.2, 0.2)
		};

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

		const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 10);
		camera.position.z = 0.5;
		camera.position.y = 0.5;
		camera.position.x = 0.5;

		scene = new THREE.Scene();

		const size = 10;
		const divisions = 10;
		const gridHelper = new THREE.GridHelper(size, divisions);
		scene.add(gridHelper);

		cursorMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
		cursorMat.depthTest = false;
		cursorMat.depthWrite = false;

		cursor = new THREE.Mesh(cursorMesh, cursorMat);
		scene.add(cursor);

		const renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize(width, height);
		renderer.setAnimationLoop(animate);
		sceneEl.appendChild(renderer.domElement);

		controls = new OrbitControls(camera, renderer.domElement);
		controls.update();

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

	<PointerTracker {resetControls} />
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
</div>
