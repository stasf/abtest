import React from "react";
import SideBySideScenarios from "./components/SideBySideScenarios";
import "./App.css";

function App() {
  return (
    <div className="app">
      <h1>A/B Test Split Timing Demo</h1>
      <SideBySideScenarios />
    </div>
  );
}

export default App;
