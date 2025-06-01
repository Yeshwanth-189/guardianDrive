// src/components/MapWithRiskOverlay.jsx
import React, { useCallback, useMemo, useEffect } from "react";
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
  High: "#FF0000", // Red
  Moderate: "#FFA500", // Orange
  Low: "#FFFF00", // Yellow
};

const MapWithRiskOverlay = ({ routeData }) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyAhU-wL99XMQ_CHI0kZ3l2dPySMVcBfLWs",
  });

  const center = useMemo(() => {
    if (routeData?.length && routeData[0].lat && routeData[0].lon) {
      return { lat: routeData[0].lat, lng: routeData[0].lon };
    }
    return { lat: 34.05, lng: -118.24 };
  }, [routeData]);

  const [map, setMap] = React.useState(null);
  const [activeInfo, setActiveInfo] = React.useState(null);

  useEffect(() => {
    if (map && routeData.length > 0) {
      map.panTo({ lat: routeData[0].lat, lng: routeData[0].lon });
    }
  }, [map, routeData]);

  const onLoad = useCallback((mapInstance) => setMap(mapInstance), []);
  const onUnmount = useCallback(() => setMap(null), []);

  console.log("Map center:", center);

  if (!routeData || routeData.length === 0) {
    console.log("No routeData, map not rendered yet.");
    return <div>Loading...</div>;
  }

  console.log("Map loaded:", map);
  console.log("Route data:", isLoaded);

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
