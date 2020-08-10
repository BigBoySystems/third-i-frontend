import React, { useState, useEffect } from "react";
import "./App.css";
import { Button, Overlay, Classes } from "@blueprintjs/core";
import MenuBar from "./Menubar";
import WSAvcPlayer from "ws-avc-player";
import classNames from "classnames";
import CaptivePortal from "./CaptivePortal";
import { isPortal } from "./api";

const player = new WSAvcPlayer({ useWorker: false });

function startVideo() {
  const video = document.getElementById("video");
  (video as any).appendChild(player.AvcPlayer.canvas);
  player.on("disconnected", () => console.log("WS disconnected"));
  player.on("connected", () => console.log("WS connected"));
  player.on("disconnected", () => {
    setTimeout(connect, 1000);
  });
  connect();
}

function connect() {
  const host = document.location.hostname;
  const uri = `ws://${host}:8080`;
  player.connect(uri);
}

function App() {
  const classes = classNames(Classes.CARD, Classes.ELEVATION_4, "App-container");

  const [menubarVisible, setMenubarVisibility] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const [captivePortal, setCaptivePortal] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      isPortal().then((portal) => setCaptivePortal(portal));
      setInitialized(true);
    }
  }, [initialized, captivePortal]);

  useEffect(() => {
    if (!videoStarted && !captivePortal) {
      startVideo();
      setVideoStarted(true);
    }
  }, [videoStarted, captivePortal]);

  return (
    <div className="App bp3-dark bp3-large bp3-text-large">
      <CaptivePortal
        dialogOpen={captivePortal}
        setDialogOpen={setCaptivePortal}
        onConnected={() => setCaptivePortal(false)}
      />
      ;
      <Overlay
        className="bp3-dark bp3-large bp3-text-large"
        isOpen={menubarVisible}
        hasBackdrop={false}
        onClose={() => setMenubarVisibility(false)}
      >
        <div className={classes}>
          <MenuBar />
        </div>
      </Overlay>
      <div id="video" style={{ width: "100vw", height: "*" }} />
      <Button
        className="App-menu"
        icon="menu"
        onClick={() => setMenubarVisibility(!menubarVisible)}
      />
    </div>
  );
}

export default App;
