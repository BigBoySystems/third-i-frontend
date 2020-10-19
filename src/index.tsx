import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

const startTick = (window as any).tick;
const now = new Date().getTime();
const startupDelay = 3000 - (now - startTick);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

setTimeout(() => {
  const startup = document.getElementById("startup")!;
  startup.style.opacity = "0";
  setTimeout(() => (startup.style.display = "none"), 200);
}, startupDelay);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
