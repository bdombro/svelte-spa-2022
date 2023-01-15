import {Routes} from './@usvelte/router'
export const routes = new Routes({
  index: {
    path: '/',
    loader: () => import('./pages/Index.svelte'),
  },
  hello: {
    path: '/hello/:name',
    loader: () => import('./pages/Hello.svelte'),
  },
  planets: {
    path: '/planets/:page',
    loader: () => import('./pages/Planets.svelte'),
  },
  notFound: {
    path: '/',
    loader: () => import('./pages/NotFound.svelte'),
    exact: false,
  },
})
