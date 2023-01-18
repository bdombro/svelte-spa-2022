<script lang="ts">
  import { onMount } from 'svelte';
  import Lazy from './Lazy.svelte'
  import type { Route, RoutesInstance } from './Routes'

  export let routes: RoutesInstance

  let state: { route: Route, routeProps: { route: Route, url: URL, [key: string]: any } }

  function updateUrl(url: URL) {
    let route = routes.find(url.pathname)
    const qs = Object.fromEntries(url.searchParams)
    state = { route, routeProps: {route: route, url, ...route.args, ...qs} }
  }
  updateUrl(new URL(location.href))

	onMount(() => {
    /**
     * 
     * 
     * Intercept history.pushState, history.replaceState, and click events
     * 
     * 
    */
    
    /**
     * Accepts a url string or a URL object and returns a URL object
     */
    function toUrlObj(urlOrPath: string | URL) {
      if (urlOrPath instanceof URL) return urlOrPath
      if (urlOrPath.startsWith('//')) {
        urlOrPath = location.protocol + urlOrPath
      }
      if (!urlOrPath.startsWith('http')) {
        if (urlOrPath[0] !== '/') urlOrPath = '/' + urlOrPath
        urlOrPath = location.origin + urlOrPath
      }
      return new URL(urlOrPath)
    }

    
    const pushStateOrig = history.pushState.bind(history)
    const replaceStateOrig = history.replaceState.bind(history)
    history.pushState = function(date, unused, url) {
      let urlObj = toUrlObj(url)

      if (urlObj.hash === '#replace') {
        return history.replaceState(date, unused, urlObj)
      }

      if (urlObj.origin !== location.origin) {
        return pushStateOrig(date, unused, urlObj)
      }

      let scrollTo = 0
      let route = routes.find(urlObj.pathname)

      if (route.isStack && route.stackHistory.length) {
        if (state.route.stack?.key === route.key) {
          route.stackHistory = []
        } else {
          const recall = route.stackHistory[route.stackHistory.length - 1]
          urlObj = new URL(recall.url)
          scrollTo = recall.scrollTop
        }
      }
      
      state.route.stack?.stackHistory.push({url: location.href, scrollTop: window.scrollY})
      
      updateUrl(urlObj)
      pushStateOrig(date, unused, urlObj)
      window.scrollTo(0, scrollTo)
    }
    history.replaceState = function(date, unused, url) {
      let urlObj = toUrlObj(url)
      state.route.stack?.stackHistory.pop()
      state.route.stack?.stackHistory.push({url: location.href, scrollTop: window.scrollY})
      updateUrl(urlObj)
      replaceStateOrig(date, unused, urlObj)
    }

    addEventListener('popstate', () => {
      state.route.stack?.stackHistory.pop()
      updateUrl(new URL(location.href))
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

<Lazy key={state.route.key} loader={state.route.loader} props={state.routeProps}  />
