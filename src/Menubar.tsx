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
} from "@blueprintjs/core";
import { PhotoMode, Network } from "./App";
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

const LIGHTING: { [k: string]: Partial<api.Config> } = {
  nightOutside: {
    contrast: "0",
    sharpness: "0",
    digitalgain: "0",
  },
  dayInside: {
    contrast: "1",
    sharpness: "1",
    digitalgain: "1",
  },
  nightInside: {
    contrast: "2",
    sharpness: "2",
    digitalgain: "2",
  },
  dayOutside: {
    contrast: "3",
    sharpness: "3",
    digitalgain: "3",
  },
};

interface ConfigProps {
  config: api.Config;
}

interface ApProps {
  ap: boolean;
  setAp: (value: boolean) => void;
}

type MenubarProps = PhotoMode & Network & ConfigProps & ApProps;
type PanelProps = IPanelProps & MenubarProps;

interface PictureProps {
  config: api.Config;
  onConfigUpdate?: (config: Partial<api.Config>) => void;
  disabled?: boolean;
}

function Menubar(props: MenubarProps) {
  const [panels, setPanels] = useState<IPanel<MenubarProps>[]>([
    {
      component: Settings,
      props,
      title: "Settings",
    },
  ]);

  return (
    <PanelStack
      className="Menubar"
      initialPanel={panels[0]}
      onOpen={(new_) => setPanels([new_ as IPanel<MenubarProps>, ...panels])}
      onClose={() => setPanels(panels.slice(1))}
    />
  );
}

function Settings({ openPanel, closePanel, ...props }: PanelProps) {
  const { photoMode, setPhotoMode } = props;
  const [viewAngleSquare, setViewAngleSquare] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(props.config.audio_enabled === "1");

  return (
    <Menu>
      <MenuItem
        icon="desktop"
        text="Display"
        onClick={() => openPanel({ component: Display, props, title: "Display" })}
      />
      <MenuItem
        icon={photoMode ? "camera" : "mobile-video"}
        text="Photo/Video mode"
        labelElement={photoMode ? "Photo" : "Video"}
        onClick={() => setPhotoMode(!photoMode)}
      />
      <MenuItem
        icon="mobile-video"
        text="Streaming settings"
        onClick={() => openPanel({ component: Streaming, props, title: "Streaming settings" })}
      />
      <MenuItem
        icon="headset"
        text="Audio"
        labelElement={audioEnabled ? "Enabled" : "Disabled"}
        onClick={() => {
          api.updateConfig({ audio_enabled: audioEnabled ? "0" : "1" });
          setAudioEnabled(!audioEnabled);
        }}
      />
      <MenuItem
        icon="square"
        text="Viewing angle"
        labelElement={viewAngleSquare ? "Square" : "Extended"}
        onClick={() => setViewAngleSquare(!viewAngleSquare)}
        disabled
      />
      <MenuItem
        icon="lightbulb"
        text="Lighting"
        onClick={() => openPanel({ component: Lighting, props, title: "Lighting" })}
      />
      <MenuDivider />
      <MenuItem
        icon="cog"
        text="Advanced parameters"
        onClick={() => openPanel({ component: Advanced, props, title: "Advanced parameters" })}
      />
    </Menu>
  );
}

function Display({ config }: PanelProps) {
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

  const updateDisplay = (value: string) => {
    setRadioCheck(value);

    switch (value) {
      case "3dFlat":
        api.updateConfig({
          video_mode: "3D",
          swapcams: "",
        });
        break;
      case "2dLeftOnly":
        api.updateConfig({
          video_mode: "",
          swapcams: "",
        });
        break;
      case "2dRightOnly":
        api.updateConfig({
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
}

function Streaming({ config }: PanelProps) {
  const updateWs = (value: boolean) => {
    api.updateConfig({
      ws_enabled: value ? "1" : "0",
    });
  };

  const updateUdp = (value: boolean) => {
    api.updateConfig({
      udp_enabled: value ? "1" : "0",
    });
  };

  const updateUdpClients = useDebounceCallback(
    (value: string) => api.updateConfig({ udp_clients: value }),
    DEBOUNCE_TIME
  );

  const updateRtmp = (value: boolean) => {
    api.updateConfig({
      rtmp_enabled: value ? "1" : "0",
    });
  };

  const updateRtmpurl = useDebounceCallback(
    (value: string) => api.updateConfig({ rtmp_url: value }),
    DEBOUNCE_TIME
  );

  const updateMpegts = (value: boolean) => {
    api.updateConfig({
      mpegts_enabled: value ? "1" : "0",
    });
  };

  const updateMpegtsClients = useDebounceCallback(
    (value: string) => api.updateConfig({ mpegts_clients: value }),
    DEBOUNCE_TIME
  );

  const updateRtsp = (value: boolean) => {
    api.updateConfig({
      rtsp_enabled: value ? "1" : "0",
    });
  };

  return (
    <div className="Menubar-content">
      <Switch
        defaultChecked={config.ws_enabled === "1"}
        label="Browser stream"
        onChange={(ev) => updateWs(ev.currentTarget.checked)}
      />
      <Label>
        Stream UDP
        <ControlGroup>
          <Switch
            defaultChecked={config.udp_enabled === "1"}
            onChange={(ev) => updateUdp(ev.currentTarget.checked)}
          />
          <InputGroup
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
          <Switch
            defaultChecked={config.rtmp_enabled === "1"}
            onChange={(ev) => updateRtmp(ev.currentTarget.checked)}
          />
          <InputGroup
            placeholder="URL"
            defaultValue={config.rtmp_url}
            onChange={(ev: any) => updateRtmpurl(ev.currentTarget.value)}
            fill
          />
        </ControlGroup>
      </Label>
      <Label>
        MPEG-TS
        <ControlGroup>
          <Switch
            defaultChecked={config.mpegts_enabled === "1"}
            onChange={(ev) => updateMpegts(ev.currentTarget.checked)}
          />
          <InputGroup
            placeholder="Clients addresses"
            defaultValue={config.mpegts_clients}
            onChange={(ev: any) => updateMpegtsClients(ev.currentTarget.value)}
            fill
          />
        </ControlGroup>
      </Label>
      <Switch
        defaultChecked={config.rtsp_enabled === "1"}
        label="RTSP enabled"
        onChange={(ev) => updateRtsp(ev.currentTarget.checked)}
      />
    </div>
  );
}

function Lighting({ config }: PanelProps) {
  const [radioCheck, setRadioCheck] = useState("nightOutside");
  const [configPreview, setConfigPreview] = useState(config);

  return (
    <div className="Menubar-content">
      <RadioGroup
        onChange={(event) => {
          const value = event.currentTarget.value;
          const settings = LIGHTING[value];

          setRadioCheck(value);
          setConfigPreview({ ...configPreview, ...settings });
        }}
        selectedValue={radioCheck}
      >
        <Radio label="Night outside" value="nightOutside" />
        <Radio label="Day inside" value="dayInside" />
        <Radio label="Night inside" value="nightInside" />
        <Radio label="Day outside" value="dayOutside" />
      </RadioGroup>
      <PictureInner config={configPreview} disabled key={`${JSON.stringify(configPreview)}`} />
    </div>
  );
}

function Advanced({ openPanel, closePanel, ...props }: PanelProps) {
  return (
    <div className="Menubar-content">
      <Menu>
        <MenuItem
          icon="media"
          text="Video settings"
          onClick={() => openPanel({ component: Picture, props, title: "Video settings" })}
        />
        <MenuItem
          icon="globe-network"
          text="WiFi settings"
          onClick={() => openPanel({ component: SelectNetwork, props, title: "Wifi settings" })}
        />
      </Menu>
      <MenuDivider />
      <Button icon="wrench" text="Factory reset" fill />
      <Button icon="updated" text="Update" fill disabled />
    </div>
  );
}

function Picture({ closePanel, config }: PanelProps) {
  const [bitrate, setBitrate] = useState(fromStr(config.video_bitrate, 3.0) / 1000000);
  const [framerate, setFramerate] = useState(fromStr(config.video_fps, 30));

  const updateFramerate = useDebounceCallback(
    (value: number) =>
      api.updateConfig({
        video_fps: `${value}`,
      }),
    DEBOUNCE_TIME
  );

  const updateBitrate = useDebounceCallback(
    (value: number) =>
      api.updateConfig({
        video_bitrate: `${value}`,
      }),
    DEBOUNCE_TIME
  );

  return (
    <div className="Menubar-content">
      <PictureInner config={config} onConfigUpdate={api.updateConfig} />
      <Label>
        Bitrate (Mbps)
        <Slider
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
        <Slider
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
      <Button icon="floppy-disk" text="Save" fill onClick={() => closePanel()} disabled />
    </div>
  );
}

function PictureInner({ config, onConfigUpdate, disabled }: PictureProps) {
  const [whiteBalance, setWhiteBalance] = useState(config.video_wb);
  const [exposure, setExposure] = useState(config.exposure);
  const [contrast, setContrast] = useState(fromStr(config.contrast, 0));
  const [sharpness, setSharpness] = useState(fromStr(config.sharpness, 0));
  const [gain, setGain] = useState(fromStr(config.digitalgain, 0.0));

  const updateConfig = useCallback(onConfigUpdate || ((config: Partial<api.Config>) => {}), [
    onConfigUpdate,
  ]);

  const updateContrast = useDebounceCallback(
    (value: number) => updateConfig({ contrast: `${value}` }),
    DEBOUNCE_TIME
  );

  const updateSharpness = useDebounceCallback(
    (value: number) => updateConfig({ sharpness: `${value}` }),
    DEBOUNCE_TIME
  );

  const updateGain = useDebounceCallback(
    (value: number) => updateConfig({ digitalgain: `${value}` }),
    DEBOUNCE_TIME
  );

  /*
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
          <select
            disabled={disabled}
            value={whiteBalance}
            onChange={(ev) => {
              setWhiteBalance(ev.currentTarget.value);
              updateConfig({ video_wb: ev.currentTarget.value });
            }}
          >
            <option value="off">Off</option>
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
          <select
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
        <Slider
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
        <Slider
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
        <Slider
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
}

function SelectNetwork({ closePanel, setNetwork, ap, setAp }: PanelProps) {
  return (
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
  );
}

export default Menubar;
