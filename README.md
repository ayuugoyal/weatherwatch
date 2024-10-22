# WeatherWatch

## Overview

This project implements a real-time data processing system for monitoring weather conditions across major metros in India. The system retrieves weather data from the OpenWeatherMap API at configurable intervals, processes the data to generate daily summaries, and provides alert notifications based on user-defined thresholds.

## Features

-   Real-time weather data retrieval for selected cities
-   Configurable update intervals for data fetching
-   Daily summary generation with average, maximum, and minimum temperatures
-   Alert notifications for extreme weather conditions based on user-defined thresholds
-   User-friendly interface for selecting cities and viewing weather comparisons

## Technologies Used

-   **Frontend**: Next.js, Tailwind CSS
-   **Data Source**: OpenWeatherMap API

## Installation

### Prerequisites

-   Node.js (v14 or higher)
-   Docker (optional, for containerization)

### Clone the Repository

```bash
git clone https://github.com/ayuugoyal/weatherwatch.git
cd weatherwatch
```

### Install dependencies

```bash
pnpm install
```

### Start the development server

```bash
pnpm run dev
```

## Configuration

### Environment Variables

You can configure the following environment variables in the `.env` or `.env.local` file:

-   `NEXT_PUBLIC_OPENWEATHER_API_KEY`: Your API key for OpenWeatherMap.

### User Settings

Users can set their preferences for:

-   Temperature unit (Celsius/Fahrenheit)
-   Update interval (in minutes)
-   Alert threshold (in °C)
