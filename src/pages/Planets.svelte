<script lang="ts">
  import type {RouteMatch} from '../@usvelte/router'
  import staleWhileRefresh from '../@usvelte/swr';
  import * as sw from '../swapi'
  import Error from '../components/error.svelte'
  
  export let route: RouteMatch
  $: page = route.args.page

  $: data = staleWhileRefresh({
    fetcher: (_page: typeof page) => sw.Planets.getPage(Number(_page)),
    props: [page]
  })

</script>

<h1>Page: {page}</h1>
<button on:click={() => $data.refresh()} disabled={!!$data.promise}>Refetch</button>
<button disabled={page === '1'} on:click={() => {
  // TODO: Need a more elegant way to do this
  history.pushState(Date.now(), '', route.toPath({ page: `${Number(page) - 1}`}))
}}>
  Prior Page
</button>
<button on:click={() => {
  history.pushState(Date.now(), '', route.toPath({ page: `${Number(page) + 1}`}))
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