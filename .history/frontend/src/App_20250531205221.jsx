import React, { useEffect, useMemo, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Polyline,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const colors = {
  High: "#FF0000",
  Moderate: "#FFA500",
  Low: "#FFFF00",
};

const App = () => {
  const [routeData, setRouteData] = useState([]);
  const [activeInfo, setActiveInfo] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyAhU-wL99XMQ_CHI0kZ3l2dPySMVcBfLWs", // replace with your real key
  });

  // Example simulated data from backend
  useEffect(() => {
    const mockData = [
      {
        lat: 34.0540954,
        lon: -118.2360698,
        severity: "High",
        weather: "Clear",
        accident_matches: [
          {
            lat: 34.05386111,
            lon: -118.23563333,
            weather: "Clear",
            distance_m: 47.91,
          },
        ],
      },
      {
        lat: 34.0539306,
        lon: -118.2347763,
        severity: "Moderate",
        weather: "Clear",
        accident_matches: [
          {
            lat: 34.0537,
            lon: -118.23625,
            weather: "Clear",
            distance_m: 46.9,
          },
        ],
      },
    ];
    setRouteData(mockData);
  }, []);

  const center = useMemo(() => {
    if (routeData?.length && routeData[0].lat && routeData[0].lon) {
      return { lat: routeData[0].lat, lng: routeData[0].lon };
    }
    return { lat: 34.05, lng: -118.24 };
  }, [routeData]);

  return isLoaded ? (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13}>
      {/* Full route polyline */}
      <Polyline
        path={routeData.map((step) => ({ lat: step.lat, lng: step.lon }))}
        options={{
          strokeColor: "#00bfff",
          strokeOpacity: 0.8,
          strokeWeight: 4,
        }}
      />

      {/* Accident markers */}
      {routeData.map((step, idx) =>
        step.accident_matches?.map((acc, i) => (
          <Marker
            key={`${idx}-acc-${i}`}
            position={{ lat: acc.lat, lng: acc.lon }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: colors[step.severity],
              fillOpacity: 0.7,
              strokeWeight: 0,
              scale: 6,
            }}
            onClick={() =>
              setActiveInfo({
                lat: acc.lat,
                lon: acc.lon,
                weather: acc.weather,
                distance: acc.distance_m,
              })
            }
          />
        ))
      )}

      {activeInfo && (
        <InfoWindow
          position={{ lat: activeInfo.lat, lng: activeInfo.lon }}
          onCloseClick={() => setActiveInfo(null)}
        >
          <div>
            <strong>Accident Weather:</strong> {activeInfo.weather}
            <br />
            <strong>Distance:</strong> {activeInfo.distance.toFixed(1)} m
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  ) : (
    <div>Loading map...</div>
  );
};

export default App;
