/**
 *
 * staleWhileRefresh: a tiny async resolver that displays a cached version (if available) of the
 * callback until the callback resolves.
 *
 */

import {writable, type Writable} from 'svelte/store'

/** A generic promise */
type P = (...args: any[]) => Promise<any>
type PNoArgs = () => Promise<any>
/** Gets the return type of a promise */
type ReturnTypeP<T extends P> = ThenArg<ReturnType<T>>
type ThenArg<T> = T extends PromiseLike<infer U> ? U : T

/** The state of a fetcher */
export interface CacheVal<T extends P> {
  /** A Normal JS error that is populated on error */
  error?: Error
  /** Any outstanding promise for updating this cache item */
  promise?: Promise<Store<T>>
  /** The last time this cache item was refreshed */
  refreshedAt?: number
  /** The result of the fetcher */
  result?: ReturnTypeP<T>
}

/** A callback that will refresh the UI, call the fetcher, and update cache */
// type Refresher<T extends P> = (propsNext?: Parameters<T>) => Promise<State<T>>

/**
 * The return type of staleWhileRefresh
 *
 * @param refresh - A callback that will refresh the UI, call the fetcher, and update cache
 */
interface State<T extends P> extends CacheVal<T> {
  /**
   * A callback that will refresh the UI, call the fetcher, and update cache
   *
   * @param propsNext - optional props to pass to the callback. If not provided, the prior props will be re-used
   */
  refresh: (propsNext?: Parameters<T>) => Store<T>
}

type Store<T extends P> = Writable<State<T>>

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
const promiseCache = new Map<string, Promise<Store<any>>>()

/**
 * A cache of all the data that is being or has been fetched
 */
const cache = {
  get(key: string): CacheVal<any> | undefined {
    let m = {promise: promiseCache.get(key)}
    const ls = localStorage.getItem('swr:' + key)
    if (ls) m = {...JSON.parse(ls), ...m}
    return m
  },
  set(key: string, value: CacheVal<any>) {
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
      .map(([k, v]) => [k, JSON.parse(v)] as [string, CacheVal<any>])
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
 * @param props - initial props to pass to the callback (only if callback has arguments)
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
 *    props: page
 *  })
 *  afterUpdate(() => page && swr.refresh(page))
 * ```
 */
function staleWhileRefresh<T extends P>(p: {
  /** An async callback that returns data. *Data must be JSONable* */
  fetcher: T
  /** initial props to pass to the callback (only if callback has arguments) */
  props: Parameters<T>
}): /**
 * The return type of staleWhileRefresh
 *
 * @param refresh - A callback that will refresh the UI, call the fetcher, and update cache
 */
Store<T>
function staleWhileRefresh<T extends PNoArgs>(p: {fetcher: T}): Store<T>
function staleWhileRefresh<T extends P>({fetcher, props}: {fetcher: T; props: Parameters<T>}): Store<T> {
  let store = writable<State<T>>({} as any)
  const refresh = (...propsNext): Store<T> => {
    let cacheKey = stringify(propsNext) + fetcher.toString()
    const hit = cache.get(cacheKey)
    if (hit?.promise || (hit?.refreshedAt && Date.now() - hit.refreshedAt < 1000)) {
      store.set({...hit, refresh})
      return store
    }

    const _onUpdate = (next: CacheVal<T>) => {
      cache.set(cacheKey, next as any)
      store.set({...next, refresh})
      return store
    }

    const p = fetcher(propsNext)
      .then((_data) => _onUpdate({result: _data, refreshedAt: Date.now()}))
      .catch((e) => _onUpdate({error: e}))

    return _onUpdate({...hit, promise: p})
  }
  return refresh(...props)
}

export default staleWhileRefresh
