# backend/main.py
from fastapi import FastAPI, Query
from pydantic import BaseModel
import pandas as pd
import numpy as np
import requests
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load precomputed accident clusters
accident_df = pd.read_csv("../data/accident_clusters.csv")
accident_coords = accident_df[["LATITUDE", "LONGITUD"]].dropna().to_numpy()

# Fast Haversine distance calculator
def haversine_np(lat1, lon1, lat2, lon2):
    R = 6371000
    lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = np.sin(dlat / 2.0) ** 2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2.0) ** 2
    return 2 * R * np.arcsin(np.sqrt(a))

# Request model
class RoutePoint(BaseModel):
    lat: float
    lon: float

class RouteCheckRequest(BaseModel):
    route_points: list[RoutePoint]

@app.post("/check_route")
def check_route(request: RouteCheckRequest):
    API_KEY = "77559f271538199cca46ee04018973f8"
    threshold = 100
    results = []

    for point in request.route_points:
        lat1, lon1 = point.lat, point.lon

        # Weather API call
        weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat1}&lon={lon1}&appid={API_KEY}"
        weather_res = requests.get(weather_url).json()
        route_weather = weather_res['weather'][0]['main'] if 'weather' in weather_res else "Unknown"

        # Haversine match
        distances = haversine_np(lat1, lon1, accident_coords[:, 0], accident_coords[:, 1])
        match_indices = np.where(distances <= threshold)[0]

        severity = "Low"
        matched_accidents = []

        if match_indices.size > 0:
            accident_subset = accident_df.iloc[match_indices]
            accident_weathers = accident_subset['WEATHERNAME'].values
            matched_accidents = [
                {
                    "lat": row['LATITUDE'],
                    "lon": row['LONGITUD'],
                    "weather": row['WEATHERNAME']
                }
                for _, row in accident_subset.iterrows()
            ]

            if route_weather in accident_weathers:
                severity = "High"
            elif route_weather != "Clear" and any(w == "Clear" for w in accident_weathers):
                severity = "Moderate"
            elif route_weather == "Clear" and any(w != "Clear" for w in accident_weathers):
                severity = "Low"

        results.append({
            "lat": lat1,
            "lon": lon1,
            "weather": route_weather,
            "severity": severity,
            "distance": distance,
            "accident_matches": matched_accidents
        })


    return {"results": results}
