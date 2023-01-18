<script lang="ts">
  import { onMount } from 'svelte';
  import attach from './attach'
  import Lazy from './Lazy.svelte'
  import type { RouteMatch, RoutesInstance } from './Routes'

  export let routes: RoutesInstance

  let current: RouteMatch

  const updateRoute = (route: RouteMatch) => {
    current = route
  }
  updateRoute(routes.find(new URL(location.href)))

	onMount(() => attach(routes, updateRoute))
</script>

<Lazy key={current.key} loader={current.loader} props={{ route: current, url: new URL(location.href)}}  />
