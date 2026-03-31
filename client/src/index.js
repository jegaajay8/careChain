import React from "react"; 
// Bringing in React so JSX can work properly

import ReactDOM from "react-dom/client"; 
// Used to connect React with the actual DOM in the browser

import App from "./App"; 
// Main component where your whole app starts

import "./style.css"; 
// Global styling file applied across the app

// Initializing root using React 18 method
const root = ReactDOM.createRoot(document.getElementById("root"));

// Mounting the React app into the HTML element with id="root"
root.render(
  <React.StrictMode>
    {/* This wrapper helps detect issues and bad practices during development.
        It runs extra checks but has no effect in production */}

    <App />
    {/* This is the top-level component that renders everything inside your app */}

    {/* add some comments don't change the code */}
  </React.StrictMode>
);