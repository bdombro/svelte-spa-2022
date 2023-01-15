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
  $: Loaded = (() => {
      const store = writable<any>(undefined)
      if(!globalThis.lc) globalThis.lc = {}
      if (globalThis.lc[key]) {
        store.set(globalThis.lc[key])
      } else {
        loader().then(({default: Loaded}) => {
          store.set(Loaded)
          globalThis.lc[key] = Loaded
        })
      }
      return store
  })()

</script>

<svelte:component this={$Loaded} {...props}/>
