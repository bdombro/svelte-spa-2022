<script lang="ts">
  import routes from '../routes'
  const p = routes.val
  const navitems = [
    {name: 'Home', path: p.index.path},
    {name: 'Hello', path: p.hello.toPath({ name: 'world' })},
    {name: 'Stack1', path: p.stack1.path},
    {name: 'Planets', path: p.planets.path},
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