<script>
  import ButtonIcon from "./ButtonIcon.svelte";
  let { 
    id,
    depth = 0,
    parentSplitDirection = null,
    isFirstChild = false,
    onMergeToSibling = null,
    siblingHasChildren = false,
    onPanePopped = null,
    onPaneRestored = null,
    sceneEl = null
  } = $props();
  
  let children = $state([]);
  let splitRatio = $state(50);
  let splitDirection = $state('horizontal');
  let isDragging = $state(false);
  let containerRef = $state();
  let poppedWindow = $state(null);
  let isPopped = $state(false);
  let savedState = $state(null);
  
  function handleSplit(direction) {
    const newChildren = [
      { id: `${id}-1`, depth: depth + 1 },
      { id: `${id}-2`, depth: depth + 1 }
    ];
    children = newChildren;
    splitDirection = direction;
    splitRatio = 50;
  }
  
  function handleMergeChild(keepIndex) {
    children = [];
  }
  
  function handlePopOut() {
    if (isPopped && poppedWindow && !poppedWindow.closed) {
      // Pop back in
      poppedWindow.close();
      poppedWindow = null;
      isPopped = false;
      
      // Restore state
      if (savedState && onPaneRestored) {
        onPaneRestored(savedState);
      }
      return;
    }
    
    // Save current state before popping out
    savedState = {
      id,
      children: JSON.parse(JSON.stringify(children)),
      splitRatio,
      splitDirection,
      depth,
      parentSplitDirection,
      isFirstChild
    };
    
    // Open new window
    const newWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (newWindow) {
      poppedWindow = newWindow;
      isPopped = true;
      
      // Style the popped window
      newWindow.document.write("hello");
      newWindow.document.close();
      
      // Check if window was closed
      const checkClosed = setInterval(() => {
        if (poppedWindow && poppedWindow.closed) {
          clearInterval(checkClosed);
          isPopped = false;
          poppedWindow = null;
          // Window closed without pop-in button, lost state
          savedState = null;
        }
      }, 500);
      
      // Notify parent to auto-merge
      if (onPanePopped) {
        onPanePopped();
      }
    }
  }
  
  function handleMouseDown(e) {
    e.preventDefault();
    isDragging = true;
  }
  
  function handleMouseMove(e) {
    if (!isDragging || !containerRef) return;
    
    const rect = containerRef.getBoundingClientRect();
    
    if (splitDirection === 'horizontal') {
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      splitRatio = Math.min(Math.max(percentage, 10), 90);
    } else {
      const y = e.clientY - rect.top;
      const percentage = (y / rect.height) * 100;
      splitRatio = Math.min(Math.max(percentage, 10), 90);
    }
  }
  
  function handleMouseUp() {
    isDragging = false;
  }
  
  $effect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  });
  
  const colors = [
    'bg-blue-50',
    'bg-green-50',
    'bg-purple-50',
    'bg-yellow-50',
    'bg-pink-50'
  ];
  
  let canMergeUp = $derived(
    parentSplitDirection === 'vertical' && 
    !isFirstChild && 
    !(siblingHasChildren && children.length > 0 && splitDirection !== 'vertical')
  );
  
  let canMergeDown = $derived(
    parentSplitDirection === 'vertical' && 
    isFirstChild && 
    !(siblingHasChildren && children.length > 0 && splitDirection !== 'vertical')
  );
  
  let canMergeLeft = $derived(
    parentSplitDirection === 'horizontal' && 
    !isFirstChild && 
    !(siblingHasChildren && children.length > 0 && splitDirection !== 'horizontal')
  );
  
  let canMergeRight = $derived(
    parentSplitDirection === 'horizontal' && 
    isFirstChild && 
    !(siblingHasChildren && children.length > 0 && splitDirection !== 'horizontal')
  );
</script>

<div class="pointer-events-auto h-full w-full">
{#if isPopped}
  <div class="flex flex-col h-full w-full border-2 border-dashed border-purple-400 rounded-lg bg-purple-50 opacity-50">
    <div class="flex items-center justify-between px-4 py-2 bg-purple-100 border-b border-purple-300">
      <span class="font-semibold text-purple-700">Pane {id} (Popped Out)</span>
    </div>
    <div class="flex-1 flex items-center justify-center p-4">
      <p class="text-purple-600 text-center">This pane is currently in a separate window</p>
    </div>
  </div>
{:else if children.length > 0}
  <div 
    bind:this={containerRef}
    class="flex {splitDirection === 'horizontal' ? 'flex-row' : 'flex-col'} h-full w-full relative"
  >
    <div 
      style={splitDirection === 'horizontal' ? `width: ${splitRatio}%` : `height: ${splitRatio}%`}
      class={splitDirection === 'horizontal' ? 'h-full' : 'w-full'}
    >
      <svelte:self
        id={children[0].id}
        depth={children[0].depth}
        parentSplitDirection={splitDirection}
        isFirstChild={true}
        onMergeToSibling={() => handleMergeChild(0)}
        siblingHasChildren={children[1] && children.length > 0}
        onPanePopped={() => handleMergeChild(0)}
        sceneEl={sceneEl}
      />
    </div>
    
    <div
      class="bg-gray-400 hover:bg-blue-500 flex-shrink-0 relative group {splitDirection === 'horizontal' ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize'}"
      onmousedown={handleMouseDown}
      role="separator"
      tabindex="0"
    >
      <div 
        class="absolute z-10 {splitDirection === 'horizontal' ? 'inset-0 w-3 -left-1' : 'inset-0 h-3 -top-1'}"
        onmousedown={handleMouseDown}
      ></div>
    </div>
    
    <div 
      style={splitDirection === 'horizontal' ? `width: ${100 - splitRatio}%` : `height: ${100 - splitRatio}%`}
      class={splitDirection === 'horizontal' ? 'h-full' : 'w-full'}
    >
      <svelte:self
        id={children[1].id}
        depth={children[1].depth}
        parentSplitDirection={splitDirection}
        isFirstChild={false}
        onMergeToSibling={() => handleMergeChild(1)}
        siblingHasChildren={children[0] && children.length > 0}
        onPanePopped={() => handleMergeChild(1)}
      />
    </div>
  </div>
{:else}
  <div class="flex flex-col h-full w-full border border-gray-300 overflow-hidden {colors[depth % colors.length]}">
    <div class="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-300">
      <span class="font-semibold text-gray-700">Pane {id}</span>
      <div class="flex gap-1">
      <button
          onclick={handlePopOut}
          class="px-2 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors flex items-center gap-1"
          title="Pop Out to Window"
        >
          <ButtonIcon type="popOut" />
        </button>
        {#if canMergeUp}
          <button
            onclick={onMergeToSibling}
            class="px-2 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
            title="Merge Up"
          >
            <ButtonIcon type="mergeUp" />
          </button>
        {/if}
        {#if canMergeDown}
          <button
            onclick={onMergeToSibling}
            class="px-2 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
            title="Merge Down"
          >
            <ButtonIcon type="mergeDown" />
          </button>
        {/if}
        {#if canMergeLeft}
          <button
            onclick={onMergeToSibling}
            class="px-2 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
            title="Merge Left"
          >
            <ButtonIcon type="mergeLeft" />
          </button>
        {/if}
        {#if canMergeRight}
          <button
            onclick={onMergeToSibling}
            class="px-2 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
            title="Merge Right"
          >
            <ButtonIcon type="mergeRight" />
          </button>
        {/if}
      </div>
    </div>
    <div class="flex-1 flex items-center justify-center p-4 relative">
      <div class="absolute right-3 top-3">
        <button
          onclick={() => handleSplit('horizontal')}
          class="flex items-center gap-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2"/>
            <path d="M12 3v18"/>
          </svg>
        </button>
      </div>
      <div class="absolute bottom-3 left-3">
        <button
          onclick={() => handleSplit('vertical')}
          class="flex items-center gap-2 px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2"/>
            <path d="M3 12h18"/>
          </svg>
        </button>
      </div>
        {#if sceneEl}
        <div class="h-full w-full">
          {@html sceneEl.html}
        </div>
        {:else}
        <p class="text-gray-600">
          Content area for pane {id} without external DOM element
        </p>
        {/if}
        
    </div>
  </div>
{/if}
    
</div>