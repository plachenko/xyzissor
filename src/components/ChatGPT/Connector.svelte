<script>
	import BorderBox from './BorderBox.svelte';
	// Props (p1 and p2 are passed in)
	let { p1, p2 } = $props();

	// Derived values
	let dx = $derived(p2.x - p1.x);
	let dy = $derived(p2.y - p1.y);
	let distance = $derived(Math.sqrt(dx * dx + dy * dy));
	let angle = $derived(Math.atan2(dy, dx) * (180 / Math.PI));
</script>

<!-- Filled rectangle from p1 → p2 -->
<!-- <BorderBox {p1} {p2} /> -->
<div
	class="
  bar
  z-[9999]
  rounded-full
  border-2
  flex
  justify-center
  items-center
  border-dashed
  border-white/20
  pointer-events-none
  "
	style={`
		width: ${distance}px;
		left: ${p1.x}px;
		top: ${p1.y - 27}px;
		transform: rotate(${angle}deg);
	`}
>
	<!--
	<div
		class="border-white border-2 border-dotted absolute z-[9999]"
		style={`
    top:0px 
		left: 0px;
		height: ${p2.y}px;
		width: ${p2.x}px;
		transform: rotate(${-angle}deg);
	`}
	></div>
  -->
	<div
		class="font-bold text-white whitespace-nowrap"
		style={`

		transform: rotate(${-angle}deg);
`}
	>
		{~~distance} px
	</div>
</div>

<style>
	.bar {
		position: fixed;
		height: 60px; /* thickness */
		background: rgba(0, 128, 255, 0.5);

		transform-origin: left center; /* anchor rectangle at p1 */
	}
</style>
