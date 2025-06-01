import React, { useRef, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Autocomplete,
  DirectionsService,
  DirectionsRenderer,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import axios from "axios";

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
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyAhU-wL99XMQ_CHI0kZ3l2dPySMVcBfLWs",
    libraries: ["places", "geometry"],
  });

  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [center, setCenter] = useState({ lat: 34.05, lng: -118.24 });

  const [directions, setDirections] = useState(null);
  const [routeData, setRouteData] = useState([]); // Data returned from /check_route
  const [activeInfo, setActiveInfo] = useState(null);

  const startRef = useRef();
  const endRef = useRef();

  const onPlaceChanged = (type) => {
    const place =
      type === "start"
        ? startRef.current.getPlace()
        : endRef.current.getPlace();
    if (place.geometry) {
      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      if (type === "start") {
        setStartCoords(location);
      } else {
        setEndCoords(location);
      }
      setCenter(location); // Optional pan
    }
  };

  const computeRoute = () => {
    if (!startCoords || !endCoords) return;

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: startCoords,
        destination: endCoords,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      async (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);

          // Extract polyline points
          const points = window.google.maps.geometry.encoding.decodePath(
            result.routes[0].overview_polyline
          );

          const route_points = points.map((point) => ({
            lat: point.lat(),
            lon: point.lng(),
          }));

          // Send to backend
          try {
            const response = await axios.post(
              "http://127.0.0.1:8000/check_route",
              {
                route_points,
              }
            );

            setRouteData(response.data);
            console.log("Backend response:", response.data);
          } catch (error) {
            console.error("Error contacting backend:", error);
          }
        } else {
          alert("Directions request failed due to " + status);
        }
      }
    );
  };

  return isLoaded ? (
    <>
      {/* UI Inputs */}
      <div
        style={{
          position: "absolute",
          zIndex: 10,
          backgroundColor: "#fff",
          padding: "10px",
          borderRadius: "8px",
          top: "10px",
          left: "10px",
        }}
      >
        <Autocomplete
          onLoad={(ref) => (startRef.current = ref)}
          onPlaceChanged={() => onPlaceChanged("start")}
        >
          <input
            type="text"
            placeholder="Start Location"
            style={{ marginBottom: "8px", width: "250px", height: "30px" }}
          />
        </Autocomplete>
        <br />
        <Autocomplete
          onLoad={(ref) => (endRef.current = ref)}
          onPlaceChanged={() => onPlaceChanged("end")}
        >
          <input
            type="text"
            placeholder="End Location"
            style={{ width: "250px", height: "30px" }}
          />
        </Autocomplete>
        <br />
        <button
          disabled={!startCoords || !endCoords}
          onClick={computeRoute}
          style={{ marginTop: "8px", width: "100%" }}
        >
          Compute Route & Check Safety
        </button>
      </div>

      {/* Map UI */}
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13}>
        {directions && <DirectionsRenderer directions={directions} />}

        {/* Accident Markers */}
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
                  distance: acc.distance,
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
    </>
  ) : (
    <div>Loading Map...</div>
  );
};

export default App;
