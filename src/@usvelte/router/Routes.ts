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
}

export interface Route extends RouteDef {
  /** Returns an object of URL args if path matches route.path, false otherwise */
  isMatch: (path: string) => false | Record<string, string>
  /** The unique key of this route */
  key: string
  /** Accepts path args and returns a valid path from this routes path mask */
  toPath: (args?: Record<string, string>) => string
}

/** A map of route keys to routes */
type RoutesVal<T extends Record<string, RouteDef>> = {
  [key in keyof T]: Route
}

/** An array of the routes */
type RoutesArray = Route[]

/** A route with the matching args */
export type RouteMatch = Route & {args?: Record<string, string>}

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
        toPath: (args = {}) => {
          return routeDef.path.replace(/:([^/]*)/g, (_, arg) => args[arg])
        },
        // @ts-expect-error: toString is not an explicit property of RouteDef
        toString: () => routeDef.path,
      }
      this.array.push(this.val[k as keyof T])
    })
  }

  /**
   * Returns the first route that matches the path
   */
  public find(path: string): RouteMatch {
    for (const route of this.array) {
      const args = route.isMatch(path)
      if (args) {
        return {...route, args}
      }
    }
    throw new Error(`No route found for path: ${path}`)
  }

  /** Returns an object of URL args if path matches route.path, false otherwise */
  static isMatch(path: string, pathMask: string, exact = true) {
    const argRx = /:([^/]*)/g
    const urlRx = '^' + pathMask.replace(argRx, '([^/]*)') + (exact ? '$' : '')
    const match = [...path.matchAll(new RegExp(urlRx, 'gi'))]?.[0]
    const args = match
      ? [...pathMask.matchAll(argRx)].reduce((acc, arg, i) => ({...acc, [arg[1]]: match[i + 1]}), {})
      : false
    return args
  }
}

/*

add "stack": true to the route definition

pushState() - push to custom url history stack, "historyStack"
popState() - allow default browser behavior, and pop historyStack
replaceState() - replace the current url in historyStack
goto stack path and not in stack - change url to last stack matching the stack path
goto stack path and in stack, delete all stack paths in url stack and push stack path.
goto stack path and on stack path - do nothing
click back button, pop the stack and change url to last stack matching the stack path, or just stack path if none.

onscroll -- update cache scroll position
*/
