<script lang="ts">
  import type {RouteMatch} from '../@usvelte/router'
  import Filler from '../components/Filler.svelte'
  export let route: RouteMatch
</script>

<h1>Hello, {route.args.name}.</h1>
<Filler />
