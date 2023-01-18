<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import Lazy from './Lazy.svelte'
  import type { RoutesInstance } from './Routes'

  export let routes: RoutesInstance

  let current = routes.find(new URL(location.href))
  
  let onChange = route => current = route
	
  onMount(() => routes.subscribe(onChange))
  onDestroy(() => routes.unsubscribe(onChange))
</script>

<Lazy key={current.key} loader={current.loader} props={{ route: current, url: new URL(location.href)}} onLoad={routes.scrollRestore}  />
