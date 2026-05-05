import WebApp from "@twa-dev/sdk";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

WebApp.ready();
WebApp.expand();

const root = document.documentElement;
root.style.setProperty("--tg-bg-color", WebApp.backgroundColor ?? "#ffffff");
root.style.setProperty("--tg-text-color", WebApp.themeParams.text_color ?? "#000");
root.style.setProperty("--tg-hint-color", WebApp.themeParams.hint_color ?? "#999");
root.style.setProperty("--tg-button-color", WebApp.themeParams.button_color ?? "#2481cc");
root.style.setProperty("--tg-button-text-color", WebApp.themeParams.button_text_color ?? "#fff");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
