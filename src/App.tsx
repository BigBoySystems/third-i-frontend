import React, { useState, useEffect } from "react";
import "./App.css";
import { Overlay, Classes, Dialog, Icon, Toaster, Intent } from "@blueprintjs/core";
import MenuBar from "./Menubar";
import WSAvcPlayer from "ws-avc-player";
import classNames from "classnames";
import CaptivePortal from "./CaptivePortal";
import * as api from "./api";
import Filemanager from "./Filemanager";
import numeral from "numeral";

const player = new WSAvcPlayer({ useWorker: false }); // declaration of the video player
const retryInterval = 1000;
const iconSize = 32;

export interface PhotoMode {
  // implement when you are in photo mode or not
  photoMode: boolean;
  setPhotoMode: (value: boolean) => void;
}

export interface Network {
  // implement of the network you are connected to
  setNetwork: (value: string) => void;
}

export interface MockApi {
  // implement a mockApi mode
  mockApi: boolean;
}

function startVideo() {
  // component who start the video player and signal if it's connect or not
  const video = document.getElementById("video");
  (video as any).appendChild(player.AvcPlayer.canvas);
  player.on("disconnected", () => console.log("WS disconnected"));
  player.on("connected", () => console.log("WS connected"));
  player.on("disconnected", () => setTimeout(connect, retryInterval));
  connect();
}

function connect() {
  // component who set the connection of the video player
  const host = document.location.hostname;
  const scheme = document.location.protocol.startsWith("https") ? "wss" : "ws";
  const uri = `${scheme}://${host}:8080`;
  player.connect(uri);
}

export const MockApi = React.createContext(false);

export const unixTime = () => Math.floor(Date.now() / 1000);

function App() {
  // main component of the third-i web app
  const classes = classNames(Classes.CARD, Classes.ELEVATION_4);

  // declaration of each variable used in the app
  const [initialized, setInitialized] = useState(false);
  const [menubarVisible, setMenubarVisibility] = useState(false);
  const [filemanagerVisible, setFilemanagerVisibility] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const [networkDialog, setNetworkDialog] = useState(false);
  const [ap, setAp] = useState(true);
  const [photoMode, setPhotoMode] = useState(false);
  const [network, setNetwork] = useState("");
  const [storage, setStorage] = useState<api.Storage>({ used: 0, total: 0 });
  const [recording, setRecording] = useState<ReturnType<typeof setInterval> | undefined>(undefined);
  const [shutter, setShutter] = useState(false);
  const [mockApiDetected, setMockApi] = useState(false);
  const [config, setConfig] = useState<api.Config | undefined>(undefined);
  const [recordingTime, setRecordingTime] = useState([0, 0]);

  useEffect(() => {
    // useEffect who initialize the third-i, set the portal mode and retrieve disk usage and the config file
    if (!initialized) {
      setInitialized(true);
      api
        .isPortal()
        .then(({ portal, essid }) => {
          setNetworkDialog(portal);
          setAp(portal);
          setNetwork(essid || "");
          api.getConfig().then((config) => {
            setConfig(config);
          });
          api.getDiskUsage().then((diskUsage: api.Storage) => setStorage(diskUsage));
        })
        .catch(() => {
          // initialize in mockApi mode
          if (process.env.REACT_APP_MOCK_API === "true" || process.env.NODE_ENV === "development") {
            setMockApi(true);
            setStorage({
              used: 300000000,
              total: 16000000000,
            });
            // NOTE: uncomment the line below if you want to work on the CaptivePortal dialog
            //setNetworkDialog(true);
            setConfig(CONFIG_SAMPLE);
          }
        });
    }
  }, [initialized, networkDialog]);

  useEffect(() => {
    // useEffect who restart the video player if the video don't start
    if (!videoStarted) {
      startVideo();
      setVideoStarted(true);
    }
  }, [videoStarted]);

  const used = numeral(storage.used);
  const total = numeral(storage.total);
  const pct = numeral(Math.ceil((storage.used / storage.total) * 100) / 100);
  const storageInfo = `${used.format("0 b")} / ${total.format("0 b")} (${pct.format("0 %")})`;
  const formattedRecordingTime = numeral(recordingTime[1] - recordingTime[0]).format("00:00:00");

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
        <Dialog // dialog who invite the user to connect the device on a network nearby
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
          <CaptivePortal // if you choose access point mode
            onConnected={(essid) => {
              setNetworkDialog(false);
              setNetwork(essid);
            }}
            onAP={() => {
              setNetworkDialog(false);
              setNetwork("");
            }}
            ap={ap}
            setAp={setAp}
          />
        </Dialog>
        <Overlay // component of the menubar
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
                ap={ap}
                setAp={setAp}
                // We need this custom key because the props of the Settings component is in the state
                // of the Menubar component (which makes the Settings not re-render)
                //
                // https://github.com/palantir/blueprint/issues/3173
                key={`menubar-${photoMode}-${ap}`}
              />
            )}
          </div>
        </Overlay>
        <Overlay // component of the filemanager
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
            <Icon // icon of the filemanager
              icon="folder-close"
              iconSize={iconSize}
              onClick={() => setFilemanagerVisibility(!filemanagerVisible)}
            />
          </div>
          <div className="App-top-center" style={{ fontSize: `${iconSize}px` }}>
            <Icon // icon of the menubar
              icon="cog"
              iconSize={iconSize}
              onClick={() => setMenubarVisibility(!menubarVisible)}
            />
          </div>
          <div className="App-top-right" style={{ fontSize: `${iconSize}px` }}></div>
        </div>
        <div className="App-bottom" style={{ fontSize: `${iconSize}px` }}>
          <div className="App-bottom-left">
            <Icon
              icon="database"
              iconSize={iconSize}
              // icon and display of disk usage information
            />
            {storageInfo}
          </div>
          <div className="App-bottom-center">
            <Icon // icon when you click on to take a picture or take a video
              icon={recording !== undefined ? "stop" : photoMode ? "camera" : "mobile-video"}
              iconSize={iconSize}
              onClick={() => {
                if (photoMode) {
                  const apiCall = mockApiDetected
                    ? Promise.resolve("super-cool-pic.jpeg")
                    : api.makePhoto();

                  apiCall.then((filename) => {
                    AppToaster.show({
                      message: (
                        <div>
                          <p>Photo taken: {filename}</p>
                        </div>
                      ),
                      intent: Intent.SUCCESS,
                      timeout: 2000,
                    });
                  });
                  setShutter(true);
                  setTimeout(() => setShutter(false), 1000);
                } else {
                  api.updateConfig({
                    record_enabled: recording === undefined ? "1" : "0",
                  });
                  if (recording === undefined) {
                    const start = unixTime();
                    setRecording(setInterval(() => setRecordingTime([start, unixTime()]), 1000));
                    setRecordingTime([start, start]);
                  } else {
                    clearInterval(recording);
                    setRecording(undefined);
                  }
                }
              }}
            />
            <div className="App-timestamp">{formattedRecordingTime}</div>
          </div>
          <div className="App-bottom-right">
            <Icon
              icon="globe-network"
              iconSize={iconSize}
              // icon who display the network you are connected to or if you are in access point mode
            />
            {network || "Access Point"}
          </div>
        </div>
        {recording !== undefined && <div className="App-recording-frame" />}
        {shutter && <div className="App-shutter" />}
      </div>
    </MockApi.Provider>
  );
}

const AppToaster = Toaster.create({});

const CONFIG_SAMPLE: api.Config = {
  photo_resolution: "",
  video_width: "1280",
  video_mode: "3D",
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
  swapcams: "",
  udp_clients: "10.10.0.238:3000",
  udp_enabled: "0",
  ws_enabled: "1",
};

export default App;
