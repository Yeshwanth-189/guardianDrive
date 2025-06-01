import React, { useRef, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Autocomplete,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const App = () => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyAhU-wL99XMQ_CHI0kZ3l2dPySMVcBfLWs", // Replace with your real key
    libraries: ["places"],
  });

  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [center, setCenter] = useState({ lat: 34.05, lng: -118.24 });

  const [directions, setDirections] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);

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
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);

          // Extract all lat/lng points from polyline
          const points = window.google.maps.geometry.encoding.decodePath(
            result.routes[0].overview_polyline
          );

          const route_points = points.map((point) => ({
            lat: point.lat(),
            lon: point.lng(),
          }));

          setRoutePoints(route_points);
          console.log("Route Points JSON:", { route_points });
        } else {
          alert("Directions request failed due to " + status);
        }
      }
    );
  };

  return isLoaded ? (
    <>
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
          Compute Route
        </button>
      </div>

      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13}>
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </>
  ) : (
    <div>Loading Map...</div>
  );
};

export default App;
