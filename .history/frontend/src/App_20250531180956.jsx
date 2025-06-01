import React, { useEffect, useState } from "react";
import MapWithRiskOverlay from "./components/MapWithRiskOverlay";
import axios from "axios";

function App() {
  const [routeData, setRouteData] = useState([]);

  useEffect(() => {
    // Sample backend call
    axios
      .post("http://localhost:8000/check_route", {
        route_points: [
          { lat: 34.0540954, lon: -118.2360698 },
          { lat: 34.0539306, lon: -118.2347763 },
        ],
      })
      .then((res) => setRouteData(res.data.results));
  }, []);

  return (
    <div className="App">
      <MapWithRiskOverlay routeData={routeData} />
    </div>
  );
}

export default App;
