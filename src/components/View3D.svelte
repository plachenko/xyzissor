<script>
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

	import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
	import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
	import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
	import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
	import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

	let scene = $state(null);
	const cursorMesh = $state(new THREE.CircleGeometry(0.01));
	let cursorMat = $state(null);
	let cursor = $state(null);

	let outlinePass = $state(null);

	let geoParams = $state({
		x: 0.2,
		y: 0.2,
		z: 0.2
	});

	let camLock = $state(false);
	let composer = $state(null);
	let geoParamArray = $state([{ ...geoParams }, { ...geoParams }]);

	onMount(() => {});

	$effect(() => {
		if (camLock && camera) {
			camera.position.set(
				geoParamArray[geoMode].x,
				geoParamArray[geoMode].y,
				geoParamArray[geoMode].z
			);
			camera.lookAt(cursor);
		}

		if (cursor) {
			if (geoMode == 0) {
				cursor.position.x = geoParamArray[0].x;
				cursor.position.y = geoParamArray[0].y;
				cursor.position.z = geoParamArray[0].z;
			}

			if (geoMode == 1 && selectedIdx) {
				sceneObj.geometry[selectedIdx - 1].meshInfo.mesh.scale.set(
					geoParamArray[1].x,
					geoParamArray[1].y,
					geoParamArray[1].z
				);
			}
		}
	});
</script>
