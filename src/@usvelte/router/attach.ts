import type {Route, RoutesInstance} from './Routes'

const pushStateOrig = history.pushState.bind(history)
const replaceStateOrig = history.replaceState.bind(history)

/**
 * Searches up the dom from an element to find an enclosing anchor tag
 */
function findLinkTagInParents(node: HTMLElement): any {
  if (node?.nodeName === 'A') return node
  if (node?.parentNode) return findLinkTagInParents(node.parentElement!)
}

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

/**
 *
 *
 * Intercept history.pushState, history.replaceState, and click events
 *
 *
 */
export default function attach(routes: RoutesInstance, onUpdate: (route: Route) => void) {
  let current: Route = undefined

  history.pushState = function (date, unused, url) {
    let urlObj = toUrlObj(url)

    if (urlObj.hash === '#replace') {
      return history.replaceState(date, unused, urlObj)
    }

    if (urlObj.origin !== location.origin) {
      return pushStateOrig(date, unused, urlObj)
    }

    let scrollTo = 0
    let route = routes.find(urlObj)

    if (route.isStack && route.stackHistory.length) {
      if (current.stack?.key === route.key) {
        route.stackHistory = []
      } else {
        const recall = route.stackHistory[route.stackHistory.length - 1]
        urlObj = new URL(recall.url)
        scrollTo = recall.scrollTop
      }
    }

    current?.stack?.stackHistory.push({url: location.href, scrollTop: window.scrollY})

    current = route
    onUpdate(current)
    pushStateOrig(date, unused, urlObj)
    window.scrollTo(0, scrollTo)
  }
  history.replaceState = function (date, unused, url) {
    let urlObj = toUrlObj(url)
    current?.stack?.stackHistory.pop()
    current?.stack?.stackHistory.push({url: location.href, scrollTop: window.scrollY})
    current = routes.find(urlObj)
    onUpdate(current)
    replaceStateOrig(date, unused, urlObj)
  }

  addEventListener('popstate', () => {
    current?.stack?.stackHistory.pop()
    current = routes.find(new URL(location.href))
    onUpdate(current)
  })

  /**
   * intercept anchor tag clicks
   */
  addEventListener('click', (e: any) => {
    const ln = findLinkTagInParents(e.target) // aka linkNode
    if (ln) {
      e.preventDefault()
      history.pushState(Date.now(), '', ln.pathname + ln.search + ln.hash)
    }
  })
}
