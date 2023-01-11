<script lang="ts">
  import { onMount } from 'svelte';
  import Lazy from './Lazy.svelte'
  import type Routes from './Routes'
  import type {RouteMatch} from './Routes'

  export let routes: InstanceType<typeof Routes>
  
  let path: string, route: RouteMatch

  function updatePath(next: string) {
    if (next === path) return
    path = next
    route = routes.find(path)
  }
  updatePath(location.pathname)

	onMount(() => {

    // Intercept history changes
    const pushStateOrig = history.pushState.bind(history)
    const replaceStateOrig = history.replaceState.bind(history)
    history.pushState = function(date, unused, url: string) {
      if (url[0] === '/') {
        const urlObj = new URL(`http://a${url}`)
        const pushOrReplace = urlObj.hash === '#replace' ? replaceStateOrig : pushStateOrig
        pushOrReplace(date, unused, url)
        updatePath(urlObj.pathname)
        globalThis?.scrollTo(0, 0)
      } else {
        pushStateOrig(date, unused, url)
      }
    }
    history.replaceState = function(date, unused, url) {
      history.pushState(date, unused, url + '#replace')
    }
    addEventListener('popstate', () => {
      updatePath(location.pathname)
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

<Lazy key={route.key} loader={route.loader} props={route.args}/>
