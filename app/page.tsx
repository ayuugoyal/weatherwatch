"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Bar } from "react-chartjs-2";
import {
    Cloud,
    Sun,
    CloudRain,
    Droplets,
    Wind,
    Thermometer,
} from "lucide-react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

const cities = [
    { name: "Delhi", lat: 28.6139, lon: 77.209 },
    { name: "Mumbai", lat: 19.076, lon: 72.8777 },
    { name: "Chennai", lat: 13.0827, lon: 80.2707 },
    { name: "Bangalore", lat: 12.9716, lon: 77.5946 },
    { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
    { name: "Hyderabad", lat: 17.385, lon: 78.4867 },
];

interface WeatherData {
    city: string;
    temp: number;
    feels_like: number;
    main: string;
    dt: number;
    humidity: number;
    wind_speed: number;
    timestamp: number;
    weather: string;
}

interface DailySummary {
    date: string;
    avgTemp: number;
    maxTemp: number;
    minTemp: number;
    dominantCondition: string;
}

interface Alert {
    message: string;
    timestamp: number;
}

const kelvinToCelsius = (kelvin: number) => kelvin - 273.15;
const celsiusToFahrenheit = (celsius: number) => (celsius * 9) / 5 + 32;

export default function WeatherDashboard() {
    const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
    const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [selectedCity, setSelectedCity] = useState(cities[0].name);
    const [temperatureUnit, setTemperatureUnit] = useState<"C" | "F">("C");
    const [updateInterval, setUpdateInterval] = useState(5);
    const [alertThreshold, setAlertThreshold] = useState(35);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWeatherData = useCallback(async () => {
        try {
            const promises = cities.map((city) =>
                fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}`
                )
                    .then((res) => res.json())
                    .then((data) => ({
                        city: city.name,
                        temp: kelvinToCelsius(data.main.temp),
                        feels_like: kelvinToCelsius(data.main.feels_like),
                        main: data.weather[0].main,
                        dt: data.dt,
                        humidity: data.main.humidity,
                        wind_speed: data.wind.speed,
                        timestamp: data.dt,
                        weather: data.weather[0].main,
                    }))
            );
            const newWeatherData = await Promise.all(promises);
            setWeatherData(newWeatherData);
            updateDailySummaries(newWeatherData);
            checkAlerts(newWeatherData);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch weather data");
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWeatherData();
        const interval = setInterval(
            fetchWeatherData,
            updateInterval * 60 * 1000
        );
        return () => clearInterval(interval);
    }, [fetchWeatherData, updateInterval]);

    const updateDailySummaries = (data: WeatherData[]) => {
        const today = new Date().toDateString();
        const todayData = data.filter(
            (item) => new Date(item.dt * 1000).toDateString() === today
        );
        toast("fetch new weather report");

        if (todayData.length > 0) {
            const avgTemp =
                todayData.reduce((sum, item) => sum + item.temp, 0) /
                todayData.length;
            const maxTemp = Math.max(...todayData.map((item) => item.temp));
            const minTemp = Math.min(...todayData.map((item) => item.temp));
            const conditions = todayData.map((item) => item.main);
            const dominantCondition =
                conditions
                    .sort(
                        (a, b) =>
                            conditions.filter((v) => v === a).length -
                            conditions.filter((v) => v === b).length
                    )
                    .pop() || "";

            setDailySummaries((prev) => [
                ...prev.filter((summary) => summary.date !== today),
                { date: today, avgTemp, maxTemp, minTemp, dominantCondition },
            ]);
        }
    };

    const checkAlerts = (data: WeatherData[]) => {
        const cityData = data.find((item) => item.city === selectedCity);
        if (cityData && cityData.temp > alertThreshold) {
            if (
                alerts.find(
                    (alert) =>
                        alert.message ===
                        `High temperature alert in ${selectedCity}: ${cityData.temp.toFixed(
                            1
                        )}°C`
                )
            )
                return;

            const newAlert: Alert = {
                message: `High temperature alert in ${selectedCity}: ${cityData.temp.toFixed(
                    1
                )}°C`,
                timestamp: Date.now(),
            };
            setAlerts((prev) => [...prev, newAlert]);
        } else if (cityData && cityData.temp <= alertThreshold) {
            setAlerts((prev) =>
                prev.filter(
                    (alert) =>
                        alert.message !==
                        `High temperature alert in ${selectedCity}: ${cityData.temp.toFixed(
                            1
                        )}°C`
                )
            );
        }
    };

    useEffect(() => {
        checkAlerts(weatherData);
    }, [alertThreshold]);

    const convertTemperature = (temp: number) => {
        return temperatureUnit === "C" ? temp : celsiusToFahrenheit(temp);
    };

    const getWeatherIcon = (weather: string) => {
        switch (weather.toLowerCase()) {
            case "clear":
                return <Sun className="h-8 w-8 text-yellow-500" />;
            case "clouds":
                return <Cloud className="h-8 w-8 text-gray-500" />;
            case "rain":
                return <CloudRain className="h-8 w-8 text-blue-500" />;
            default:
                return <Cloud className="h-8 w-8 text-gray-500" />;
        }
    };

    const temperatureData = {
        labels: weatherData.map((data) => data.city),
        datasets: [
            {
                label: "Temperature",
                data: weatherData.map((data) => convertTemperature(data.temp)),
                backgroundColor: "rgba(255, 99, 132, 0.5)",
                borderColor: "rgb(255, 99, 132)",
                borderWidth: 1,
            },
        ],
    };

    const humidityData = {
        labels: weatherData.map((data) => data.city),
        datasets: [
            {
                label: "Humidity",
                data: weatherData.map((data) => data.humidity),
                backgroundColor: "rgba(53, 162, 235, 0.5)",
                borderColor: "rgb(53, 162, 235)",
                borderWidth: 1,
            },
        ],
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            <h1 className="text-4xl font-bold text-center mb-8">
                WeatherWatch Dashboard
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="col-span-1 md:col-span-2">
                    <CardHeader>
                        <CardTitle>Current Weather</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap justify-between gap-4">
                            {weatherData.map((city) => (
                                <div
                                    key={city.city}
                                    className="flex items-center space-x-2 bg-secondary p-4 rounded-lg"
                                >
                                    {getWeatherIcon(city.weather)}
                                    <div>
                                        <h3 className="font-semibold">
                                            {city.city}
                                        </h3>
                                        <p className="text-2xl font-bold">
                                            {convertTemperature(
                                                city.temp
                                            ).toFixed(1)}
                                            °{temperatureUnit}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {city.weather}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Detailed View</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select
                            onValueChange={setSelectedCity}
                            defaultValue={selectedCity}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a city" />
                            </SelectTrigger>
                            <SelectContent>
                                {cities.map((city) => (
                                    <SelectItem
                                        key={city.name}
                                        value={city.name}
                                    >
                                        {city.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {weatherData.find(
                            (data) => data.city === selectedCity
                        ) && (
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <Thermometer className="h-5 w-5" />
                                    <span>Temperature:</span>
                                    <span className="font-semibold">
                                        {convertTemperature(
                                            weatherData.find(
                                                (data) =>
                                                    data.city === selectedCity
                                            )!.temp
                                        ).toFixed(1)}
                                        °{temperatureUnit}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <Droplets className="h-5 w-5" />
                                    <span>Humidity:</span>
                                    <span className="font-semibold">
                                        {
                                            weatherData.find(
                                                (data) =>
                                                    data.city === selectedCity
                                            )!.humidity
                                        }
                                        %
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <Wind className="h-5 w-5" />
                                    <span>Wind Speed:</span>
                                    <span className="font-semibold">
                                        {
                                            weatherData.find(
                                                (data) =>
                                                    data.city === selectedCity
                                            )!.wind_speed
                                        }{" "}
                                        m/s
                                    </span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Weather Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="temperature">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="temperature">
                                Temperature
                            </TabsTrigger>
                            <TabsTrigger value="humidity">Humidity</TabsTrigger>
                        </TabsList>
                        <TabsContent value="temperature">
                            <Bar
                                data={temperatureData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: { position: "top" as const },
                                    },
                                }}
                            />
                        </TabsContent>
                        <TabsContent value="humidity">
                            <Bar
                                data={humidityData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: { position: "top" as const },
                                    },
                                }}
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Weather Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[200px]">
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Avg Temp</th>
                                        <th>Max Temp</th>
                                        <th>Min Temp</th>
                                        <th>Condition</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dailySummaries.map((summary, index) => (
                                        <tr key={index}>
                                            <td>{summary.date}</td>
                                            <td>
                                                {convertTemperature(
                                                    summary.avgTemp
                                                ).toFixed(1)}
                                                °{temperatureUnit}
                                            </td>
                                            <td>
                                                {convertTemperature(
                                                    summary.maxTemp
                                                ).toFixed(1)}
                                                °{temperatureUnit}
                                            </td>
                                            <td>
                                                {convertTemperature(
                                                    summary.minTemp
                                                ).toFixed(1)}
                                                °{temperatureUnit}
                                            </td>
                                            <td>{summary.dominantCondition}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </ScrollArea>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Weather Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[200px]">
                            {alerts.length > 0 ? (
                                alerts.map((alert, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center mb-2 bg-red-100 p-2 rounded"
                                    >
                                        <AlertCircle className="mr-2 text-red-500" />
                                        <div>
                                            <p>{alert.message}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(
                                                    alert.timestamp
                                                ).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No active alerts</p>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center  justify-between">
                            <Label htmlFor="temp-unit">Temperature Unit</Label>
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="temp-c">°C</Label>
                                <Switch
                                    id="temp-unit"
                                    checked={temperatureUnit === "F"}
                                    onCheckedChange={(checked) =>
                                        setTemperatureUnit(checked ? "F" : "C")
                                    }
                                />
                                <Label htmlFor="temp-f">°F</Label>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Label htmlFor="update-interval">
                                Update Interval (minutes)
                            </Label>
                            <Input
                                id="update-interval"
                                type="number"
                                value={updateInterval}
                                onChange={(e) =>
                                    setUpdateInterval(Number(e.target.value))
                                }
                                className="w-20"
                            />
                        </div>
                        <div className="flex items-center space-x-4">
                            <Label htmlFor="alert-threshold">
                                Alert Threshold (°{temperatureUnit})
                            </Label>
                            <Input
                                id="alert-threshold"
                                type="number"
                                value={alertThreshold}
                                onChange={(e) =>
                                    setAlertThreshold(Number(e.target.value))
                                }
                                className="w-20"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
