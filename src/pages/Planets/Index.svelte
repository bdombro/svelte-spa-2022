<script lang="ts">
  import r from '../../router'
  import LayoutDefault from '../../components/layout-default.svelte'
  r.replace(r.routes.planetsByPage, { page: '1' }, )
</script>

<LayoutDefault />