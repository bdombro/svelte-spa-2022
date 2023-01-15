<script lang="ts">
  import {goto, type RouteMatch} from '../@usvelte/router'
  import staleWhileRefresh from '../@usvelte/swr';
  import * as sw from '../swapi'
  
  export let route: RouteMatch

  $: page = route.args.page

  $: data = staleWhileRefresh({
    fetcher: (_page: typeof page) => sw.Planets.getPage(Number(_page)),
    props: [page]
  })

</script>

<h1>Page: {page}</h1>
<button on:click={() => $data.refresh()} disabled={$data.loading}>Refetch</button>
<button disabled={page === '1'} on:click={() => {
  goto(route.toPath({ page: `${Number(page) - 1}`}))
}}>
  Prior Page
</button>
<button on:click={() => {
  goto(route.toPath({ page: `${Number(page) + 1}`}))
}}>
  Next Page
</button>
{#if $data.result}
  {#each $data.result as planet}
    <h3>{planet.name}</h3>
    <ul>
    {#each Object.entries(planet).slice(1) as [key, value]}
      <li>{key}: {value}</li>
    {/each}
    </ul>
  {/each}
{/if}