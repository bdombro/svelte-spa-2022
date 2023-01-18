<script lang="ts">
  import { tick } from 'svelte';
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
  let Loaded = writable<{
    /** A loaded module. Default = cache. Without cache, back scroll restore would fail. */
    m: any,
    /** Props for the module */
    p: any
  }
  >({m: lc.get(key), p: props})
  
  $: {
    const cached = lc.get(key)
    if (cached) {
      if (cached !== $Loaded?.m || props !== $Loaded?.p)
        Loaded.set({m: cached, p: props})
        tick().then(() => dispatchEvent(new Event('lazy-loaded')))
      // else do nothing bc already loaded
    } else {
      loader().then((m) => {
        if (!m) return
        Loaded.set({m, props})
        lc.set(key, m)
        tick().then(() => dispatchEvent(new Event('lazy-loaded')))
      })
    }
  }

</script>
<svelte:component this={$Loaded?.m?.default} {...$Loaded?.p}/>
