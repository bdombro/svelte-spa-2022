<script lang="ts">
  /**
   * This page is a demonstration of how to fetch data with cache-while-refresh
  */
  import { routes as r } from '../routes'
  import * as sw from '../swapi'
  import staleWhileRefresh from '../@usvelte/swr';
  import Error from '../components/error.svelte'
  
  export let page: string

  $: data = staleWhileRefresh({
    fetcher: (_page: typeof page) => sw.Planets.getPage(Number(_page)),
    props: [page]
  })

</script>

<h1>Page: {page}</h1>
<button on:click={() => $data.refresh()} disabled={!!$data.promise}>Refetch</button>
<button disabled={page === '1'} on:click={() => {
  // TODO: Need a more elegant way to do this
  history.pushState(Date.now(), '', r.val.planets.toPath({ page: `${Number(page) - 1}`}))
}}>
  Prior Page
</button>
<button on:click={() => {
  history.pushState(Date.now(), '', r.val.planets.toPath({ page: `${Number(page) + 1}`}))
}}>
  Next Page
</button>
{#if $data.result}
  <pre>
    {JSON.stringify($data.result, null, 2)}
  </pre>
{:else if $data.error}
  <Error error={$data.error} />
{:else}
  <p>Loading...</p>
{/if}