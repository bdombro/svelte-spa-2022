<script lang="ts">
  import type {RouteMatch} from '../@usvelte/router'
  export let route: RouteMatch
</script>
<h1>Home</h1>
<button on:click={async () => {throw new Error('test')}}>Test Error Boundary</button>
