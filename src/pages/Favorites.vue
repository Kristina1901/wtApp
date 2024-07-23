<template>
  <div v-if="favoritesCity.length === 0" class="favorites__container">
    <p>{{ $t("notFound") }}</p>
  </div>
  <div v-else class="favorites__container">
    <CitiesList
      :favoritesCity="favoritesCity"
      @city-selected="handleCitySelected"
    >
      <template #delete-button="{ cityName }">
        <button class="delete" @click="confirmDeleteFromFavorites(cityName)">
          -
        </button>
      </template>
    </CitiesList>
    <p>{{ city?.name }}</p>
    <div v-if="city">
      <div class="action__wrapper-favorites">
        <div class="button__wrapper">
          <div class="button__wrapper-sub">
            <button class="button" @click="handleTimePeriodChange('day')">
              {{ $t("day") }}
            </button>
            <button class="button" @click="handleTimePeriodChange('week')">
              {{ $t("week") }}
            </button>
          </div>
        </div>
        <SwitchPartDay
          v-if="timePeriod === 'day'"
          @partDayChange="handlePartDayChange"
        />
      </div>
      <div class="wrapper">
        <Chart
          v-if="!isLoading.state && partDay === 'day' && timePeriod === 'day'"
          :hourlyForecast="hourlyForecastByDay"
        />
        <Chart
          v-if="!isLoading.state && partDay === 'night' && timePeriod === 'day'"
          :hourlyForecast="hourlyForecastByNight"
        />
        <Chart
          v-if="!isLoading.state && timePeriod === 'week'"
          :hourlyForecast="hourlyForecastByNight"
          :weatherbyWeek="weatherbyWeek"
        />
        <Loader v-if="isLoading.state" />
      </div>
      <ModalInfo
        v-model:modelValue="showDeleteCityModal"
        :message="$t('warn')"
        showConfirmButton
        showCancelButton
        @confirm="confirmDelete"
        @cancel="cancelDelete"
      />
    </div>
    <div v-else>{{ $t("select") }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { getUserWeatherByAllDay, getUserWeatherByAllWeek } from "../api/api";
import {
  UserWeather,
  HourlyForecast,
  WeatherByDataWeek,
  WeatherByWeekAverage,
  City,
} from "../interfaces/interfaces";
import { useI18n } from "vue-i18n";
import Chart from "../components/Chart.vue";
import { useLoaderState } from "../store/isloading";
import Loader from "../components/Loader.vue";
import SwitchPartDay from "../components/SwitchPartDay.vue";
import CitiesList from "../components/CitiesList.vue";
import { groupTemperaturesByDay, filterHourlyForecast } from "../helpers/index";
import ModalInfo from "../components/ModalInfo.vue";

const city = ref<City | null>(null);
const weatherbyDay = ref<UserWeather | null>(null);
const weatherbyWeek = ref<WeatherByWeekAverage | null>(null);
const hourlyForecastByDay = ref<HourlyForecast[]>([]);
const hourlyForecastByNight = ref<HourlyForecast[]>([]);
const { locale } = useI18n();
const isLoading = useLoaderState();
const partDay = ref<"night" | "day">("day");
const timePeriod = ref<"day" | "week">("day");
const favoritesCity = ref<City[]>(
  JSON.parse(localStorage.getItem("favoritesCity") || "[]")
);
const isFavorite = ref<boolean>(false);
const showDeleteCityModal = ref<boolean>(false);
const cityToDelete = ref<string | null>(null);
const fetchWeather = async () => {
  if (!city.value?.latitude) return;
  isLoading.changeStateTrue();
  if (timePeriod.value === "day") {
    const weatherData = await fetchWeatherByDay();
    if (weatherData) {
      weatherbyDay.value = weatherData;
      updateForecasts(weatherData);
    }
  } else {
    const weatherDataWeek = await fetchWeatherByWeek();
    if (weatherDataWeek) {
      weatherbyWeek.value = groupTemperaturesByDay(weatherDataWeek);
    }
  }
  isLoading.changeStateFalse();
};
const fetchWeatherByDay = async (): Promise<UserWeather | null> => {
  if (!city.value?.latitude) return null;

  return await getUserWeatherByAllDay(
    city.value.latitude,
    city.value.longitude,
    "73cf37f869c512fdb495b65988133601",
    locale.value
  );
};
const fetchWeatherByWeek = async (): Promise<WeatherByDataWeek | null> => {
  if (!city.value?.latitude) {
    return null;
  }
  return await getUserWeatherByAllWeek(
    city.value.latitude,
    city.value.longitude,
    "73cf37f869c512fdb495b65988133601",
    locale.value
  );
};
const handlePartDayChange = (newPartOfDay: "day" | "night") => {
  partDay.value = newPartOfDay;
  fetchWeather();
};
const handleTimePeriodChange = (newTimePeriod: "day" | "week") => {
  timePeriod.value = newTimePeriod;
  fetchWeather();
};
const handleCitySelected = (newCity: City) => {
  city.value = newCity;
  if (!favoritesCity.value.some((favCity) => favCity.name === newCity.name)) {
    city.value = null;
  }
  fetchWeather();
};
const updateForecasts = (weatherData: UserWeather) => {
  hourlyForecastByDay.value = filterHourlyForecast(weatherData.hourly, "day");
  hourlyForecastByNight.value = filterHourlyForecast(
    weatherData.hourly,
    "night"
  );
};
const loadFavoritesFromLocalStorage = () => {
  const storedFavorites = localStorage.getItem("favoritesCity");
  if (storedFavorites) {
    favoritesCity.value = JSON.parse(storedFavorites);
    isFavorite.value = favoritesCity.value.some(
      (favoriteCity) => favoriteCity.name === city.value?.name
    );
  }
};
const confirmDeleteFromFavorites = (cityName: string) => {
  cityToDelete.value = cityName;
  showDeleteCityModal.value = true;
};
const confirmDelete = () => {
  if (cityToDelete.value) {
    deleteFromFavorites(cityToDelete.value);
    cityToDelete.value = null;
  }
  showDeleteCityModal.value = false;
};
const cancelDelete = () => {
  cityToDelete.value = null;
  showDeleteCityModal.value = false;
};
const deleteFromFavorites = (cityName: string) => {
  favoritesCity.value = favoritesCity.value.filter(
    (city) => city.name !== cityName
  );
  localStorage.setItem("favoritesCity", JSON.stringify(favoritesCity.value));
  city.value = null;
};
watch([locale, timePeriod, partDay], async () => {
  if (city.value) {
    await fetchWeather();
  }
});
onMounted(async () => {
  loadFavoritesFromLocalStorage();
});
</script>

<style scoped>
@import "../css/index.css";
</style>
