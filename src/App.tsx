import React, { useState, useEffect } from "react";
import "./App.css";
import { Overlay, Classes, Dialog, Icon, Toaster, Intent, Spinner } from "@blueprintjs/core";
import MenuBar from "./Menubar";
import WSAvcPlayer from "ws-avc-player";
import classNames from "classnames";
import CaptivePortal from "./CaptivePortal";
import * as api from "./api";
import Filemanager from "./Filemanager";
import numeral from "numeral";
import { OpusStreamDecoder } from 'opus-stream-decoder';

// video player
const player = new WSAvcPlayer({ useWorker: false });
const retryInterval = 1000;
const iconSize = 32;

// photo mode state (will take a picture instead of recording a video)
export interface PhotoMode {
  photoMode: boolean;
  setPhotoMode: (value: boolean) => void;
}

// wifi network state (currently connected network)
export interface Network {
  setNetwork: (value: string) => void;
}

// whether or not calls should be make to the backend or faked
export interface MockApi {
  mockApi: boolean;
}

// initialize the video player
function startVideo(setVideoStalling: (value: boolean) => void) {
  const video = document.getElementById("video");
  (video as any).appendChild(player.AvcPlayer.canvas);
  player.on("disconnected", () => console.log("Video stream disconnected"));
  player.on("connected", () => console.log("Video stream connected"));
  player.on("disconnected", () => setVideoStalling(true));
  player.on("connected", () => setVideoStalling(false));
  player.on("disconnected", () => setTimeout(connect, retryInterval));
  connect();
}

// set the connection of the video player (actually connect)
function connect() {
  const host = document.location.hostname;
  const scheme = document.location.protocol.startsWith("https") ? "wss" : "ws";
  const uri = `${scheme}://${host}:8080`;
  player.connect(uri);
}

let exampleSocket: WebSocket;
let opusDecoder: any;
let audioCtx: any;
let startTime: number;

function startAudio() {
  /*
  const host = document.location.hostname;
  const scheme = document.location.protocol.startsWith("https") ? "wss" : "ws";
  const uri = `${scheme}://${host}/api/sound`;
  */
  const uri = "ws://third-i.local/api/sound";
  exampleSocket = new WebSocket(uri);
  exampleSocket.binaryType = "arraybuffer";
  opusDecoder = new OpusStreamDecoder({onDecode});
  exampleSocket.onmessage = (event) => opusDecoder.ready.then(
    () => opusDecoder.decode(new Uint8Array(event.data)),
  );
  exampleSocket.onclose = () => {
    if(audioCtx !== undefined) {
      console.log("Audio stream disconnected");
    }
    setTimeout(startAudio, retryInterval);
  };
}

function onDecode({left, right, samplesDecoded, sampleRate}: any) {
  if(audioCtx === undefined) {
    console.log("Audio stream connected")
    audioCtx = new AudioContext();
    startTime = 0.1;
    return
  }
  const source = audioCtx.createBufferSource();
  const buffer = audioCtx.createBuffer(2, samplesDecoded, sampleRate);
  buffer.copyToChannel(left, 0);
  buffer.copyToChannel(right, 1);
  source.buffer = buffer;
  source.connect(audioCtx.destination);
  source.start(startTime);
  startTime += buffer.duration;
}

/*
function onDecode(e: any) {
  const buffer = audioCtx.createBuffer(2, samplesDecoded, sampleRate);
  audioWorker.postMessage([e, buffer]);
}
*/

export function toggleFullscreen(): boolean {
  if (document.exitFullscreen === undefined || !document.fullscreenEnabled) {
    return false;
  }
  if (document.fullscreenElement === null) {
    document.body.requestFullscreen();
    return true;
  } else {
    document.exitFullscreen();
    return false;
  }
}

export const MockApi = React.createContext(false);

export const unixTime = () => Math.floor(Date.now() / 1000);

// root component of the third-i web app
function App() {
  const classes = classNames(Classes.CARD, Classes.ELEVATION_4);

  // true when the component has been initialized (initial data received)
  const [initialized, setInitialized] = useState(false);
  const [menubarVisible, setMenubarVisibility] = useState(false);
  const [filemanagerVisible, setFilemanagerVisibility] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const [videoStalling, setVideoStalling] = useState(false);
  const [networkDialog, setNetworkDialog] = useState(false);
  const [ap, setAp] = useState(true);
  const [photoMode, setPhotoMode] = useState(false);
  const [network, setNetwork] = useState("");
  const [storage, setStorage] = useState<api.Storage>({ used: 0, total: 0 });
  const [recording, setRecording] = useState<ReturnType<typeof setInterval> | undefined>(undefined);
  const [shutter, setShutter] = useState(false);
  const [mockApiDetected, setMockApi] = useState(false);
  const [config, setConfig] = useState<api.Config | undefined>(undefined);
  const [presetList, setPresetList] = useState<string[]>([]);
  const [recordingTime, setRecordingTime] = useState([0, 0]);
  const [serialNumber, setSerialNumber] = useState("");

  // initialize the camera, set the portal mode and retrieve disk usage and the config file
  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      api
        .isPortal()
        .then(async ({ portal, essid, serial }) => {
          setNetworkDialog(portal);
          setAp(portal);
          setNetwork(essid || "");
          setSerialNumber(serial);
          api.getConfig().then((config) => setConfig(config));
          api.listPresets().then(({ presets }) => setPresetList(presets));
          api.getDiskUsage().then((diskUsage) => setStorage(diskUsage));
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
            setSerialNumber("01111");
            setVideoStalling(false);
          }
        });
    }
  }, [initialized, networkDialog]);

  // triggered once to start the video
  useEffect(() => {
    if (!videoStarted) {
      setVideoStarted(true);
      startVideo(setVideoStalling);
      //audioWorker = new Worker("audio.js");
      startAudio();
    }
  }, [videoStarted]);

  const addPreset = (name: string) => {
    if (!presetList.includes(name)) {
      setPresetList([...presetList, name]);
    }
  };

  const deletePreset = (name: string) => {
    setPresetList(presetList.filter((x) => x !== name));
  };

  const used = numeral(storage.used);
  const total = numeral(storage.total);
  const pct = numeral(Math.ceil((storage.used / storage.total) * 100) / 100);
  const storageInfo = `${used.format("0 b")} / ${total.format("0 b")} (${pct.format("0 %")})`;
  const formattedRecordingTime = numeral(recordingTime[1] - recordingTime[0]).format("00:00:00");

  const hiddenByMenubar: React.CSSProperties = menubarVisible ? { visibility: "hidden" } : {};

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
          <CaptivePortal // list network and allow AP mode
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
          hasBackdrop={true}
          backdropClassName="App-menubar-backdrop"
          onClose={() => setMenubarVisibility(false)}
          transitionDuration={0}
        >
          <div className={classNames(classes, "App-menubar")}>
            {config !== undefined && (
              <MenuBar
                config={config}
                setConfig={setConfig}
                presetList={presetList}
                addPreset={addPreset}
                deletePreset={deletePreset}
                photoMode={photoMode}
                setPhotoMode={setPhotoMode}
                setNetwork={setNetwork}
                ap={ap}
                setAp={setAp}
                serialNumber={serialNumber}
                onVideoSettingsUpdate={() => {
                  setVideoStalling(true);
                  if (mockApiDetected) {
                    setTimeout(() => setVideoStalling(false), 3000);
                  }
                }}
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
        <div id="video" onDoubleClick={toggleFullscreen}>
          <div className="App-video-stalling" style={{ opacity: videoStalling ? 1 : 0 }}>
            <Spinner size={Spinner.SIZE_LARGE} />
          </div>
        </div>
        <div className="App-top">
          <div className="App-top-left" style={{ fontSize: `${iconSize}px`, ...hiddenByMenubar }}>
            <Icon // icon of the filemanager
              icon="folder-close"
              iconSize={iconSize}
              onClick={() => setFilemanagerVisibility(!filemanagerVisible)}
            />
          </div>
          <div className="App-top-center" style={{ fontSize: `${iconSize}px`, ...hiddenByMenubar }}>
            <Icon // icon of the menubar
              icon="cog"
              iconSize={iconSize}
              onClick={() => setMenubarVisibility(!menubarVisible)}
            />
          </div>
          <div className="App-top-right" style={{ fontSize: `${iconSize}px` }}>
            <div className="watermark" />
          </div>
        </div>
        <div className="App-bottom" style={{ fontSize: `${iconSize}px`, ...hiddenByMenubar }}>
          <div className="App-bottom-left">
            <Icon
              icon="database"
              iconSize={iconSize}
              // icon and information of disk usage
            />
            {storageInfo}
          </div>
          <div
            className="App-bottom-center"
            style={{ fontSize: `${iconSize}px`, ...hiddenByMenubar }}
          >
            <Icon // icon to take a picture or record a video
              icon={recording !== undefined ? "stop" : photoMode ? "camera" : "mobile-video"}
              iconSize={iconSize}
              onClick={() => {
                if (photoMode) {
                  const apiCall: Promise<api.MakePhoto> = mockApiDetected
                    ? Promise.resolve({ success: true, filename: "super-cool-pic.jpeg" })
                    : api.makePhoto();

                  apiCall.then(({ filename }) => {
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
          <div
            className="App-bottom-right"
            style={{ fontSize: `${iconSize}px`, ...hiddenByMenubar }}
          >
            <Icon
              icon="globe-network"
              iconSize={iconSize}
              // icon that displays the network you are connected to or if you are in hotspot mode
            />
            {network || "Hotspot"}
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
