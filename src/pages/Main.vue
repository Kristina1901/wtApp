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
      <CitiesList :favoritesCity="favoritesCity">
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
import { ref, onMounted, watch } from "vue";
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

const city = ref<City | null>(null);
const weatherbyDay = ref<UserWeather | null>(null);
const weatherbyWeek = ref<WeatherByWeekAverage | null>(null);
const hourlyForecastByDay = ref<HourlyForecast[]>([]);
const hourlyForecastByNight = ref<HourlyForecast[]>([]);
const { locale } = useI18n();
const isLoading = useLoaderState();
const partDay = ref<"night" | "day">("day");
const timePeriod = ref<"day" | "week">("day");
const favoritesCity = ref<City[]>([]);
const isFavorite = ref<boolean>(false);
const showAddToFavoritesModal = ref<boolean>(false);
const showDeleteCityModal = ref<boolean>(false);
const cityToDelete = ref<string | null>(null);

const fetchWeather = async () => {
  if (!city.value?.latitude) {
    return;
  }
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
  if (!city.value?.latitude) {
    return null;
  }
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
onMounted(async () => {
  isLoading.changeStateTrue();
  try {
    const userInfo: UserInfo = await getUserInfo();
    city.value = {
      name: userInfo.city || "",
      latitude: userInfo.latitude ?? 0,
      longitude: userInfo.longitude ?? 0,
    };
    await fetchWeather();
    loadFavoritesFromLocalStorage();
  } finally {
    isLoading.changeStateFalse();
  }
});
watch(city, async (newCity) => {
  if (newCity) {
    isFavorite.value = favoritesCity.value.some(
      (favoriteCity) => favoriteCity.name === newCity.name
    );
  }
});
watch([locale, timePeriod], async () => {
  if (city.value) {
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
  hourlyForecastByDay.value = filterHourlyForecast(weatherData.hourly, "day");
  hourlyForecastByNight.value = filterHourlyForecast(
    weatherData.hourly,
    "night"
  );
};
const handleCitySelected = (cityInfo: City) => {
  city.value = cityInfo;
  fetchWeather();
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
const addToFavorites = () => {
  if (city.value) {
    if (favoritesCity.value.length >= 5) {
      showAddToFavoritesModal.value = true;
      return;
    }
    if (
      !favoritesCity.value.some(
        (favoriteCity) => favoriteCity.name === city.value?.name
      )
    ) {
      favoritesCity.value.push(city.value);
      localStorage.setItem(
        "favoritesCity",
        JSON.stringify(favoritesCity.value)
      );
      isFavorite.value = true;
    }
  }
};
const deleteFromFavorites = (cityName: string) => {
  favoritesCity.value = favoritesCity.value.filter(
    (city) => city.name !== cityName
  );
  localStorage.setItem("favoritesCity", JSON.stringify(favoritesCity.value));
  isFavorite.value = favoritesCity.value.some(
    (favoriteCity) => favoriteCity.name === city.value?.name
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
  if (city.value) {
    const storedFavorites = localStorage.getItem("favoritesCity");
    let favorites: City[] = [];
    if (storedFavorites) {
      favorites = JSON.parse(storedFavorites);
    }
    if (favorites.length < 5) {
      if (
        !favorites.some(
          (favoriteCity) => favoriteCity.name === city.value?.name
        )
      ) {
        favorites.push(city.value);
        localStorage.setItem("favoritesCity", JSON.stringify(favorites));
        favoritesCity.value = favorites;
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
