<script lang="ts">
  let error: Error | 0 = 0;
  addEventListener("error", (event) => error = event.error);
  addEventListener('unhandledrejection', (event) => error = event.reason);
</script>

{#if error}
  <dialog open>
    <h3>Sorry, something went wrong.</h3>
    <p>Cause: {error.message}</p>
    <button on:click={() => error = 0}>Dismiss</button>
  </dialog>
{/if}
