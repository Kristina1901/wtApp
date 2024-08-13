<script setup lang="ts">
import { useI18n } from "vue-i18n";
import SwitchLanguages from "./components/SwitchLanguages.vue";
import Header from "./components/Header.vue";

const { locale } = useI18n({
  useScope: "global",
});
const switchLang = () => {
  locale.value === "en" ? (locale.value = "uk") : (locale.value = "en");
  localStorage.setItem("lang", locale.value);
};
</script>

<template>
  <div class="container">
    <div class="switcher__container">
      <SwitchLanguages :lang="locale" @toggleLang="switchLang" />
    </div>
    <router-link to="/" class="link__wrapper">
      <img src="./assets/img/logo.png" alt="logo" class="logo" />
    </router-link>
    <Header />
  </div>
</template>

<style scoped>
.switcher__container {
  display: flex;
  justify-content: end;
  padding-top: 20px;
}
.container {
  padding: 20px;
}
.logo {
  height: 70px;
}
.link__wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
@media (min-width: 1440px) {
  .container {
    padding: 0;
    width: 1200px;
    margin: 0 auto;
  }
  .logo {
    height: 80px;
  }
}
</style>
