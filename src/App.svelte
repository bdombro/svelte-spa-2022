<script lang="ts">
  import {Switch} from './@usvelte/router'
  import router from './router'
  import ErrorDialog from './components/error-dialog.svelte'
</script>

<Switch router={router} />
<ErrorDialog />
