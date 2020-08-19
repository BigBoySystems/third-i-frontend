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
const retryInterval = 1000;
const iconSize = 32;

export interface PhotoMode {
  photoMode: boolean;
  setPhotoMode: (value: boolean) => void;
}

export interface Network {
  setNetwork: (value: string) => void;
}

export interface MockApi {
  mockApi: boolean;
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
  const scheme = document.location.protocol.startsWith("https") ? "wss" : "ws";
  const uri = `${scheme}://${host}:8080`;
  player.connect(uri);
}

export const MockApi = React.createContext(false);

function App() {
  const classes = classNames(Classes.CARD, Classes.ELEVATION_4);

  const [menubarVisible, setMenubarVisibility] = useState(false);
  const [filemanagerVisible, setFilemanagerVisibility] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const [networkDialog, setNetworkDialog] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [photoMode, setPhotoMode] = useState(false);
  const [network, setNetwork] = useState("");
  const [storage, setStorage] = useState({
    used: 300000000,
    total: 16000000000,
  } as api.Storage);
  const [recording, setRecording] = useState(false);
  const [shutter, setShutter] = useState(false);
  const [mockApiDetected, setMockApi] = useState(false);
  const [config, setConfig] = useState<api.Config | undefined>(undefined);

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      api
        .isPortal()
        .then((portal) => {
          setNetworkDialog(portal);
          api.getConfig().then((config) => {
            setConfig(config);
          });
        })
        .catch(() => {
          if (process.env.REACT_APP_MOCK_API === "true" || process.env.NODE_ENV === "development") {
            setMockApi(true);
            // NOTE: comment the line below if you want to work on the CaptivePortal dialog
            setNetworkDialog(false);
            setConfig(CONFIG_SAMPLE);
          }
        });
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
    // According to the documentation:
    //
    // The propagation from Provider to its descendant consumers (including .contextType and
    // useContext) is not subject to the shouldComponentUpdate method, so the consumer is updated
    // even when an ancestor component skips an update.
    //
    // Therefore the CaptivePortal component is not refreshed properly on startup
    <MockApi.Provider value={mockApiDetected}>
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
            {config !== undefined && (
              <MenuBar
                config={config}
                photoMode={photoMode}
                setPhotoMode={setPhotoMode}
                setNetwork={setNetwork}
                // We need this custom key because the props of the Settings component is in the state
                // of the Menubar component (which makes the Settings not re-render)
                //
                // https://github.com/palantir/blueprint/issues/3173
                key={`${photoMode}`}
              />
            )}
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
        <div id="video" style={{ width: "100vw" }} />
        <div className="App-top">
          <div className="App-top-left" style={{ fontSize: `${iconSize}px` }}>
            <Icon
              icon="folder-close"
              iconSize={iconSize}
              onClick={() => setFilemanagerVisibility(!filemanagerVisible)}
            />
          </div>
          <div className="App-top-center" style={{ fontSize: `${iconSize}px` }}>
            <Icon
              icon="cog"
              iconSize={iconSize}
              onClick={() => setMenubarVisibility(!menubarVisible)}
            />
          </div>
          <div className="App-top-right" style={{ fontSize: `${iconSize}px` }}></div>
        </div>
        <div className="App-bottom" style={{ fontSize: `${iconSize}px` }}>
          <div className="App-bottom-left">
            <Icon icon="database" iconSize={iconSize} />
            {storageInfo}
          </div>
          <div className="App-bottom-center">
            <Icon
              icon={recording ? "stop" : photoMode ? "camera" : "mobile-video"}
              iconSize={iconSize}
              onClick={() => {
                if (photoMode) {
                  setShutter(true);
                  setTimeout(() => setShutter(false), 1000);
                } else {
                  setRecording(!recording);
                }
              }}
            />
            <div className="App-timestamp">01:14:56</div>
          </div>
          <div className="App-bottom-right">
            <Icon icon="globe-network" iconSize={iconSize} />
            {network || "Access Point"}
          </div>
        </div>
        {recording && <div className="App-recording-frame" />}
        {shutter && <div className="App-shutter" />}
      </div>
    </MockApi.Provider>
  );
}

const CONFIG_SAMPLE: api.Config = {
  photo_resolution: "",
  video_width: "1280",
  video_mode: "",
  video_height: "720",
  video_fps: "30",
  video_bitrate: "3000000",
  video_profile: "baseline",
  rtmp_url: "",
  rtmp_enabled: "0",
  mpegts_clients: "192.168.1.10:3001",
  mpegts_enabled: "0",
  rtsp_enabled: "0",
  usb_enabled: "1",
  audio_enabled: "0",
  video_wb: "auto",
  exposure: "auto",
  contrast: "-15",
  sharpness: "0",
  digitalgain: "0.0",
  wifi_iface: "",
  wifi_ssid: "",
  wifi_psk: "",
  record_enabled: "0",
  record_time: "300",
  dec_enabled: "0",
  up_down: "1",
  swapcams: "1",
  udp_clients: "10.10.0.238:3000",
  udp_enabled: "0",
  ws_enabled: "1",
};

export default App;
