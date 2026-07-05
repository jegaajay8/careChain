import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// 1. GLOBAL STYLES
import "./style.css"; 

// 2. LEAFLET MAP STYLES
import "leaflet/dist/leaflet.css";

// 3. LEAFLET ICON FIX
// This ensures the blue pins appear correctly on the map.
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

// Apply this icon to all markers by default
L.Marker.prototype.options.icon = DefaultIcon;

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);