<template>
  <ul class="list">
    <li v-for="city in props.favoritesCity" :key="city.name" class="list__item">
      <div @click="selectCity(city)" class="list__item-content">
        <img src="../assets/img/city.png" alt="city" class="list__item-img" />
        <span class="city__name">{{ city.name }}</span>
      </div>
      <slot name="delete-button" :cityName="city.name">
        <button class="delete">-</button>
      </slot>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { City } from "../interfaces/interfaces";

const props = defineProps<{
  favoritesCity: City[];
}>();

const emit = defineEmits<{
  (event: "city-selected", city: City): void;
}>();
const selectCity = (city: City) => {
  emit("city-selected", city);
};
</script>

<style scoped>
.list {
  list-style-type: none;
  width: 190px;
  min-height: 217px;
}
.list__item {
  border: 1px solid #00008b;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  align-items: center;
}
.list__item:last-child {
  margin-bottom: 0;
}
.list__item-img {
  width: 20px;
  height: 20px;
}
.delete {
  width: 20px;
  height: 20px;
  right: 20px;
  bottom: 5px;
  cursor: pointer;
  bottom: 0;
  background-color: black;
  color: white;
}
.city {
  text-align: center;
  font-size: 14px;
}
.list__item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.city__name {
  min-width: 90px;
  text-align: center;
  margin-left: 5px;
}
@media (min-width: 1440px) {
  .list {
    width: 290px;
  }
}
</style>
