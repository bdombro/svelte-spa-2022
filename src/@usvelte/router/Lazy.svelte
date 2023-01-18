<script lang="ts">
  import { tick } from 'svelte';
  import { writable } from 'svelte/store';
	
  /**
   * A callback that loads a Svelte component, i.e. 
   * ```typescript
   * () => import('./Index.svelte')`
   * ```
   */
  export let loader = null
  /**
   * Props to be passed to the loaded component
   */
  export let props = {}

  /**
   * Callback to be called when the component is loaded
  */
  export let onLoad = () => {}

  /**
   * The loaded component: undefined while loading
   */
  let state = writable<{
    /** A loaded module. Default = cache. Without cache, back scroll restore would fail. */
    module: any,
    /** Props for the module */
    props: any
  }
  >()
  
  $: {
    loader().then(async (module) => {
      if (!module) return
      state.set({module, props})
      await tick()
      onLoad()
    })
  }

</script>

<svelte:component this={$state?.module?.default} {...$state?.props}/>