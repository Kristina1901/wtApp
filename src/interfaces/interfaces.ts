export interface UserInfo {
  latitude: number | null;
  longitude: number | null;
  city: string | null;
}
export interface WeatherData {
  temp: number;
  dt: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  uvi: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust: number;
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
}
export interface UserWeather {
  current: WeatherData;
  hourly: Array<WeatherData>;
}
export interface HourlyForecast {
  dt: number;
  temp: number;
  formattedTime: string;
}
export interface WeatherByDataWeek {
  city: object;
  list: Array<WeatherByWeek>;
}
export interface WeatherByWeek {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    sea_level: number;
    grnd_level: number;
    humidity: number;
    temp_kf: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust: number;
  };
  visibility: number;
  pop: number;
  sys: {
    pod: string;
  };
  dt_txt: string;
}
export interface TemperatureData {
  day: string;
  temperatures: number[];
  averageTemperature: number;
}
export interface WeatherByWeekAverage {
  [key: string]: {
    day: string;
    temperatures: number[];
    averageTemperature: number;
  };
}
export interface City {
  name: string;
  latitude: number;
  longitude: number;
}
