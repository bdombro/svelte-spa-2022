<script lang="ts">
  export let error: Error
</script>

<div>
  <h4>Sorry: website error detected {error.name ? `in ${error.name}` : ''}.</h4>
  <pre>{error.stack}</pre>
</div>