<script lang="ts">
  /**
   * This page is a demonstration of how to fetch data with cache-while-refresh
  */
  import { afterUpdate } from 'svelte'
  import { routes as r } from '../routes'
  import * as sw from '../swapi'
  import staleWhileRefresh from '../@usvelte/swr';
  import Error from '../components/error.svelte'
  
  export let page: string

  let data: ReturnTypeP<typeof swr.refresh>
  const swr = staleWhileRefresh({
    fetcher: (page: string) => sw.Planets.getPage(Number(page)),
    onUpdate: (next) => data = next,
    initialProps: page
  })
  afterUpdate(() => page && swr.refresh(page))

</script>

<h1>Page: {page}</h1>
<button on:click={() => swr.refresh()} disabled={!!data?.promise}>Refetch</button>
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
{#if data.result}
  <pre>
    {JSON.stringify(data, null, 2)}
  </pre>
{:else if data.error}
  <Error error={data.error} />
{:else}
  <p>Loading...</p>
{/if}