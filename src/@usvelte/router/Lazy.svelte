<script lang="ts">
  import { writable } from 'svelte/store';
	
  /**
   * A unique cache key that identifies the component to be loaded
   */
  export let key: string
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
   * The loaded component: undefined while loading
   * 
   * Uses a cache so that recall is synchronous. If didn't,
   * there will be flicker and browser scroll restoration
   * would fail.
   */
  if(!globalThis.lc) globalThis.lc = new Map()
  let lc: Map<string, any> = globalThis.lc
  let Loaded = writable<{ module: any, props: any}>({
    // Default = cache. Undefined will cause flicker
    module: lc.get(key),
    // Store props in loaded so that we never render the prior component with next props
    props
  })
  
  $: {
    const cached = lc.get(key)
    if (cached) {
      if (cached !== $Loaded?.module || props !== $Loaded?.props)
        Loaded.set({module: cached, props})
      // else do nothing bc already loaded
    } else {
      loader().then((m) => {
        Loaded.set({module: m.default, props})
        lc.set(key, m.default)
      })
    }
  }

</script>
<svelte:component this={$Loaded?.module} {...$Loaded?.props}/>
