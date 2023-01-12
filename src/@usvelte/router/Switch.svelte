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
      if (url[0] === '/') {
        url = location.origin + url
      }
      const urlObj = new URL(url)
      if (urlObj.origin === location.origin) {
        const pushOrReplace = urlObj.hash === '#replace' ? replaceStateOrig : pushStateOrig
        pushOrReplace(date, unused, url)
        updateUrl(url)
        globalThis?.scrollTo(0, 0)
      } else {
        pushStateOrig(date, unused, url)
      }
    }
    history.replaceState = function(date, unused, url) {
      history.pushState(date, unused, url + '#replace')
    }
    addEventListener('popstate', () => {
      updateUrl(location.pathname)
    })

    /**
     * intercept anchor tag clicks
    */
    addEventListener('click', function linkIntercepter(e: any) {
      const ln = findLinkTagInParents(e.target) // aka linkNode
      if (ln?.host === location.host) {
        e.preventDefault()
        const to = ln.pathname + ln.search
        history.pushState(Date.now(), '', to)
      }

      function findLinkTagInParents(node: HTMLElement): any {
        if (node?.nodeName === 'A') return node
        if (node?.parentNode) return findLinkTagInParents(node.parentElement!)
      }
    })

    
  })
</script>

<Lazy {...state} />
