<script lang="ts">
  import LayoutDefault from '../components/LayoutDefault.svelte'
  import Filler from '../components/Filler.svelte'
  export let url: URL
</script>

<LayoutDefault>
  <h1>{url.pathname}</h1>
  <a href={`${url.pathname}/inner`}>Inner page</a>
  <Filler />
</LayoutDefault>
