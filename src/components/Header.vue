<template>
  <div id="nav">
    <router-link to="/">{{ $t("main") }}</router-link>
    <router-link to="/favorites">{{ $t("favorites") }}</router-link>
  </div>
  <router-view />
</template>

<style scoped>
#nav {
  display: flex;
  margin-top: 20px;
}
#nav .router-link-exact-active {
  color: purple;
  text-decoration: underline;
  text-underline-offset: 7px;
}
#nav a:last-child {
  margin-left: 20px;
}
@media (min-width: 1440px) {
  #nav {
    margin-top: 40px;
  }
}
</style>
