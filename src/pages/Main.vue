<template>
  <div class="city__wrapper">
    <div :class="['weather', { favorite: isFavorite }]">
      <img src="../assets/img/city.png" alt="city" class="city__icon" />
      <span class="city">{{ city?.name }}</span>
      <span>{{ weatherbyDay?.current.temp }}℃</span>
      <img
        v-if="weatherbyDay?.current.weather.length"
        :src="getWeatherIconUrl(weatherbyDay.current.weather[0].icon)"
        alt="Weather icon"
        class="weather__icon"
        width="30"
      />
      <span>{{ weatherbyDay?.current.weather[0].description }}</span>
      <div class="action__wrapper">
        <button class="add" @click="addToFavorites"></button>
      </div>
    </div>
    <div>
      <Autocomplete @citySelected="handleCitySelected" />
    </div>
  </div>
  <div class="button__wrapper">
    <div class="button__wrapper-sub">
      <button class="button" @click="handleTimePeriodChange('day')">
        {{ $t("day") }}
      </button>
      <button class="button" @click="handleTimePeriodChange('week')">
        {{ $t("week") }}
      </button>
    </div>
    <div>
      <SwitchPartDay
        v-if="timePeriod === 'day'"
        @partDayChange="handlePartDayChange"
      />
      <CitiesList :favoriteCities="favoriteCities">
        <template #delete-button="{ cityName }">
          <button class="delete" @click="showDeleteCityConfirmation(cityName)">
            -
          </button>
        </template>
      </CitiesList>
    </div>
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
    v-model:modelValue="showAddToFavoritesModal"
    :message="$t('message')"
    showConfirmButton
    @confirm="confirmAddToFavorites"
  />
  <ModalInfo
    v-model:modelValue="showDeleteCityModal"
    :message="$t('warn')"
    showConfirmButton
    showCancelButton
    @confirm="confirmDelete"
    @cancel="cancelDelete"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, watch, reactive } from "vue";
import {
  getUserInfo,
  getUserWeatherByAllDay,
  getUserWeatherByAllWeek,
} from "../api/api";
import {
  UserInfo,
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
import Autocomplete from "../components/Autocomplete.vue";
import CitiesList from "../components/CitiesList.vue";
import ModalInfo from "../components/ModalInfo.vue";
import { groupTemperaturesByDay, filterHourlyForecast } from "../helpers/index";

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
const favoriteCities = reactive<City[]>([]);
const isFavorite = ref<boolean>(false);
const showAddToFavoritesModal = ref<boolean>(false);
const showDeleteCityModal = ref<boolean>(false);
const cityToDelete = ref<string | null>(null);

const fetchWeather = async () => {
  if (!city.name) {
    return;
  }
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
  if (!city.name) {
    return null;
  }
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
onMounted(async () => {
  isLoading.changeStateTrue();
  try {
    const userInfo: UserInfo = await getUserInfo();
    city.name = userInfo.city || "";
    city.latitude = userInfo.latitude ?? 0;
    city.longitude = userInfo.longitude ?? 0;
    await fetchWeather();
    loadFavoritesFromLocalStorage();
  } finally {
    isLoading.changeStateFalse();
  }
});
watch(city, async (newCity) => {
  if (newCity) {
    isFavorite.value = favoriteCities.some(
      (favoriteCity) => favoriteCity.name === newCity.name
    );
  }
});
watch([locale, timePeriod], async () => {
  if (city.name) {
    isLoading.changeStateTrue();
    try {
      await fetchWeather();
    } finally {
      isLoading.changeStateFalse();
    }
  }
});
const getWeatherIconUrl = (icon: string) => {
  return new URL(`../assets/img/${icon}.png`, import.meta.url).href;
};
const handlePartDayChange = (newPartOfDay: "day" | "night") => {
  partDay.value = newPartOfDay;
};
const handleTimePeriodChange = (newTimePeriod: "day" | "week") => {
  timePeriod.value = newTimePeriod;
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
const handleCitySelected = (newCity: City) => {
  city.name = newCity.name;
  city.latitude = newCity.latitude;
  city.longitude = newCity.longitude;
  fetchWeather();
};
const loadFavoritesFromLocalStorage = () => {
  const storedFavorites = localStorage.getItem("favoritesCity");
  if (storedFavorites) {
    const parsedFavorites = JSON.parse(storedFavorites) as City[];
    favoriteCities.length = 0;
    favoriteCities.push(...parsedFavorites);
    isFavorite.value = favoriteCities.some((city) => city.name === city?.name);
  }
};
const addToFavorites = () => {
  if (city.name) {
    if (favoriteCities.length >= 5) {
      showAddToFavoritesModal.value = true;
      return;
    }
    if (
      !favoriteCities.some((favoriteCity) => favoriteCity.name === city?.name)
    ) {
      const newCity = {
        name: city.name,
        latitude: city.latitude,
        longitude: city.longitude,
      };
      favoriteCities.push(newCity);
      localStorage.setItem("favoritesCity", JSON.stringify(favoriteCities));
      isFavorite.value = true;
    }
  }
};
const deleteFromFavorites = (cityName: string) => {
  const index = favoriteCities.findIndex((city) => city.name === cityName);
  if (index !== -1) {
    favoriteCities.splice(index, 1);
  }
  localStorage.setItem("favoritesCity", JSON.stringify(favoriteCities));
  isFavorite.value = favoriteCities.some(
    (favoriteCity) => favoriteCity.name === city?.name
  );
};
const showDeleteCityConfirmation = (cityName: string) => {
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
const confirmAddToFavorites = () => {
  if (city.name) {
    const storedFavorites = localStorage.getItem("favoritesCity");
    let favorites: City[] = [];
    if (storedFavorites) {
      favorites = JSON.parse(storedFavorites);
    }
    if (favorites.length < 5) {
      if (!favorites.some((favoriteCity) => favoriteCity.name === city?.name)) {
        favorites.push(city);
        localStorage.setItem("favoritesCity", JSON.stringify(favorites));
        favoriteCities.length = 0;
        favoriteCities.push(...favorites);
        isFavorite.value = true;
      }
    }
  }
  showAddToFavoritesModal.value = false;
};
</script>

<style scoped>
@import "../css/index.css";
</style>
