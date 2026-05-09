import React from "react";
// React library import for building UI components

import ReactDOM from "react-dom/client";
// ReactDOM is responsible for rendering React components into the webpage

import App from "./App";
// Importing the main App component

import "./style.css";
// Importing the main stylesheet for global styles

// Creating the root container using React 18 syntax
const rootElement = ReactDOM.createRoot(
  document.getElementById("root")
);

// Rendering the application to the browser
rootElement.render(

  <React.StrictMode>
    {/*
      React.StrictMode is used only during development.
      It helps identify unsafe lifecycle methods,
      deprecated features, and other potential issues.
    */}

    <App />
    
    {/*
      App component acts as the starting point
      of the entire CareChain application.
    */}

    {/* Additional comments can be added here if needed */}
    
  </React.StrictMode>
);