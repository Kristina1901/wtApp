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
    <div v-if="city.name">
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
    </div>
    <div v-else>{{ $t("select") }}</div>
    <ModalInfo
      v-model:modelValue="showDeleteCityModal"
      :message="$t('warn')"
      showConfirmButton
      showCancelButton
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, reactive } from "vue";
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

const city = reactive<City>({
  name: "",
  latitude: 0,
  longitude: 0,
});
const weatherbyDay = reactive<UserWeather>({
  current: {
    temp: 0,
    dt: 0,
    feels_like: 0,
    pressure: 0,
    humidity: 0,
    dew_point: 0,
    uvi: 0,
    clouds: 0,
    visibility: 0,
    wind_speed: 0,
    wind_deg: 0,
    wind_gust: 0,
    weather: [
      {
        id: 0,
        main: "",
        description: "",
        icon: "",
      },
    ],
  },
  hourly: [],
});
const weatherbyWeek = reactive<WeatherByWeekAverage>({});
const hourlyForecastByDay = reactive<HourlyForecast[]>([
  { dt: 0, temp: 0, formattedTime: "" },
]);
const hourlyForecastByNight = reactive<HourlyForecast[]>([
  { dt: 0, temp: 0, formattedTime: "" },
]);
const { locale } = useI18n();
const isLoading = useLoaderState();
const partDay = ref<"night" | "day">("day");
const timePeriod = ref<"day" | "week">("day");
const favoritesCity = ref<City[]>(
  JSON.parse(localStorage.getItem("favoritesCity") || "[]")
);
const showDeleteCityModal = ref<boolean>(false);
const cityToDelete = ref<string | null>(null);
const fetchWeather = async () => {
  if (!city.name) return;
  isLoading.changeStateTrue();
  if (timePeriod.value === "day") {
    const weatherData = await fetchWeatherByDay();
    if (weatherData) {
      weatherbyDay.current = weatherData.current;
      weatherbyDay.hourly = weatherData.hourly;
      updateForecasts(weatherData);
    }
  } else {
    const weatherDataWeek = await fetchWeatherByWeek();
    if (weatherDataWeek) {
      Object.assign(weatherbyWeek, groupTemperaturesByDay(weatherDataWeek));
    }
  }
  isLoading.changeStateFalse();
};
const fetchWeatherByDay = async (): Promise<UserWeather | null> => {
  if (!city.name) return null;
  return await getUserWeatherByAllDay(
    city.latitude,
    city.longitude,
    "73cf37f869c512fdb495b65988133601",
    locale.value
  );
};
const fetchWeatherByWeek = async (): Promise<WeatherByDataWeek | null> => {
  if (!city.name) {
    return null;
  }
  return await getUserWeatherByAllWeek(
    city.latitude,
    city.longitude,
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
  city.name = newCity.name;
  city.latitude = newCity.latitude;
  city.longitude = newCity.longitude;
  if (!favoritesCity.value.some((favCity) => favCity.name === newCity.name)) {
    resetCity();
  }
  fetchWeather();
};
const updateForecasts = (weatherData: UserWeather) => {
  const dayForecasts = filterHourlyForecast(weatherData.hourly, "day");
  const nightForecasts = filterHourlyForecast(weatherData.hourly, "night");
  hourlyForecastByDay.splice(0, hourlyForecastByDay.length, ...dayForecasts);
  hourlyForecastByNight.splice(
    0,
    hourlyForecastByNight.length,
    ...nightForecasts
  );
};
const loadFavoritesFromLocalStorage = () => {
  const storedFavorites = localStorage.getItem("favoritesCity");
  if (storedFavorites) {
    favoritesCity.value = JSON.parse(storedFavorites);
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
  resetCity();
};
const resetCity = () => {
  city.name = "";
  city.latitude = 0;
  city.longitude = 0;
};
watch([locale, timePeriod, partDay], async () => {
  if (city.name) {
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
