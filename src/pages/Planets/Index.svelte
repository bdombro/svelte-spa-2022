<script lang="ts">
  import routes from '../../routes'
  import LayoutDefault from '../../components/LayoutDefault.svelte'
  routes.replace(routes.val.planetsByPage, { page: '1' }, )
</script>

<LayoutDefault />