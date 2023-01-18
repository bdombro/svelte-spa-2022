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
  let Loaded = writable<{ m: any, props: any}>({
    // Default = cache. Undefined will cause flicker
    m: lc.get(key),
    // Store props in loaded so that we never render the prior component with next props
    props
  })
  
  $: {
    const cached = lc.get(key)
    if (cached) {
      if (cached !== $Loaded?.m || props !== $Loaded?.props)
        Loaded.set({m: cached, props})
      // else do nothing bc already loaded
    } else {
      loader().then((m) => {
        if (!m) return
        Loaded.set({m, props})
        lc.set(key, m)
      })
    }
  }

</script>
<svelte:component this={$Loaded?.m?.default} {...$Loaded?.props}/>
