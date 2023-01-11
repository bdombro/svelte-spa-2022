import {Routes} from './@usvelte/router'
export const routes = new Routes({
  index: {
    title: 'Home',
    path: '/',
    loader: () => import('./pages/Index.svelte'),
  },
  hello: {
    title: 'Hello',
    path: '/hello/:name',
    loader: () => import('./pages/Hello.svelte'),
  },
  planets: {
    title: 'Planets',
    path: '/planets/:page',
    loader: () => import('./pages/Planets.svelte'),
  },
  notFound: {
    title: '404: Page Not found',
    path: '/',
    loader: () => import('./pages/NotFound.svelte'),
    exact: false,
  },
})
