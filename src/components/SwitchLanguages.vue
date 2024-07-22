<template>
  <div class="lang__wrapper">
    <img src="../assets/img/uk.png" alt="uk" width="25" height="25" />
    <label class="switch">
      <input
        type="checkbox"
        @change="emit('toggleLang')"
        :checked="props.lang === 'en'"
      />
      <span class="slider round"></span>
    </label>
    <img src="../assets/img/en.png" alt="en" width="25" height="25" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ lang: string }>();

const emit = defineEmits(["toggleLang"]);
</script>

<style scoped>
.lang__wrapper {
  display: flex;
  justify-content: center;
}
</style>
