// src/components/MapWithRiskOverlay.jsx
import React, { useCallback, useMemo } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Polyline,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "600px",
};

const colors = {
  High: "#FF0000", // Red
  Moderate: "#FFA500", // Orange
  Low: "#FFFF00", // Yellow
};

const MapWithRiskOverlay = ({ routeData }) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY",
  });

  const center = useMemo(
    () => routeData?.[0] || { lat: 34.05, lng: -118.24 },
    [routeData]
  );

  const [map, setMap] = React.useState(null);
  const [activeInfo, setActiveInfo] = React.useState(null);

  const onLoad = useCallback((mapInstance) => setMap(mapInstance), []);
  const onUnmount = useCallback(() => setMap(null), []);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {routeData.map((step, idx) => (
        <React.Fragment key={idx}>
          <Polyline
            path={[{ lat: step.lat, lng: step.lon }]}
            options={{
              strokeColor: colors[step.severity],
              strokeOpacity: 0.8,
              strokeWeight: 6,
              clickable: false,
            }}
          />

          {step.accident_matches.map((acc, i) => (
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
          ))}
        </React.Fragment>
      ))}

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
