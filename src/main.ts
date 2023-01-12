import './app.css'
import App from './App.svelte'
// import App from './AppBlank.svelte'
// import('./@usvelte/swr')
// import('./@usvelte/router/goto')
// import('./@usvelte/router/Lazy.svelte')
// import('./@usvelte/router/Redirect.svelte')
// import('./@usvelte/router/Routes.ts')
// import('./@usvelte/router/Switch.svelte')
// import('./@usvelte/router')

const app = new App({
  target: document.getElementById('app'),
})

export default app
