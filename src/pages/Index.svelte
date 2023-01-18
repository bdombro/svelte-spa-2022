<script lang="ts">
  import LayoutDefault from '../components/layout-default.svelte'
</script>

<LayoutDefault>
  <h1>Home</h1>
  <button on:click={async () => {throw new Error('test')}}>Test Error Boundary</button>
</LayoutDefault>
