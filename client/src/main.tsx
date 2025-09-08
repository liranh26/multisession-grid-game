/**
 * Entry point for the client app (React + Vite).
 *
 * Why we import CSS here:
 * - Vite supports importing CSS from JS/TS. By importing the new dedicated stylesheet
 *   here, we keep index.html clean and keep styling in a single place (src/styles.css).
 * - This also ensures styles participate in HMR during development.
 */
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

// Grab the root container created in index.html
const rootEl = document.getElementById("root");

// Fail fast if the root element is missing (useful for debugging environments).
if (!rootEl) {
    throw new Error("Root element #root not found in index.html");
}

// Create the React root once. Using React 18 concurrent API.
const root = createRoot(rootEl);

// Render the application tree.
root.render(<App />);
