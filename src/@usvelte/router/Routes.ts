export interface RouteDef {
  /** Boolean indicating if should fuzzy match. Defaults to false */
  exact?: boolean
  /** A function that returns a promise that resolves to a Svelte component */
  loader: () => Promise<any>
  /** Additional info you may want to track on your route, i.e. icon, description */
  meta?: Record<string, any>
  /**
   * A unique path-mask for the route, to be used for pattern matching
   *
   * Example: '/hello/:name' will match '/hello/world' and '/hello/123'
   * Example: '/hello/*' will match '/hello/world' and '/hello/world/green'
   */
  path: string
  /** Boolean indicating if should be treated as a stack root */
  isStack?: boolean
}

export interface Route extends RouteDef {
  /** Returns an object of URL args if path matches route.path, false otherwise */
  isMatch: (path: string) => false | Record<string, string>
  /** The unique key of this route */
  key: string
  /** Accepts path args and returns a valid path from this routes path mask */
  toPath: (urlParams?: Record<string, string>) => string
  /** A reference to a stack route, if the current route is in a stack */
  stack?: Route
  /** A history stack if the current route is a stack */
  stackHistory?: {url: string; scrollTop: number}[]
}

/** A map of route keys to routes */
type RoutesVal<T extends Record<string, RouteDef>> = {
  [key in keyof T]: Route
}

/** An array of the routes */
type RoutesArray = Route[]

/** A route with the matching args */
export type RouteMatch = Route & {urlParams?: Record<string, string>}

export type RoutesClass = typeof Routes
export type RoutesInstance = InstanceType<RoutesClass>

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
 * A class to manage and negotiate url paths
 *
 * Accepts a map of route keys to route definitions. Order by priority because
 * the first match will be returned when querying.
 */
export default class Routes<
  T extends {
    /** key: The unique key of a route */
    [key: string]: RouteDef
  },
> {
  val: RoutesVal<T> = {} as any
  array: RoutesArray = []
  current: RouteMatch
  subscribers: ((route: RouteMatch) => any)[] = []
  /**
   * A class to manage and negotiate url paths
   *
   * Accepts a map of route keys to route definitions. Order by priority because
   * the first match will be returned when querying.
   */
  constructor(routes: T) {
    Object.entries(routes).forEach(([k, routeDef]) => {
      this.val[k as keyof T] = {
        ...routeDef,
        isMatch: (path: string) => Routes.isMatch(path, routeDef.path, routeDef.exact),
        key: k,
        stackHistory: routeDef.isStack ? [] : undefined,
        toPath: (urlParams = {}) => {
          return routeDef.path.replace(/:([^/]*)/g, (_, arg) => urlParams[arg])
        },
      }
      this.array.push(this.val[k as keyof T])
    })
    this.array
      .filter((r) => r.isStack)
      .forEach((r) => {
        this.array.filter((r2) => r2.path.startsWith(r.path)).forEach((r2) => (r2.stack = r))
      })
    this.hookHistory()
  }

  /** Subscribe to changes to the route */
  public subscribe(fn: (route: RouteMatch) => any) {
    this.subscribers.push(fn)
    return () => this.unsubscribe(fn)
  }
  /** Subscribe to changes to the route */
  public unsubscribe(fn: (route: RouteMatch) => any) {
    this.subscribers = this.subscribers.filter((l) => l !== fn)
  }

  public goto(routeOrKey: Route | string, urlParams: Record<string, string> = {}) {
    const route = typeof routeOrKey === 'string' ? this.val[routeOrKey] : routeOrKey
    history.pushState(Date.now(), '', route.toPath(urlParams))
  }

  /** Returns the first route that matches the path */
  public find(url: URL): RouteMatch {
    for (const route of this.array) {
      const urlParams = route.isMatch(url.pathname)
      if (urlParams) {
        const qs = Object.fromEntries(url.searchParams)
        return {...route, urlParams: {...urlParams, ...qs}}
      }
    }
    throw new Error(`No route found for path: ${url.pathname}`)
  }

  /** Returns an object of URL params if path matches route.path, false otherwise */
  static isMatch(path: string, pathMask: string, exact = true) {
    const argRx = /:([^/]*)/g
    const urlRx = '^' + pathMask.replace(argRx, '([^/]*)') + (exact ? '$' : '')
    const match = [...path.matchAll(new RegExp(urlRx, 'gi'))]?.[0]
    const urlParams = match
      ? [...pathMask.matchAll(argRx)].reduce((acc, arg, i) => ({...acc, [arg[1]]: match[i + 1]}), {})
      : false
    return urlParams
  }

  /**
   * Intercept history.pushState, history.replaceState, and click events
   */
  private hookHistory() {
    const pushStateOrig = history.pushState.bind(history)
    const replaceStateOrig = history.replaceState.bind(history)
    this.current = this.find(new URL(location.href))

    history.pushState = (date, unused, url) => {
      let urlObj = toUrlObj(url)

      if (urlObj.hash === '#replace') {
        return history.replaceState(date, unused, urlObj)
      }

      if (urlObj.origin !== location.origin) {
        return pushStateOrig(date, unused, urlObj)
      }

      let scrollTo = 0
      let route = this.find(urlObj)

      if (route.isStack && route.stackHistory.length) {
        if (this.current.stack?.key === route.key) {
          route.stackHistory = []
        } else {
          const recall = route.stackHistory[route.stackHistory.length - 1]
          urlObj = new URL(recall.url)
          scrollTo = recall.scrollTop
          route = this.find(urlObj)
        }
      }

      this.current?.stack?.stackHistory.push({url: location.href, scrollTop: window.scrollY})

      this.current = route
      this.subscribers.forEach((fn) => fn(this.current))
      pushStateOrig(date, unused, urlObj)
      // Try to scroll to position after page has loaded
      const doScroll = () => window.scrollTo(0, scrollTo)
      doScroll()
      setTimeout(doScroll)
      setTimeout(doScroll, 300)
    }
    history.replaceState = (date, unused, url) => {
      let urlObj = toUrlObj(url)
      this.current?.stack?.stackHistory.pop()
      this.current?.stack?.stackHistory.push({url: location.href, scrollTop: window.scrollY})
      this.current = this.find(urlObj)
      this.subscribers.forEach((fn) => fn(this.current))
      replaceStateOrig(date, unused, urlObj)
    }

    addEventListener('popstate', () => {
      this.current?.stack?.stackHistory.pop()
      this.current = this.find(new URL(location.href))
      this.subscribers.forEach((fn) => fn(this.current))
    })

    /**
     * intercept anchor tag clicks
     */
    addEventListener('click', (e: any) => {
      const ln = findLinkTagInParents(e.target) // aka linkNode
      if (ln) {
        e.preventDefault()
        history.pushState(Date.now(), '', ln.href)
      }
    })
  }
}
