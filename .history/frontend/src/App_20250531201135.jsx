import React from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";

const App = () => (
  <APIProvider apiKey="AIzaSyAhU-wL99XMQ_CHI0kZ3l2dPySMVcBfLWs">
    <div style={{ border: "2px solid red", height: "100vh" }}>
      <Map
        style={{ width: "100%", height: "100%" }}
        defaultCenter={{ lat: 34.05, lng: -118.24 }}
        defaultZoom={13}
        onCameraChanged={(ev) => {
          console.log(
            "Camera changed:",
            ev.detail.center,
            "zoom:",
            ev.detail.zoom
          );
        }}
      />
    </div>
  </APIProvider>
);
export default App;
