import {Routes} from './router'
export const routes = new Routes({
  index: {path: '/', loader: () => import('./pages/Index.svelte')},
  hello: {path: '/hello/:name', loader: () => import('./pages/Hello.svelte')},
  page1: {path: '/page1', loader: () => import('./pages/Page1.svelte')},
  page2: {path: '/page2', loader: () => import('./pages/Page2.svelte')},
  notFound: {path: '/', loader: () => import('./pages/NotFound.svelte'), exact: false},
})
