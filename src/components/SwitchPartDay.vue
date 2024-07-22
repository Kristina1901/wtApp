<template>
  <div class="container__weather">
    <img src="../assets/img/sun.png" alt="sun" width="25" height="25" />
    <label class="switch">
      <input type="checkbox" v-model="isChecked" @change="handleToggle" />
      <span class="slider round"></span>
    </label>
    <img src="../assets/img/moon.png" alt="moon" width="25" height="25" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits<{
  (event: "partDayChange", newPartOfDay: "day" | "night"): void;
}>();

const isChecked = ref(false);
const handleToggle = () => {
  const newPartOfDay = isChecked.value ? "night" : "day";
  emit("partDayChange", newPartOfDay);
};
</script>
<style>
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  margin-right: 10px;
  margin-left: 10px;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: 0.4s;
  transition: 0.4s;
  height: 25px;
}
.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}
input:checked + .slider {
  background-color: #ccc;
}
input:focus + .slider {
  box-shadow: 0 0 1px #ccc;
}
input:checked + .slider:before {
  -webkit-transform: translateX(35px);
  -ms-transform: translateX(35px);
  transform: translateX(35px);
}
.slider.round {
  border-radius: 34px;
}
.slider.round:before {
  border-radius: 50%;
}
[color-scheme="dark"] {
  background-color: rgba(30, 69, 62, 0.6);
}
[color-scheme="light"] {
  background-color: #ffffcc;
}
.container__weather {
  display: flex;
  margin-top: 20px;
}
@media (min-width: 1440px) {
  .container__weather {
    display: flex;
    margin-top: 0;
  }
}
</style>
