import React, { useState, useEffect } from "react";
import "./App.css";
import { Button, Drawer } from "@blueprintjs/core";
import MenuBar from "./Menubar";
import WSAvcPlayer from "ws-avc-player";

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
  const [menubarVisible, setMenubarVisibility] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  useEffect(() => {
    if (!videoStarted) {
      startVideo();
      setVideoStarted(true);
    }
  }, [videoStarted]);

  return (
    <div className="App bp3-dark">
      <Drawer
        className="bp3-dark"
        isOpen={menubarVisible}
        size="25%"
        position="left"
        hasBackdrop={false}
        canOutsideClickClose={true}
        onClose={() => setMenubarVisibility(false)}
      >
        <MenuBar />
      </Drawer>
      <header className="App-header">
        <div id="video" style={{ width: "1280", height: "720" }} />
        <Button
          icon="menu"
          onClick={() => setMenubarVisibility(!menubarVisible)}
        />
      </header>
    </div>
  );
}

export default App;
