<script lang="ts">
  import { onMount } from 'svelte';
  import Lazy from './Lazy.svelte'
  import type Routes from './Routes'

  export let routes: InstanceType<typeof Routes>
  
  // let path: string, route: RouteMatch
  let state: {key: string; loader: any; props: any }

  function updateUrl(url: string) {
    const urlObj = new URL(url)
    const route = routes.find(urlObj.pathname)
    const qs = Object.fromEntries(urlObj.searchParams)
    route.args = {...route.args, ...qs}
    state = { key: route.key, loader: route.loader, props: {route} }
  }
  updateUrl(location.href)

	onMount(() => {
    

    // Intercept history changes
    const pushStateOrig = history.pushState.bind(history)
    const replaceStateOrig = history.replaceState.bind(history)
    history.pushState = function(date, unused, url: string) {
      if (!url.startsWith('http')) {
        if (url[0] !== '/') url = '/' + url
        url = location.origin + url
      }
      const urlObj = new URL(url)
      if (urlObj.origin === location.origin) {
        const pushOrReplace = urlObj.hash === '#replace' ? replaceStateOrig : pushStateOrig
        updateUrl(url)
        pushOrReplace(date, unused, url)
        globalThis?.scrollTo(0, 0)
      } else {
        pushStateOrig(date, unused, url)
      }
    }
    history.replaceState = function(date, unused, url) {
      history.pushState(date, unused, url + '#replace')
    }
    addEventListener('popstate', () => {
      updateUrl(location.href)
    })

    /**
     * intercept anchor tag clicks
    */
    function findLinkTagInParents(node: HTMLElement): any {
      if (node?.nodeName === 'A') return node
      if (node?.parentNode) return findLinkTagInParents(node.parentElement!)
    }
    addEventListener('click', (e: any) => {
      const ln = findLinkTagInParents(e.target) // aka linkNode
      if (ln){
        e.preventDefault()
        history.pushState(Date.now(), '', ln.pathname + ln.search + ln.hash)
      }
    })
  })
</script>

<Lazy {...state} />
