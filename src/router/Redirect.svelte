<script lang="ts">
  export let to: string
  // location.replace(to)
  history['replaceState'](Date.now(), '', to)
</script>
