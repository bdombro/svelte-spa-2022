<script lang="ts">
  import type {RouteMatch} from '../../@usvelte/router'
  import staleWhileRefresh from '../../@usvelte/swr';
  import router from '../../router'
  import LayoutDefault from '../../components/layout-default.svelte'
  import * as sw from '../../swapi'
  
  export let route: RouteMatch

  $: page = route.urlParams.page

  $: data = staleWhileRefresh({
    fetcher: (_page: typeof page) => sw.Planets.getPage(Number(_page)),
    props: [page]
  })

</script>

<LayoutDefault>
  <h1>Page: {page}</h1>
  <button on:click={() => $data.refresh()} disabled={$data.loading}>Refetch</button>
  <button disabled={page === '1'} on:click={() => {
    router.goto(route, { page: `${Number(page) - 1}`})
  }}>
    Prior Page
  </button>
  <button on:click={() => {
    router.goto(route, { page: `${Number(page) + 1}`})
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
</LayoutDefault>