<template>
  <div v-if="favoritesCity.length === 0" class="favorites__container">
    <p>No favorites found</p>
  </div>
  <div v-else class="favorites__container">
    <p>{{ city?.name }}</p>
    <CitiesList
      :favoritesCity="favoritesCity"
      @city-selected="handleCitySelected"
    >
      <template #delete-button="{ cityName }">
        <button class="delete" @click="deleteFromFavorites(cityName)">-</button>
      </template>
    </CitiesList>
    <div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { getUserWeatherByAllDay, getUserWeatherByAllWeek } from "../api/api";
import {
  WeatherData,
  UserWeather,
  HourlyForecast,
  WeatherByDataWeek,
  TemperatureData,
  WeatherByWeekAverage,
  City,
} from "../interfaces/interfaces";
import { useI18n } from "vue-i18n";
import Chart from "../components/Chart.vue";
import { useLoaderState } from "../store/isloading";
import Loader from "../components/Loader.vue";
import SwitchPartDay from "../components/SwitchPartDay.vue";
import CitiesList from "../components/CitiesList.vue";

const city = ref<City | null>(
  JSON.parse(localStorage.getItem("favoritesCity") || "[]")[0] || null
);
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
const filterHourlyForecast = (
  weatherHourly: Array<WeatherData>,
  partOfDay: "day" | "night"
) => {
  const currentDate = new Date().toISOString().split("T")[0];
  let hourlyData = weatherHourly.filter((forecast) => {
    const forecastDate = new Date(forecast.dt * 1000)
      .toISOString()
      .split("T")[0];
    return forecastDate === currentDate;
  });
  if (partOfDay === "night") {
    hourlyData = hourlyData.filter((forecast) => {
      const time = new Date(forecast.dt * 1000).getHours();
      return (time >= 22 && time < 23) || (time >= 0 && time < 4);
    });
  } else if (partOfDay === "day") {
    hourlyData = hourlyData.filter((forecast) => {
      const time = new Date(forecast.dt * 1000).getHours();
      return time >= 6 && time <= 21;
    });
  }
  return hourlyData.map((forecast) => ({
    dt: forecast.dt,
    temp: forecast.temp,
    formattedTime: formatDate(forecast.dt),
  }));
};
const fetchWeather = async () => {
  if (!city.value?.latitude) return;
  isLoading.changeStateTrue();
  try {
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
  } finally {
    isLoading.changeStateFalse();
  }
};
const fetchWeatherByDay = async (): Promise<UserWeather | null> => {
  if (!city.value?.latitude) return null;
  try {
    return await getUserWeatherByAllDay(
      city.value.latitude,
      city.value.longitude,
      "73cf37f869c512fdb495b65988133601",
      locale.value
    );
  } catch (error) {
    return null;
  }
};
const fetchWeatherByWeek = async (): Promise<WeatherByDataWeek | null> => {
  if (!city.value?.latitude || !city.value?.longitude) {
    return null;
  }
  try {
    return await getUserWeatherByAllWeek(
      city.value.latitude,
      city.value.longitude,
      "73cf37f869c512fdb495b65988133601",
      locale.value
    );
  } catch (error) {
    return null;
  }
};
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
  fetchWeather();
};
const groupTemperaturesByDay = (data: WeatherByDataWeek) => {
  const grouped: Record<string, TemperatureData> = {};
  data.list.forEach((entry) => {
    const date = entry.dt_txt.split(" ")[0];
    if (!grouped[date]) {
      grouped[date] = {
        day: date,
        temperatures: [],
        averageTemperature: 0,
      };
    }
    grouped[date].temperatures.push(entry.main.temp);
  });
  for (const date in grouped) {
    const temps = grouped[date].temperatures;
    const avgTemp =
      temps.reduce((sum: number, temp: number) => sum + temp, 0) / temps.length;
    grouped[date].averageTemperature = avgTemp;
  }
  return grouped;
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
const deleteFromFavorites = (cityName: string) => {
  favoritesCity.value = favoritesCity.value.filter(
    (city) => city.name !== cityName
  );
  localStorage.setItem("favoritesCity", JSON.stringify(favoritesCity.value));
  if (city.value?.name === cityName) {
    city.value = favoritesCity.value.length > 0 ? favoritesCity.value[0] : null;
  }
};
onMounted(async () => {
  if (city.value) {
    await fetchWeather();
  }
  loadFavoritesFromLocalStorage();
});
watch([city, locale, timePeriod, partDay], async () => {
  if (city.value) {
    await fetchWeather();
  }
});
</script>

<style scoped>
@import "../css/index.css";
</style>
