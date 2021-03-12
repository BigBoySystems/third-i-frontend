import React, { useState, useCallback } from "react";
import "./Menubar.css";
import CaptivePortal from "./CaptivePortal";
import {
  Menu,
  MenuItem,
  MenuDivider,
  PanelStack,
  IPanel,
  IPanelProps,
  Radio,
  RadioGroup,
  Switch,
  Label,
  Slider,
  Button,
  InputGroup,
  ControlGroup,
  Callout,
  Intent,
  ContextMenu,
} from "@blueprintjs/core";
import { PhotoMode, Network, MockApi, toggleFullscreen } from "./App";
import * as api from "./api";
import { useDebounceCallback } from "@react-hook/debounce";

const DEBOUNCE_TIME = 2000;

const fromStr = (value: string, default_: number) => {
  const parsed = parseFloat(value);
  if (isNaN(parsed)) {
    return default_;
  } else {
    return parsed;
  }
};

interface ConfigProps {
  config: api.Config;
  setConfig: (config: api.Config) => void;
  presetList: string[];
  addPreset: (name: string) => void;
  deletePreset: (name: string) => void;
}

// props for the Hotspot state
interface ApProps {
  ap: boolean;
  setAp: (value: boolean) => void;
}

interface PortalProps {
  serialNumber: string;
}

interface VideoSettingsUpdate {
  onVideoSettingsUpdate: () => void;
}

type MenubarProps = PortalProps & PhotoMode & Network & ConfigProps & ApProps & VideoSettingsUpdate;

interface PanelProps extends IPanelProps, MenubarProps, MockApi {
  updateConfig: (configPatch: Partial<api.Config>) => void;
}

const Context = React.createContext({} as MenubarProps);

interface PictureProps {
  config: api.Config;
  onConfigUpdate?: (config: Partial<api.Config>) => void;
  disabled?: boolean;
}

function Menubar(props: MenubarProps) {
  const [panels, setPanels] = useState<IPanel<{}>[]>([
    {
      component: Settings,
      props: {},
      title: "Settings",
    },
  ]);

  return (
    <Context.Provider value={props}>
      <PanelStack // behavior of the menu bar
        className="Menubar"
        initialPanel={panels[0]}
        onOpen={(new_) => setPanels([new_, ...panels])}
        onClose={() => setPanels(panels.slice(1))}
      />
    </Context.Provider>
  );
}

const withContext = (Component: (props: PanelProps) => any) => (panelProps: any) => (
  <Context.Consumer>
    {(props) => (
      <MockApi.Consumer>
        {(mockApi) => (
          <Component
            {...props}
            {...panelProps}
            mockApi={mockApi}
            updateConfig={async (configPatch) => {
              if (!mockApi) {
                const { config } = await api.updateConfig(configPatch);
                props.setConfig(config);
              } else {
                // NOTE: do not use that for !mock because presets can change other things
                const config = {
                  ...props.config,
                  ...configPatch,
                };
                props.setConfig(config);
              }
            }}
          />
        )}
      </MockApi.Consumer>
    )}
  </Context.Consumer>
);

const Settings = withContext(
  ({
    openPanel,
    closePanel,
    photoMode,
    setPhotoMode,
    config,
    mockApi,
    serialNumber,
    updateConfig,
  }: PanelProps) => {
    const [viewAngle, setViewAngle] = useState(config.dec_enabled === "1");
    const [audioEnabled, setAudioEnabled] = useState(config.audio_enabled === "1");
    const [fullscreen, setFullscreen] = useState(document.fullscreenElement !== null);

    return (
      <>
        <Menu>
          {document.exitFullscreen !== undefined && document.fullscreenEnabled && (
            <MenuItem // open the panel of display settings
              icon="fullscreen"
              text={fullscreen ? "Exit fullscreen" : "Fullscreen"}
              onClick={() => setFullscreen(toggleFullscreen())}
            />
          )}
          <MenuItem // open the panel of display settings
            icon="desktop"
            text="Display"
            onClick={() => openPanel({ component: Display, title: "Display" })}
          />
          <MenuItem // toggle between photo and video mode
            icon={photoMode ? "camera" : "mobile-video"}
            text="Photo/Video mode"
            labelElement={photoMode ? "Photo" : "Video"}
            onClick={() => setPhotoMode(!photoMode)}
          />
          <MenuItem // open the panel of streaming settings
            icon="settings"
            text="Streaming settings"
            onClick={() => openPanel({ component: Streaming, title: "Streaming settings" })}
          />
          <MenuItem // toggle audio
            icon="headset"
            text="Audio"
            labelElement={audioEnabled ? "Enabled" : "Disabled"}
            onClick={() => {
              setAudioEnabled(!audioEnabled);
              updateConfig({
                audio_enabled: audioEnabled ? "0" : "1",
              });
            }}
          />
          <MenuItem // set the viewing angle parameter
            icon="square"
            text="Viewing angle"
            labelElement={viewAngle ? "Medium" : "Large"}
            onClick={() => {
              setViewAngle(!viewAngle);
              updateConfig({
                dec_enabled: viewAngle ? "0" : "1",
              });
            }}
          />
          <MenuItem // open the panel of the preset settings
            icon="media"
            text="Preset"
            onClick={() => openPanel({ component: Preset, title: "Preset" })}
          />
          <MenuDivider />
          <MenuItem // open the panel of the advanced settings
            icon="cog"
            text="Advanced parameters"
            onClick={() => openPanel({ component: Advanced, title: "Advanced parameters" })}
          />
        </Menu>
        <div className="bp3-text-small bp3-text-muted">Serial number: {serialNumber}</div>
      </>
    );
  }
);

const Display = withContext(({ config, updateConfig }: PanelProps) => {
  let defaultDisplay = "3dFlat";
  if (config.video_mode === "3D") {
    defaultDisplay = "3dFlat";
  } else {
    if (config.swapcams === "1") {
      defaultDisplay = "2dRightOnly";
    } else {
      defaultDisplay = "2dLeftOnly";
    }
  }

  const [radioCheck, setRadioCheck] = useState(defaultDisplay);
  const [inverted, setInverted] = useState(false);
  const [flipped, setFlipped] = useState(false);

  // update the configuration file when you change a parameter in the display settings
  const updateDisplay = (value: string) => {
    setRadioCheck(value);

    switch (value) {
      case "3dFlat":
        updateConfig({
          video_mode: "3D",
          swapcams: "",
        });
        break;
      case "2dLeftOnly":
        updateConfig({
          video_mode: "",
          swapcams: "",
        });
        break;
      case "2dRightOnly":
        updateConfig({
          video_mode: "",
          swapcams: "1",
        });
        break;
      default:
        console.error("Not implemented display:", value);
        break;
    }
  };

  return (
    <div className="Menubar-content">
      <RadioGroup
        onChange={(event) => updateDisplay(event.currentTarget.value)}
        selectedValue={radioCheck}
      >
        <Radio label="3D flat" value="3dFlat" />
        <Radio label="3D distorted" value="3dDistorted" disabled />
        <Radio label="2D left only" value="2dLeftOnly" />
        <Radio label="2D right only" value="2dRightOnly" />
        <Radio label="Anaglyph" value="anaglyph" disabled />
      </RadioGroup>
      <Switch
        label="Inverted"
        checked={inverted}
        onChange={() => setInverted(!inverted)}
        disabled
      />
      <Switch label="Flipped" checked={flipped} onChange={() => setFlipped(!flipped)} disabled />
    </div>
  );
});

const Streaming = withContext(({ config, updateConfig }: PanelProps) => {
  // update the configuration to enable/disable the video stream on websocket
  const updateWs = (value: boolean) => {
    updateConfig({
      ws_enabled: value ? "1" : "0",
    });
  };

  // update the config to enable/disable UDP stream
  const updateUdp = (value: boolean) => {
    updateConfig({
      udp_enabled: value ? "1" : "0",
    });
  };

  // update the config file for UDP clients address
  const updateUdpClients = useDebounceCallback(
    (value: string) => updateConfig({ udp_clients: value }),
    DEBOUNCE_TIME
  );

  const updateRtmp = (value: boolean) => {
    // set if the rtmp stream is on or not and change this in the configuration file
    updateConfig({
      rtmp_enabled: value ? "1" : "0",
    });
  };

  const updateRtmpurl = useDebounceCallback(
    // update the rtmp url and change it in the configuration file
    (value: string) => updateConfig({ rtmp_url: value }),
    DEBOUNCE_TIME
  );

  const updateMpegts = (value: boolean) => {
    // update if Mpeg stream is on or not and change that in the configuration file
    updateConfig({
      mpegts_enabled: value ? "1" : "0",
    });
  };

  const updateMpegtsClients = useDebounceCallback(
    // update the config file for MPEG clients address
    (value: string) => updateConfig({ mpegts_clients: value }),
    DEBOUNCE_TIME
  );

  const updateRtsp = (value: boolean) => {
    // set if Rtsp is on or not and change it in the configuration file
    updateConfig({
      rtsp_enabled: value ? "1" : "0",
    });
  };

  return (
    <div className="Menubar-content">
      <Switch // set if the browser stream is on or not
        defaultChecked={config.ws_enabled === "1"}
        label="Browser stream"
        onChange={(ev) => updateWs(ev.currentTarget.checked)}
      />
      <Label>
        Stream UDP
        <ControlGroup>
          <Switch // set if udp stream is on or not
            defaultChecked={config.udp_enabled === "1"}
            onChange={(ev) => updateUdp(ev.currentTarget.checked)}
          />
          <InputGroup // set the udp client adress
            placeholder="Client addresses"
            defaultValue={config.udp_clients}
            onChange={(ev: any) => updateUdpClients(ev.currentTarget.value)}
            fill
          />
        </ControlGroup>
      </Label>
      <Label>
        RTMP
        <ControlGroup>
          <Switch // set if the Rtmp is on or not
            defaultChecked={config.rtmp_enabled === "1"}
            onChange={(ev) => updateRtmp(ev.currentTarget.checked)}
          />
          <InputGroup
            placeholder="URL" // set the url of rtmp
            defaultValue={config.rtmp_url}
            onChange={(ev: any) => updateRtmpurl(ev.currentTarget.value)}
            fill
          />
        </ControlGroup>
      </Label>
      <Label>
        MPEG-TS
        <ControlGroup>
          <Switch // set if Mpeg-ts is on or not
            defaultChecked={config.mpegts_enabled === "1"}
            onChange={(ev) => updateMpegts(ev.currentTarget.checked)}
          />
          <InputGroup // set the Mpeg-ts client adress
            placeholder="Clients addresses"
            defaultValue={config.mpegts_clients}
            onChange={(ev: any) => updateMpegtsClients(ev.currentTarget.value)}
            fill
          />
        </ControlGroup>
      </Label>
      <Switch // set if rtsp is on or not
        defaultChecked={config.rtsp_enabled === "1"}
        label="RTSP enabled"
        onChange={(ev) => updateRtsp(ev.currentTarget.checked)}
      />
    </div>
  );
});

const Preset = withContext(
  ({
    config,
    presetList,
    deletePreset,
    mockApi,
    updateConfig,
    onVideoSettingsUpdate,
  }: PanelProps) => (
    <div className="Menubar-content">
      {presetList.length === 0 ? (
        <Callout intent={Intent.PRIMARY}>No preset</Callout>
      ) : (
        <Menu>
          {presetList.map((preset) => (
            <MenuItem
              text={preset}
              key={preset}
              onClick={() => {
                updateConfig({
                  preset,
                });
                onVideoSettingsUpdate();
              }}
              onContextMenu={(e) => {
                e.preventDefault();

                ContextMenu.show(
                  <Menu>
                    <MenuItem
                      text="Delete"
                      icon="trash"
                      onClick={() => {
                        deletePreset(preset);
                        if (!mockApi) {
                          api.deletePreset(preset);
                        }
                      }}
                    />
                  </Menu>,
                  { left: e.clientX, top: e.clientY },
                  () => {},
                  true
                );
              }}
            />
          ))}
          <MenuDivider />
        </Menu>
      )}
      <PictureInner // display a preview of the video settings (the preset is set by the video settings)
        disabled
        // NOTE: force refresh because the sliders are using state instead of props
        key={JSON.stringify(config)}
      />
    </div>
  )
);

const Advanced = withContext(({ openPanel, closePanel, ...props }: PanelProps) => (
  // component of the advanced parameters
  <div className="Menubar-content">
    <Menu>
      <MenuItem // open the video settings panel
        icon="media"
        text="Video settings"
        onClick={() => openPanel({ component: Picture, props, title: "Video settings" })}
      />
      <MenuItem // open the wifi settings panel
        icon="globe-network"
        text="WiFi settings"
        onClick={() => openPanel({ component: SelectNetwork, props, title: "Wifi settings" })}
      />
    </Menu>
    {/*<MenuDivider />
    <Button icon="wrench" text="Factory reset" fill />
    <Button icon="updated" text="Update" fill disabled />*/}
  </div>
));

const Picture = withContext(
  ({ closePanel, config, addPreset, mockApi, updateConfig, onVideoSettingsUpdate }: PanelProps) => {
    const [bitrate, setBitrate] = useState(fromStr(config.video_bitrate, 3.0) / 1_000_000);
    const [framerate, setFramerate] = useState(fromStr(config.video_fps, 30));
    const [presetName, setPresetName] = useState("");
    const [preset, setPreset] = useState<Partial<api.Config>>({
      video_wb: config.video_wb,
      exposure: config.exposure,
      contrast: config.contrast,
      sharpness: config.sharpness,
      digitalgain: config.digitalgain,
    });

    const updateFramerate = useDebounceCallback(
      // set the framerate setting and change it in the configuration file
      (value: number) => {
        updateConfig({
          video_fps: `${value}`,
        });
        onVideoSettingsUpdate();
      },
      DEBOUNCE_TIME
    );

    const updateBitrate = useDebounceCallback(
      // set the bitrate setting and change it in the configuration file
      (value: number) => {
        updateConfig({
          video_bitrate: `${value * 1_000_000}`,
        });
        onVideoSettingsUpdate();
      },
      DEBOUNCE_TIME
    );

    const savePreset = () => {
      closePanel();
      addPreset(presetName);
      if (!mockApi) {
        api.savePreset(presetName, preset);
      }
    };

    return (
      <div className="Menubar-content">
        <PictureInner
          onConfigUpdate={(patch: any) => {
            setPreset({
              ...preset,
              ...patch,
            });
            updateConfig(patch);
            onVideoSettingsUpdate();
          }}
        />
        <Label>
          Bitrate (Mbps)
          <Slider // parameter to set the bitrate
            min={0.5}
            max={10.0}
            stepSize={0.5}
            labelStepSize={1.0}
            value={bitrate}
            showTrackFill={false}
            onChange={(value) => {
              setBitrate(value);
              updateBitrate(value);
            }}
          />
        </Label>
        <Label>
          Framerate
          <Slider // parameter to set the framerate
            min={25}
            max={60}
            stepSize={1}
            labelStepSize={5}
            value={framerate}
            showTrackFill={false}
            onChange={(value) => {
              setFramerate(value);
              updateFramerate(value);
            }}
          />
        </Label>
        <InputGroup // this button give you the possibility to save a custom preset
          value={presetName}
          onChange={(ev: any) => setPresetName(ev.currentTarget.value)}
          onKeyUp={(ev) => {
            if (ev.key === "Enter") {
              savePreset();
            }
          }}
          placeholder="Save preset"
          fill
          rightElement={<Button icon="floppy-disk" onClick={() => savePreset()} />}
        />
      </div>
    );
  }
);

// component of the rest of the video settings (used too by the preview in preset settings)
const PictureInner = withContext(({ config, onConfigUpdate, disabled }: PictureProps) => {
  const [whiteBalance, setWhiteBalance] = useState(config.video_wb);
  const [exposure, setExposure] = useState(config.exposure);
  const [contrast, setContrast] = useState(fromStr(config.contrast, 0));
  const [sharpness, setSharpness] = useState(fromStr(config.sharpness, 0));
  const [gain, setGain] = useState(fromStr(config.digitalgain, 0.0));

  // call to update the configuration if onConfigUpdate is set. otherwise noop
  const updateConfig = useCallback(onConfigUpdate || ((config: Partial<api.Config>) => {}), [
    onConfigUpdate,
  ]);

  const updateContrast = useDebounceCallback(
    // update the contrast parameter with a debounce to avoid spamming the api for each change
    (value: number) => updateConfig({ contrast: `${value}` }),
    DEBOUNCE_TIME
  );

  const updateSharpness = useDebounceCallback(
    // update the sharpness parameter with a debounce to avoid spamming the api for each change
    (value: number) => updateConfig({ sharpness: `${value}` }),
    DEBOUNCE_TIME
  );

  const updateGain = useDebounceCallback(
    // update the digital gain parameter with a debounce to avoid spamming the api for each change
    (value: number) => updateConfig({ digitalgain: `${value}` }),
    DEBOUNCE_TIME
  );

  /* we don't know what to do about stabilization parameter
      <Label>
        <Icon icon="pivot-table" />
        Stabilization
      </Label>
  */

  return (
    <div className="Menubar-content">
      <Label>
        White balance
        <div className="bp3-select">
          <select // select to choose a parameter to the white balance
            disabled={disabled}
            value={whiteBalance}
            onChange={(ev) => {
              setWhiteBalance(ev.currentTarget.value);
              updateConfig({ video_wb: ev.currentTarget.value });
            }}
          >
           {/*   <option value="off">Off</option> */}
            <option value="auto">Auto</option>
            <option value="sun">Sun</option>
            <option value="cloud">Cloud</option>
            <option value="shade">Shade</option>
            <option value="tungsten">Tungsten</option>
            <option value="fluorescent">Fluorescent</option>
            <option value="incandescent">Incandescent</option>
            <option value="flash">Flash</option>
            <option value="horizon">Horizon</option>
          </select>
        </div>
      </Label>
      <Label>
        Exposure
        <div className="bp3-select">
          <select // select to choose a parameter of the exposure
            disabled={disabled}
            value={exposure}
            onChange={(ev) => {
              setExposure(ev.currentTarget.value);
              updateConfig({ exposure: ev.currentTarget.value });
            }}
          >
            <option value="off">Off</option>
            <option value="auto">Auto</option>
            <option value="night">Night</option>
            <option value="nightpreview">Night preview</option>
            <option value="backlight">Backlight</option>
            <option value="spotlight">Spotlight</option>
            <option value="sports">Sports</option>
            <option value="snow">Snow</option>
            <option value="beach">Beach</option>
            <option value="verylong">Very long</option>
            <option value="fixedfps">Fixed fps</option>
            <option value="antishake">Anti-shake</option>
            <option value="fireworks">Fireworks</option>
          </select>
        </div>
      </Label>
      <Label>
        Contrast
        <Slider // set the contrast parameter
          min={-50}
          max={50}
          stepSize={1}
          labelStepSize={10}
          value={contrast}
          showTrackFill={false}
          onChange={(value) => {
            setContrast(value);
            updateContrast(value);
          }}
          disabled={disabled}
        />
      </Label>
      <Label>
        Sharpness
        <Slider // set the sharpness parameter
          min={-50}
          max={50}
          stepSize={1}
          labelStepSize={10}
          value={sharpness}
          showTrackFill={false}
          onChange={(value) => {
            setSharpness(value);
            updateSharpness(value);
          }}
          disabled={disabled}
        />
      </Label>
      <Label>
        Digital gain
        <Slider // set the digital gain parameter
          min={-5.0}
          max={10.0}
          stepSize={1.0}
          labelStepSize={5.0}
          value={gain}
          showTrackFill={false}
          onChange={(value) => {
            setGain(value);
            updateGain(value);
          }}
          disabled={disabled}
        />
      </Label>
    </div>
  );
});

// component of the network selection in wifi settings
const SelectNetwork = withContext(({ closePanel, setNetwork, ap, setAp }: PanelProps) => (
  <CaptivePortal
    onConnected={(essid) => {
      closePanel();
      setNetwork(essid);
    }}
    onAP={() => {
      closePanel();
      setNetwork("");
    }}
    ap={ap}
    setAp={setAp}
    vertical
  />
));

export default Menubar;
