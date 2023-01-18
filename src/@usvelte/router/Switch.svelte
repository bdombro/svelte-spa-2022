<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import Lazy from './Lazy.svelte'
  import type { RouterInstance } from './router'

  export let router: RouterInstance

  let current = router.find(new URL(location.href))
  
  let onChange = route => current = route
	
  onMount(() => router.subscribe(onChange))
  onDestroy(() => router.unsubscribe(onChange))
</script>

<Lazy loader={current.loader} props={{ route: current, url: new URL(location.href)}} onLoad={router.scrollRestore}  />
