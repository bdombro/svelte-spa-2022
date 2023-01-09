<script lang="ts">
  import {Switch} from './router'
  import { routes as r } from './routes'
</script>

<header style="height: 30px; ">
  <nav>
    <a href={r.path('index')}>Home</a>
    <a href={r.path('hello', {name: 'world'})}>Hello</a>
    <a href={r.path('page1')}>Page 1</a>
    <a href={r.path('page2')}>Page 2</a>
    <a href="/does-not-exist">404</a>
  </nav>
</header>

<main>
  <Switch routes={r} />
</main>

<style>
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