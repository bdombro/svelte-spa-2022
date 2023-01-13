<script lang="ts">
  import {Switch} from './@usvelte/router'
  import { routes as r } from './routes'
  const navitems = [
    {name: r.val.index.title, path: r.val.index.toPath()},
    {name: r.val.hello.title, path: r.val.hello.toPath({ name: 'world' })},
    {name: r.val.planets.title, path: r.val.planets.toPath({ page: '1' })},
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
  <Switch routes={r} />
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