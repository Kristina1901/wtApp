import {
  UserInfo,
  UserWeather,
  WeatherByDataWeek,
} from "../interfaces/interfaces";

export async function getUserInfo(): Promise<UserInfo> {
  try {
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      city: data.city,
    };
  } catch (error) {
    console.error("Error fetching info", error);
    return {
      latitude: null,
      longitude: null,
      city: null,
    };
  }
}
export async function getUserWeatherByAllDay(
  lat: number,
  lon: number,
  key: string,
  lang: string
): Promise<UserWeather> {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=daily&units=metric&appid=${key}&lang=${lang}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting weather forecast:", error);
    throw error;
  }
}
export async function getUserWeatherByAllWeek(
  lat: number,
  lon: number,
  key: string,
  lang: string
): Promise<WeatherByDataWeek> {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${key}&lang=${lang}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting weather forecast by week:", error);
    throw error;
  }
}
