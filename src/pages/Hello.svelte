<script lang="ts">
  import type {RouteMatch} from '../@usvelte/router'
  import LayoutDefault from '../components/LayoutDefault.svelte'
  import Filler from '../components/Filler.svelte'
  export let route: RouteMatch
</script>

<LayoutDefault>
  <h1>Hello, {route.urlParams.name}.</h1>
  <Filler />
</LayoutDefault>
