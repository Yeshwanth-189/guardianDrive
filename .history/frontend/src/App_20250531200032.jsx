import React from "react";
import { createRoot } from "react-dom/client";
import { APIProvider, Map } from "@vis.gl/react-google-maps";

const App = () => (
  <APIProvider
    apiKey="AIzaSyAhU-wL99XMQ_CHI0kZ3l2dPySMVcBfLWs"
    onLoad={() => console.log("Maps API has loaded.")}
  >
    <Map
      defaultZoom={13}
      defaultCenter={{ lat: 34.05, lng: -118.24 }}
      onCameraChanged={(ev) => {
        console.log(
          "Camera changed:",
          ev.detail.center,
          "zoom:",
          ev.detail.zoom
        );
      }}
      style={{ width: "100%", height: "100vh" }}
    />
  </APIProvider>
);
export default App;
