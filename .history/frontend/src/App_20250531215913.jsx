import React, { useRef, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Autocomplete,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const App = () => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "YOUR_API_KEY_HERE", // Replace with your key
    libraries: ["places"],
  });

  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [center, setCenter] = useState({ lat: 34.05, lng: -118.24 });

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

      setCenter(location); // Pan to location
    }
  };

  return isLoaded ? (
    <>
      {/* Input UI */}
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
          onClick={() => console.log("Ready to compute route")}
          style={{ marginTop: "8px", width: "100%" }}
        >
          Compute Route
        </button>
      </div>

      {/* Map UI */}
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12} />
    </>
  ) : (
    <div>Loading Map...</div>
  );
};

export default App;
