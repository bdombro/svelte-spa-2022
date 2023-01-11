/**
 *
 * staleWhileRefresh: a tiny async resolver that displays a cached version (if available) of the
 * callback until the callback resolves.
 *
 */

/** A generic promise */
type P = (...args: any[]) => Promise<any>
type PNoArgs = () => Promise<any>
/** Gets the return type of a promise */
type ReturnTypeP<T extends P> = ThenArg<ReturnType<T>>
type ThenArg<T> = T extends PromiseLike<infer U> ? U : T

/** The state of a fetcher */
export type State<T extends P> = {
  /** A Normal JS error that is populated on error */
  error?: Error
  /** Any outstanding promise for updating this cache item */
  promise?: Promise<State<T>>
  /** The last time this cache item was refreshed */
  refreshedAt?: number
  /** The result of the fetcher */
  result?: ReturnTypeP<T>
}

/** A callback that will refresh the UI, call the fetcher, and update cache */
type Refresher<T extends P> = (propsNext?: Parameters<T>[0]) => Promise<State<T>>

/**
 * The return type of staleWhileRefresh
 *
 * @param refresh - A callback that will refresh the UI, call the fetcher, and update cache
 */
type StaleWhileRefreshReturnType<T extends P> = {
  /**
   * A callback that will refresh the UI, call the fetcher, and update cache
   *
   * @param propsNext - optional props to pass to the callback. If not provided, the prior props will be re-used
   */
  refresh: Refresher<T>
}

/**
 * A safe stringify that removes circular references
 * ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value
 */
const stringify = (obj: any) => {
  const seen = new WeakSet()
  return JSON.stringify(obj, (_, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return
      }
      seen.add(value)
    }
    return value
  })
}

/**
 * A cache of all the promises that are in-flight. These do no serialize to localStorage so store seperately
 */
const promiseCache = new Map<string, Promise<State<any>>>()

/**
 * A cache of all the data that is being or has been fetched
 */
const cache = {
  get(key: string): State<any> | undefined {
    let m = {promise: promiseCache.get(key)}
    const ls = localStorage.getItem('swr:' + key)
    if (ls) m = {...JSON.parse(ls), ...m}
    return m
  },
  set(key: string, value: State<any>) {
    const {promise, ...rest} = value
    if (promise) promiseCache.set(key, promise)
    else {
      promiseCache.delete(key)
      localStorage.setItem('swr:' + key, stringify(rest))
    }
  },
}

/** FIFO Garbage Collector */
globalThis.swrI =
  globalThis.swrI ||
  setInterval(() => {
    ;(Object.entries(localStorage) as [string, string][])
      .filter(([k]) => k.startsWith('swr:'))
      .map(([k, v]) => [k, JSON.parse(v)] as [string, State<any>])
      .sort((a, b) => a[1].refreshedAt + b[1].refreshedAt)
      .slice(100)
      .forEach(([k, v], i) => {
        localStorage.removeItem(k)
      })
  }, 60_000)

/**
 *
 * staleWhileRefresh: an async resolver that displays a cached version (if available) of the
 * callback until the callback resolves.
 *
 * Benefits:
 * - Only 440 bytes (minified + gzipped)
 * - Shows cached data immediately and updates the UI when the callback resolves
 * - Deduplicates concurrent requests: runs the callback only once if duplicates are requested
 * - UX: no flickering, no waiting if cached, enables native scroll restoration
 *
 * @param fetcher - an async callback that returns data. *Data be JSONable*
 * @param onUpdate - a callback that's called with the data, everytime the data changes
 * @param initialProps - initial props to pass to the callback (only if callback has arguments)
 * TODO: polling and offline check
 * @param pollInterval - a number in milliseconds to auto-refresh the data
 *
 * @returns refresh - A callback that will refresh the UI, call the fetcher, and update cache
 *
 * @example
 * ```ts
 * <script lang="ts">
 *  import staleWhileRefresh from 'stale-while-refresh'
 *
 *  let data: ReturnTypeP<typeof swr.refresh>
 *  const swr = staleWhileRefresh({
 *    fetcher: (page: string) => sw.Planets.getPage(Number(page)),
 *    onUpdate: (next) => data = next,
 *    initialProps: page
 *  })
 *  afterUpdate(() => page && swr.refresh(page))
 * ```
 */
function staleWhileRefresh<T extends P>(p: {
  /** An async callback that returns data. *Data must be JSONable* */
  fetcher: T
  /** a callback that's called with the data, everytime the data changes */
  onUpdate: any
  /** initial props to pass to the callback (only if callback has arguments) */
  initialProps: Parameters<T>[0]
}): /**
 * The return type of staleWhileRefresh
 *
 * @param refresh - A callback that will refresh the UI, call the fetcher, and update cache
 */
StaleWhileRefreshReturnType<T>
function staleWhileRefresh<T extends PNoArgs>(p: {fetcher: T; onUpdate: any}): StaleWhileRefreshReturnType<T>
function staleWhileRefresh<T extends P>({
  fetcher,
  onUpdate,
  initialProps,
}: {
  fetcher: T
  onUpdate: any
  initialProps: Parameters<T>[0]
}): StaleWhileRefreshReturnType<T> {
  let lastProps = initialProps
  const refresh: Refresher<T> = (propsNext) => {
    if (propsNext === undefined) propsNext = lastProps
    else lastProps = propsNext
    let cacheKey = stringify(propsNext) + fetcher.toString()
    const hit = cache.get(cacheKey)
    if (hit?.promise || (hit?.refreshedAt && Date.now() - hit.refreshedAt < 1000)) {
      return (async () => hit)()
    }

    const _onUpdate = (next: State<T>) => {
      if (lastProps !== propsNext) return
      cache.set(cacheKey, next as any)
      onUpdate(next)
      return next
    }

    const p = fetcher(propsNext)
      .then((_data) => _onUpdate({result: _data, refreshedAt: Date.now()}))
      .catch((e) => _onUpdate({error: e}))

    _onUpdate({result: hit?.result, promise: p, refreshedAt: hit?.refreshedAt})
    return p
  }
  // Call refresh to set initial data
  refresh(initialProps)

  return {refresh}
}

export default staleWhileRefresh
