<template>
  <canvas id="myChart"></canvas>
</template>

<script setup lang="ts">
import Chart, { ChartConfiguration, ChartItem } from "chart.js/auto";
import { onMounted } from "vue";
import { HourlyForecast, WeatherByWeekAverage } from "../interfaces/interfaces";

const props = defineProps<{
  hourlyForecast: HourlyForecast[];
  weatherbyWeek?: WeatherByWeekAverage | null;
}>();

const labels = props.weatherbyWeek
  ? Object.keys(props.weatherbyWeek)
  : props.hourlyForecast.map((f) => f.formattedTime);
const data = {
  labels,
  datasets: [
    {
      label: "Temperature",
      backgroundColor: "white",
      borderColor: "white",
      data: props.weatherbyWeek
        ? Object.keys(props.weatherbyWeek).map(
            (key) => props.weatherbyWeek![key].averageTemperature
          )
        : props.hourlyForecast.map((f) => f.temp),
    },
  ],
};
const config: ChartConfiguration = {
  type: "line",
  data: data,
  options: {},
};
onMounted(() => {
  const canvaTag = <ChartItem>document.getElementById("myChart");
  new Chart(canvaTag, config);
});
</script>

<style scoped>
canvas#myChart {
  background-color: #318ce7;
  width: 100%;
}
</style>
