import React, { useState, useEffect } from "react";
import "./App.css";
import { Button, Overlay, Classes, Dialog, Icon } from "@blueprintjs/core";
import MenuBar from "./Menubar";
import WSAvcPlayer from "ws-avc-player";
import classNames from "classnames";
import CaptivePortal from "./CaptivePortal";
import { isPortal } from "./api";

const player = new WSAvcPlayer({ useWorker: false });
const retryInterval = 3000;
const iconSize = 64;

function startVideo() {
  const video = document.getElementById("video");
  (video as any).appendChild(player.AvcPlayer.canvas);
  player.on("disconnected", () => console.log("WS disconnected"));
  player.on("connected", () => console.log("WS connected"));
  player.on("disconnected", () => setTimeout(connect, retryInterval));
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
  const [captivePortal, setCaptivePortal] = useState(false);
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
      <Dialog
        isOpen={captivePortal}
        onClose={() => setCaptivePortal(false)}
        className="bp3-dark bp3-large bp3-text-large"
        title={<div>Select network</div>}
        icon="globe-network"
        hasBackdrop={false}
      >
        <CaptivePortal onConnected={() => setCaptivePortal(false)} />
      </Dialog>
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
      <div className="App-top-center">
        <Icon
          icon="cog"
          iconSize={iconSize}
          onClick={() => setMenubarVisibility(!menubarVisible)}
        />
      </div>
      <div className="App-bottom-center">
        <Icon icon="camera" iconSize={iconSize} />
      </div>
    </div>
  );
}

export default App;
