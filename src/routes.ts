import {Routes} from './@usvelte/router'
export const routes = new Routes({
  index: {
    loader: () => import('./pages/Index.svelte'),
    path: '/',
  },
  hello: {
    loader: () => import('./pages/Hello.svelte'),
    path: '/hello/:name',
  },
  planets: {
    loader: () => import('./pages/Planets.svelte'),
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
  stack2: {
    isStack: true,
    loader: () => import('./pages/StackTest.svelte'),
    path: '/stack2',
  },
  stack2Inner: {
    exact: false,
    loader: () => import('./pages/StackTest.svelte'),
    path: '/stack2',
  },
  notFound: {
    exact: false,
    loader: () => import('./pages/NotFound.svelte'),
    path: '/',
  },
})
