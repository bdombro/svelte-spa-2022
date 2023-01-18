<script lang="ts">
  import {Switch} from './@usvelte/router'
  import routes from './routes'
  import Error from './components/Error.svelte'
</script>

<Switch routes={routes} />
<Error />
