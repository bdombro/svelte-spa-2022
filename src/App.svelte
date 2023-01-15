<script lang="ts">
  import {Switch} from './@usvelte/router'
  import { routes } from './routes'
  import Error from './Error.svelte'
  const p = routes.val
  const navitems = [
    {name: 'Home', path: p.index.toPath()},
    {name: 'Hello', path: p.hello.toPath({ name: 'world' })},
    {name: 'Planets', path: p.planets.toPath({ page: '1' })},
    {name: '404', path: '/does-not-exist'},
  ]
</script>

<header>
  <nav>
    {#each navitems as item}
      <a href={item.path}>{item.name}</a>
    {/each}
  </nav>
</header>

<main>
  <Switch routes={routes} />
  <Error />
</main>

<style>
  header {
		height: 50px;
	}
  nav {
    background: lightgray;
    inset: 10px 4px auto;
    position: fixed;
    text-align: center;
  }
  nav > a {
    display: inline-block;
    padding: 10px;
    text-align: center;
  }
  nav > a:hover {
    background: gray;
  }
</style>