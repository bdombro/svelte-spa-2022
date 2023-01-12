<script lang="ts">
  import type {RouteMatch} from '../@usvelte/router'
  export let route: RouteMatch
</script>
<h1>{route.title}</h1>
