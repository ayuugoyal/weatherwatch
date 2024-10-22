const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

export const fetchWeatherData = async (lat: number, lon: number) => {
    const data = await fetch(
        `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    ).then((res) => res.json());
    console.log(data);
    return data;
};

export const kelvinToCelsius = (temp: number) => {
    return temp - 273.15;
};
