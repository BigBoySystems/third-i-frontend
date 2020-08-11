import React, { useState, useEffect } from "react";
import "./App.css";
import { Overlay, Classes, Dialog, Icon } from "@blueprintjs/core";
import MenuBar from "./Menubar";
import WSAvcPlayer from "ws-avc-player";
import classNames from "classnames";
import CaptivePortal from "./CaptivePortal";
import * as api from "./api";
import Filemanager from "./Filemanager";
import numeral from "numeral";

const player = new WSAvcPlayer({ useWorker: false });
const retryInterval = 3000;
const iconSize = 64;

export interface PhotoMode {
  photoMode: boolean;
  setPhotoMode: (value: boolean) => void;
}

export interface Network {
  setNetwork: (value: string) => void;
}

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
  const classes = classNames(Classes.CARD, Classes.ELEVATION_4);

  const [menubarVisible, setMenubarVisibility] = useState(false);
  const [filemanagerVisible, setFilemanagerVisibility] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const [networkDialog, setNetworkDialog] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [photoMode, setPhotoMode] = useState(false);
  const [network, setNetwork] = useState("");
  const [storage, setStorage] = useState({
    used: 300000000,
    total: 16000000000,
  } as api.Storage);

  useEffect(() => {
    if (!initialized) {
      api.isPortal().then((portal) => setNetworkDialog(portal));
      setInitialized(true);
    }
  }, [initialized, networkDialog]);

  useEffect(() => {
    if (!videoStarted) {
      startVideo();
      setVideoStarted(true);
    }
  }, [videoStarted]);

  const used = numeral(storage.used);
  const total = numeral(storage.total);
  const pct = numeral(storage.used / storage.total);
  const storageInfo = `${used.format("0 b")} / ${total.format("0 b")} (${pct.format("0 %")})`;

  return (
    <div className="App bp3-dark bp3-large bp3-text-large">
      <Dialog
        isOpen={networkDialog}
        onClose={() => setNetworkDialog(false)}
        className="bp3-dark bp3-large bp3-text-large"
        title={<div>Select network</div>}
        icon="globe-network"
        hasBackdrop={false}
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
        isCloseButtonShown={false}
      >
        <CaptivePortal
          onConnected={(essid) => {
            setNetworkDialog(false);
            setNetwork(essid);
          }}
          onAP={() => {
            setNetworkDialog(false);
            setNetwork("");
          }}
        />
      </Dialog>
      <Overlay
        className="bp3-dark bp3-large bp3-text-large"
        isOpen={menubarVisible}
        hasBackdrop={false}
        onClose={() => setMenubarVisibility(false)}
        transitionDuration={0}
      >
        <div className={classNames(classes, "App-menubar")}>
          <MenuBar
            photoMode={photoMode}
            setPhotoMode={setPhotoMode}
            setNetwork={setNetwork}
            // We need this custom key because the props of the Settings component is in the state
            // of the Menubar component (which makes the Settings not re-render)
            //
            // https://github.com/palantir/blueprint/issues/3173
            key={`${photoMode}`}
          />
        </div>
      </Overlay>
      <Overlay
        className="bp3-dark bp3-large bp3-text-large"
        isOpen={filemanagerVisible}
        hasBackdrop={false}
        onClose={() => setFilemanagerVisibility(false)}
        transitionDuration={0}
      >
        <div className={classNames(classes, "App-filemanager")}>
          <Filemanager />
        </div>
      </Overlay>
      <div id="video" style={{ width: "100vw", height: "*" }} />
      <div className="App-top-left">
        <Icon
          icon="folder-close"
          iconSize={iconSize}
          onClick={() => setFilemanagerVisibility(!filemanagerVisible)}
        />
      </div>
      <div className="App-top-center">
        <Icon
          icon="cog"
          iconSize={iconSize}
          onClick={() => setMenubarVisibility(!menubarVisible)}
        />
      </div>
      <div className="App-bottom-left">
        <Icon icon="database" iconSize={iconSize} />
        {storageInfo}
      </div>
      <div className="App-bottom-center">
        <Icon icon={photoMode ? "camera" : "mobile-video"} iconSize={iconSize} />
        <div className="App-timestamp">01:14:56</div>
      </div>
      <div className="App-bottom-right">
        <div>
          <Icon icon="globe-network" iconSize={iconSize} />
          {network || "Access Point"}
        </div>
      </div>
    </div>
  );
}

export default App;
