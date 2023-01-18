import {Router} from './@usvelte/router'
const router = new Router({
  index: {
    loader: () => import('./pages/index.svelte'),
    path: '/',
  },
  hello: {
    loader: () => import('./pages/hello.svelte'),
    path: '/hello/:name',
  },
  planets: {
    isStack: true,
    loader: () => import('./pages/planets/index.svelte'),
    path: '/planets',
  },
  planetsByPage: {
    loader: () => import('./pages/planets/by-page.svelte'),
    path: '/planets/:page',
  },
  stack1: {
    isStack: true,
    loader: () => import('./pages/stack-test.svelte'),
    path: '/stack1',
  },
  stack1Inner: {
    exact: false,
    loader: () => import('./pages/stack-test.svelte'),
    path: '/stack1',
  },
  notFound: {
    exact: false,
    loader: () => import('./pages/not-found.svelte'),
    path: '/',
  },
})
export default router
