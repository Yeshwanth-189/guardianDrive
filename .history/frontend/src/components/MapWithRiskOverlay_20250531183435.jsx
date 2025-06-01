import React, { useCallback, useMemo, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Polyline,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100vh", // Ensures the map has a visible height
};

const colors = {
  High: "#FF0000", // Red
  Moderate: "#FFA500", // Orange
  Low: "#FFFF00", // Yellow
};

const MapWithRiskOverlay = ({ routeData }) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY", // Replace with your API key
  });

  const center = useMemo(() => {
    if (routeData?.length && routeData[0].lat && routeData[0].lon) {
      return { lat: routeData[0].lat, lng: routeData[0].lon };
    }
    return { lat: 34.05, lng: -118.24 }; // Default center
  }, [routeData]);

  const [activeInfo, setActiveInfo] = useState(null);

  return isLoaded ? (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
      {/* Draw the entire route as a single polyline */}
      <Polyline
        path={routeData.map((step) => ({ lat: step.lat, lng: step.lon }))}
        options={{
          strokeColor: "#00bfff",
          strokeOpacity: 0.8,
          strokeWeight: 4,
        }}
      />

      {/* Render accident markers */}
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

      {/* InfoWindow for active marker */}
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
    <></>
  );
};

export default MapWithRiskOverlay;
