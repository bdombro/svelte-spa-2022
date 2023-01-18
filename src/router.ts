import {Router} from './@usvelte/router'
const router = new Router({
  index: {
    loader: () => import('./pages/Index.svelte'),
    path: '/',
  },
  hello: {
    loader: () => import('./pages/Hello.svelte'),
    path: '/hello/:name',
  },
  planets: {
    isStack: true,
    loader: () => import('./pages/Planets/Index.svelte'),
    path: '/planets',
  },
  planetsByPage: {
    loader: () => import('./pages/Planets/ByPage.svelte'),
    path: '/planets/:page',
  },
  stack1: {
    isStack: true,
    loader: () => import('./pages/StackTest.svelte'),
    path: '/stack1',
  },
  stack1Inner: {
    exact: false,
    loader: () => import('./pages/StackTest.svelte'),
    path: '/stack1',
  },
  notFound: {
    exact: false,
    loader: () => import('./pages/NotFound.svelte'),
    path: '/',
  },
})
export default router
