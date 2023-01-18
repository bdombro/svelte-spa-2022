<script lang="ts">
  import r from '../../router'
  import LayoutDefault from '../../components/LayoutDefault.svelte'
  r.replace(r.routes.planetsByPage, { page: '1' }, )
</script>

<LayoutDefault />