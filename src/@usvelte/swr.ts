/**
 *
 * staleWhileRefresh: a tiny (600B) async resolver that displays a cached version (if available) of the
 * callback until the callback resolves.
 *
 * Tiny: only 600 bytes when bundled with Svelte + Vite
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
  /** Any outstanding promise for fetching new data */
  p?: ReturnType<T>
  /** The last time this cache item was refreshed */
  t?: number
  /** The latest result from the fetcher */
  result?: ReturnTypeP<T>
}

/** A callback that will refresh the UI, call the fetcher, and update cache */
// type Refresher<T extends P> = (propsNext?: Parameters<T>) => Promise<State<T>>

/**
 * The value stored in the Svelte store, which is returned by staleWhileRefresh
 *
 * @param refresh - A callback that will refresh the UI, call the fetcher, and update cache
 */
interface State<T extends P> extends CacheVal<T> {
  /**
   * A boolean that is true if the fetcher is in-flight
   */
  loading: boolean
  /**
   * A callback that will refresh the UI, call the fetcher, and update cache
   *
   * @param propsNext - optional props to pass to the callback. If not provided, the prior props will be re-used
   * @returns the fetcher store
   */
  refresh: (propsNext?: Parameters<T>) => ReturnType<T>
}

/** A Svelte store to track the state of staleWhileRefresh and is returned by the call */
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
 * A cache of all the promises that are in-flight. These do not serialize to localStorage so store seperately
 */
const pCache = new Map<string, Promise<Store<any>>>()

/**
 * A wrapper around localCache and pCache
 * TODO: Coudl reduce flie size by combining with _update?
 */
const cache = {
  get(key: string): CacheVal<any> | undefined {
    let m = {p: pCache.get(key)}
    const ls = localStorage.getItem('swr:' + key)
    if (ls) m = {...JSON.parse(ls), ...m}
    return m
  },
  set(key: string, value: CacheVal<any>) {
    const {p, ...rest} = value
    if (p) pCache.set(key, p)
    else {
      pCache.delete(key)
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
      .sort((a, b) => a[1].t + b[1].t)
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
 * @param props - initial props to pass to the callback (only if callback has arguments)
 *
 * @returns A Svelte store to track the state of staleWhileRefresh and is returned by the call
 *
 * @example
 * ```ts
 * <script lang="ts">
 *  import staleWhileRefresh from '@usvelte/swr'
 *
 *  export let page: string
 *
 *  $: swr = staleWhileRefresh({
 *    fetcher: (_page: string) => sw.Planets.getPage(Number(_page)),
 *    props: [page]
 *  })
 * </script>
 *
 * {#if $data.result}
 *  <pre>
 *    {JSON.stringify($data.result, null, 2)}
 *  </pre>
 * {:else if $data.error}
 *   <Error error={$data.error} />
 * {:else}
 *   <p>Loading...</p>
 * {/if}
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
  const refresh = (...propsNext): ReturnType<T> => {
    let cacheKey = stringify(propsNext) + fetcher.toString()
    const hit = cache.get(cacheKey) as CacheVal<T>
    if (hit?.p) {
      return hit.p
    }
    if (hit?.result && hit?.t && Date.now() - hit.t < 1000) {
      // @ts-expect-error - TS doesn't like this, but it works
      return (async () => hit.result)()
    }

    const onUpdate = (res: CacheVal<T>) => {
      cache.set(cacheKey, res)
      store.set({...res, refresh, loading: !!res?.p})
    }

    // @ts-expect-error - TS is having a hard time infering fetcher return type for some reason
    hit.p = fetcher(propsNext)
      .then((r) => {
        onUpdate({result: r, t: Date.now()})
        return r
      })
      .catch((e) => {
        onUpdate({error: e, t: Date.now()})
        throw e
      })

    onUpdate(hit)
    return hit.p
  }
  refresh(...props)
  return store
}

export default staleWhileRefresh
