<script lang="ts">
  import {Switch} from './@usvelte/router'
  import router from './router'
  import Error from './components/Error.svelte'
</script>

<Switch router={router} />
<Error />
