<script lang="ts">
  // import { afterUpdate } from 'svelte';
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
   */
  $: Loaded = (() => {
      const store = writable<any>(undefined)
      if(!globalThis.lazyCache) globalThis.lazyCache = {}
      if (globalThis.lazyCache[key]) {
        store.set(globalThis.lazyCache[key])
      } else {
        loader().then(({default: Loaded}) => {
          store.set(Loaded)
          globalThis.lazyCache[key] = Loaded
        })
      }
      return store
  })()

</script>

<svelte:component this={$Loaded} {...props}/>
