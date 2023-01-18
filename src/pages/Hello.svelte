<script lang="ts">
  import type {RouteMatch} from '../@usvelte/router'
  import LayoutDefault from '../components/layout-default.svelte'
  import Filler from '../components/filler.svelte'
  export let route: RouteMatch
</script>

<LayoutDefault>
  <h1>Hello, {route.urlParams.name}.</h1>
  <Filler />
</LayoutDefault>
