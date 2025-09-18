<script>
	// Props (p1 and p2 are passed in)
	let { p1, p2 } = $props();

	// Derived values
	let dx = $derived(p2.x - p1.x);
	let dy = $derived(p2.y - p1.y);
	let distance = $derived(Math.sqrt(dx * dx + dy * dy));
	let angle = $derived(Math.atan2(dy, dx) * (180 / Math.PI));
</script>

<!-- Filled rectangle from p1 → p2 -->
<div
	class="bar z-[9999] rounded-full border-2 border-dashed border-white/20 pointer-events-none"
	style="
		width: {distance+27}px;
		left: {p1.x}px;
		top: {p1.y-27}px;
		transform: rotate({angle}deg);
	"
/>

<style>
	.bar {
		position: fixed;
		height: 60px; /* thickness */
		background: rgba(0, 128, 255, 0.5);
		
        transform-origin: left center; /* anchor rectangle at p1 */
	}
</style>
