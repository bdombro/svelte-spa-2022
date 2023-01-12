<script lang="ts">
  export let to: string
  history['replaceState'](Date.now(), '', to)
</script>
