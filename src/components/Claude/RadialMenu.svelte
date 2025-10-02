<script>
  let isOpen = $state(false);
  let position = $state({ x: 0, y: 0 });
  let hoveredIndex = $state(-1);
  let selectedItem = $state(null);
  let containerRef = $state(null);
  
  const menuItems = [
    { label: 'Cut', icon: '✂️', color: 'bg-red-500' },
    { label: 'Copy', icon: '📋', color: 'bg-blue-500' },
    { label: 'Paste', icon: '📄', color: 'bg-green-500' },
    { label: 'Delete', icon: '🗑️', color: 'bg-orange-500' },
    { label: 'Share', icon: '🔗', color: 'bg-purple-500' },
    { label: 'Save', icon: '💾', color: 'bg-teal-500' },
  ];

  const radius = 120;
  const itemSize = 60;

  function handlePointerDown(e) {
    e.preventDefault();
    const rect = containerRef.getBoundingClientRect();
    position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    isOpen = true;
    hoveredIndex = -1;
  }

  function handlePointerMove(e) {
    if (!isOpen) return;
    
    const rect = containerRef.getBoundingClientRect();
    const centerX = position.x;
    const centerY = position.y;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 30) {
      hoveredIndex = -1;
      return;
    }
    
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    angle = (angle + 360) % 360;
    
    const segmentAngle = 360 / menuItems.length;
    const startAngle = -90 - segmentAngle / 2;
    const adjustedAngle = (angle - startAngle + 360) % 360;
    const index = Math.floor(adjustedAngle / segmentAngle) % menuItems.length;
    
    hoveredIndex = index;
  }

  function handlePointerUp() {
    if (isOpen && hoveredIndex >= 0) {
      selectedItem = menuItems[hoveredIndex].label;
      setTimeout(() => selectedItem = null, 2000);
    }
    isOpen = false;
    hoveredIndex = -1;
  }

  $effect(() => {
    if (isOpen) {
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
      
      return () => {
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
      };
    }
  });

  function getItemPosition(index) {
    const angle = (index * (360 / menuItems.length) - 90) * (Math.PI / 180);
    return {
      x: position.x + Math.cos(angle) * radius,
      y: position.y + Math.sin(angle) * radius
    };
  }
</script>

<div class="w-full h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
  <div 
    bind:this={containerRef}
    class="relative w-full h-full cursor-pointer select-none"
    onpointerdown={handlePointerDown}
    role="button"
    tabindex="0"
  >
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div class="text-center text-white">
        <h1 class="text-4xl font-bold mb-4">Radial Menu Demo</h1>
        <p class="text-xl text-gray-300">Hold down anywhere to open the menu</p>
        <p class="text-sm text-gray-400 mt-2">Move while holding to select an item</p>
        {#if selectedItem}
          <div class="mt-6 p-4 bg-green-500 rounded-lg text-white font-semibold animate-pulse">
            Selected: {selectedItem}
          </div>
        {/if}
      </div>
    </div>

    {#if isOpen}
      <div 
        class="absolute w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"
        style="left: {position.x}px; top: {position.y}px;"
      />
      
      <svg
        class="absolute inset-0 pointer-events-none"
        style="left: 0; top: 0; width: 100%; height: 100%;"
      >
        {#each menuItems as _, index}
          {@const pos = getItemPosition(index)}
          <line
            x1={position.x}
            y1={position.y}
            x2={pos.x}
            y2={pos.y}
            stroke={hoveredIndex === index ? '#fff' : '#555'}
            stroke-width={hoveredIndex === index ? 3 : 1}
            class="transition-all duration-150"
          />
        {/each}
      </svg>

      {#each menuItems as item, index}
        {@const pos = getItemPosition(index)}
        {@const isHovered = hoveredIndex === index}
        
        <div
          class="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-150 {isHovered ? 'scale-125' : 'scale-100'}"
          style="left: {pos.x}px; top: {pos.y}px; width: {itemSize}px; height: {itemSize}px;"
        >
          <div 
            class="w-full h-full rounded-full {item.color} flex flex-col items-center justify-center text-white shadow-lg {isHovered ? 'ring-4 ring-white' : ''}"
          >
            <span class="text-2xl">{item.icon}</span>
            <span class="text-xs font-semibold mt-1">{item.label}</span>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }
</style>