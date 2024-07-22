import { WeatherByDataWeek, TemperatureData } from "../interfaces/interfaces";
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
