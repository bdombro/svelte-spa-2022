<script lang="ts">
  import { afterUpdate } from 'svelte';
	
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
   * The loaded component or undefined
   */
  let Loaded = undefined
  let keyLast = ''
  
  
  const load = () => {
    if (key !== keyLast) {
      keyLast = key
      if(!globalThis.lazyCache) globalThis.lazyCache = {}
      if (globalThis.lazyCache[key]) {
        Loaded = globalThis.lazyCache[key]
        return
      } else {
        loader().then((module) => {
          Loaded = module.default
          globalThis.lazyCache[key] = Loaded
        })
      }
    }
  }
  load()
  afterUpdate(load);

</script>

<svelte:component this={Loaded} {...props}/>
