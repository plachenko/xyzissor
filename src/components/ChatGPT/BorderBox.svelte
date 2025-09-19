<script>
	let { p1, p2 } = $props();

	// Offset Y by 27
	$effect(() => {
		adjP1 = { x: p1.x, y: p1.y - 27 };
		adjP2 = { x: p2.x, y: p2.y - 27 };

		dx = Math.abs(adjP2.x - adjP1.x);
		dy = Math.abs(adjP2.y - adjP1.y);

		// Line math
		const x = adjP1.x;
		const y = adjP1.y;
		const w = Math.sqrt(dx * dx + dy * dy);
		const angle = Math.atan2(adjP2.y - adjP1.y, adjP2.x - adjP1.x) * (180 / Math.PI);

		lineStyle = {
			left: `${x}px`,
			top: `${y}px`,
			width: `${w}px`,
			transform: `rotate(${angle}deg)`
		};
	});

	let adjP1,
		adjP2 = $state(null);
	let dx = $state(0),
		dy = $state(0);
	let lineStyle = {};
</script>

<div class="relative w-[400px] h-[300px] bg-gray-900 border border-gray-700 overflow-hidden">
	<!-- Line -->
	<div class="absolute h-[2px] bg-blue-500 origin-left" style={lineStyle}></div>

	<!-- X distance label -->
	<div
		class="absolute text-white text-sm"
		style={`left:${(adjP1.x + adjP2.x) / 2}px; top:${adjP1.y - 15}px; transform:translateX(-50%);`}
	>
		x: {dx}
	</div>

	<!-- Y distance label -->
	<div
		class="absolute text-white text-sm"
		style={`left:${adjP2.x + 10}px; top:${(adjP1.y + adjP2.y) / 2}px; transform:translateY(-50%);`}
	>
		y: {dy}
	</div>
</div>
