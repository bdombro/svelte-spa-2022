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
    /**
     * interceptNavEvents: Intercept changes in navigation to dispatch
     * events and prevent default
    */
    addEventListener('click', function linkIntercepter(e: any) {
      const ln = findLinkTagInParents(e.target) // aka linkNode

      if (ln?.host === location.host) {
        dispatchEvent(new Event('link-clicked'))
        e.preventDefault()

        if (ln.hash) dispatchEvent(new Event(ln.hash))

        if (ln.pathname + ln.search !== location.pathname + location.search) {
          const to = ln.pathname + ln.search
          if (ln.hash === '#replace') {
            history['replaceState'](Date.now(), '', to)
          }
          else {
            history['pushState'](Date.now(), '', to)
            globalThis?.scrollTo(0, 0)
          }
          updatePath(ln.pathname)
        } else {
          globalThis?.scrollTo(0, 0)
        }
      }

      function findLinkTagInParents(node: HTMLElement): any {
        if (node?.nodeName === 'A') return node
        if (node?.parentNode) return findLinkTagInParents(node.parentElement!)
      }
    })

    addEventListener('popstate', () => {
      updatePath(location.pathname)
    })
  })
</script>

<Lazy key={route.key} loader={route.loader} props={route.args}/>
