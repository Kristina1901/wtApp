import {
  WeatherByDataWeek,
  TemperatureData,
  WeatherData,
} from "../interfaces/interfaces";
export const groupTemperaturesByDay = (data: WeatherByDataWeek) => {
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
export const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};
export const filterHourlyForecast = (
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
