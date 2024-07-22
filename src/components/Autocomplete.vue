<template>
  <div class="autocomplete">
    <input
      type="text"
      @input="onChange"
      v-model="search"
      @keydown.down="onArrowDown"
      @keydown.up="onArrowUp"
      @keydown.enter="onEnter"
      :placeholder="$t('placeholder')"
    />
    <ul id="autocomplete-results" v-show="isOpen" class="autocomplete-results">
      <li
        v-for="(result, i) in results"
        :key="i"
        @click="onCitySelect(result)"
        class="autocomplete-result"
        :class="{ 'is-active': i === arrowCounter }"
      >
        {{ result.name }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { City } from "../interfaces/interfaces";

const isOpen = ref(false);
const results = ref<City[]>([]);
const emit = defineEmits<{
  (e: "citySelected", cityInfo: City): void;
}>();
const search = ref<string>("");
const arrowCounter = ref(-1);
const items: City[] = [
  { name: "London", latitude: 51.5074, longitude: -0.1278 },
  { name: "New York", latitude: 40.7128, longitude: -74.006 },
  { name: "Paris", latitude: 48.8566, longitude: 2.3522 },
  { name: "Tokyo", latitude: 35.6762, longitude: 139.6503 },
  { name: "Sydney", latitude: -33.8688, longitude: 151.2093 },
  { name: "Berlin", latitude: 52.52, longitude: 13.405 },
  { name: "Rio de Janeiro", latitude: -22.9068, longitude: -43.1729 },
  { name: "Dubai", latitude: 25.276987, longitude: 55.296249 },
  { name: "Toronto", latitude: 43.65107, longitude: -79.347015 },
  { name: "Moscow", latitude: 55.7558, longitude: 37.6176 },
  { name: "Cape Town", latitude: -33.9249, longitude: 18.4241 },
  { name: "Buenos Aires", latitude: -34.6037, longitude: -58.3816 },
  { name: "Istanbul", latitude: 41.0082, longitude: 28.9784 },
  { name: "Los Angeles", latitude: 34.0522, longitude: -118.2437 },
  { name: "Singapore", latitude: 1.3521, longitude: 103.8198 },
  { name: "Seoul", latitude: 37.5665, longitude: 126.978 },
  { name: "Mexico City", latitude: 19.4326, longitude: -99.1332 },
  { name: "Mumbai", latitude: 19.076, longitude: 72.8777 },
  { name: "Athens", latitude: 37.9838, longitude: 23.7275 },
  { name: "Lisbon", latitude: 38.7223, longitude: -9.1393 },
  { name: "Vienna", latitude: 48.2082, longitude: 16.3738 },
  { name: "Hong Kong", latitude: 22.3193, longitude: 114.1694 },
  { name: "Shenzhen", latitude: 22.5431, longitude: 114.0579 },
  { name: "Kuala Lumpur", latitude: 3.139, longitude: 101.6869 },
  { name: "Cairo", latitude: 30.0444, longitude: 31.2357 },
  { name: "Santiago", latitude: -33.4489, longitude: -70.6693 },
  { name: "Bogotá", latitude: 4.611, longitude: -74.08 },
  { name: "Dublin", latitude: 53.3331, longitude: -6.2489 },
  { name: "Oslo", latitude: 59.9139, longitude: 10.7522 },
  { name: "Athens", latitude: 37.9838, longitude: 23.7275 },
  { name: "Warsaw", latitude: 52.2297, longitude: 21.0122 },
];
const setResult = (cityInfo: City) => {
  search.value = cityInfo.name;
  isOpen.value = false;
};
const filterResults = () => {
  results.value = items.filter((item) =>
    item.name.toLowerCase().includes(search.value.toLowerCase())
  );
  isOpen.value = results.value.length > 0;
};
const onChange = () => {
  filterResults();
};
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".autocomplete")) {
    isOpen.value = false;
    arrowCounter.value = -1;
  }
};
const onArrowDown = () => {
  if (arrowCounter.value < results.value.length - 1) {
    arrowCounter.value++;
  }
};
const onArrowUp = () => {
  if (arrowCounter.value > 0) {
    arrowCounter.value--;
  }
};
const onEnter = () => {
  if (arrowCounter.value >= 0 && arrowCounter.value < results.value.length) {
    setResult(results.value[arrowCounter.value]);
  }
};
const onCitySelect = (selectedCity: City) => {
  setResult(selectedCity);
  emit("citySelected", selectedCity);
};
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});
onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.autocomplete {
  position: relative;
  min-height: 165px;
  border-radius: 5px;
}
input {
  height: 30px;
  padding: 5px;
  width: 173px;
}
.autocomplete-results {
  padding: 0;
  margin: 0;
  border: 1px solid #00008b;
  height: 120px;
  overflow: auto;
  width: 184px;
}
.autocomplete-result {
  list-style: none;
  text-align: left;
  padding: 5px;
  cursor: pointer;
}
.autocomplete-result.is-active,
.autocomplete-result:hover {
  background-color: #3457d5;
  color: white;
}
</style>
