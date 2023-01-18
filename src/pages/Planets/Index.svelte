<script lang="ts">
  import routes from '../../routes'
  import LayoutDefault from '../../components/LayoutDefault.svelte'
</script>

<LayoutDefault>
  <h1>Planets!</h1>
  <button on:click={() => {
    routes.goto(routes.val.planetsByPage, { page: '1'})
  }}>
    Goto Page 1
  </button>
</LayoutDefault>