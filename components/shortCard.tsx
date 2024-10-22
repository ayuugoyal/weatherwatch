"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Sun, CloudRain } from "lucide-react";

interface WeatherData {
    city: string;
    temp: number;
    feels_like: number;
    main: string;
    dt: number;
    humidity?: number;
    wind_speed?: number;
    timestamp: number;
    weather: string;
}

export default function ShortCard(weatherData: WeatherData[]) {
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

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">
                Weather Dashboard
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {weatherData.map((city) => (
                    <Card key={city.city} className="overflow-hidden">
                        <CardHeader className="bg-primary text-primary-foreground">
                            <CardTitle>{city.city}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-3xl font-bold">
                                        {city.temp.toFixed(1)}°C
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Feels like: {city.feels_like.toFixed(1)}
                                        °C
                                    </p>
                                </div>
                                <div className="flex flex-col items-center">
                                    {getWeatherIcon(city.weather)}
                                    <p className="text-sm mt-1">
                                        {city.weather}
                                    </p>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-4">
                                Last updated:{" "}
                                {new Date(
                                    city.timestamp * 1000
                                ).toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
