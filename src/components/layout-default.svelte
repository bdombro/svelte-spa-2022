<script lang="ts">
  import r from '../router'
  const navitems = [
    {name: 'Home', path: r.routes.index.path},
    {name: 'Hello', path: r.routes.hello.toPath({ name: 'world' })},
    {name: 'Stack1', path: r.routes.stack1.path},
    {name: 'Planets', path: r.routes.planets.path},
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
  <slot />
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