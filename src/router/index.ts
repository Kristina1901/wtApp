import { createRouter, createWebHistory } from "vue-router";
import Main from "../pages/Main.vue";

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: Main,
    },
    {
      path: "/favorites",
      component: () => import("../pages/Favorites.vue"),
    },
  ],
});
