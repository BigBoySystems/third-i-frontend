import React, { useState } from "react";
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

const LIGHTING: any = {
  nightOutside: {
    contrast: 0,
    sharpness: 0,
    gain: 0,
  },
  dayInside: {
    contrast: 1,
    sharpness: 1,
    gain: 1,
  },
  nightInside: {
    contrast: 2,
    sharpness: 2,
    gain: 2,
  },
  dayOutside: {
    contrast: 3,
    sharpness: 3,
    gain: 3,
  },
};

type MenubarProps = PhotoMode & Network;
type PanelProps = IPanelProps & PhotoMode & Network;

interface PictureProps {
  contrast: number;
  setContrast?: React.Dispatch<React.SetStateAction<number>>;
  sharpness: number;
  setSharpness?: React.Dispatch<React.SetStateAction<number>>;
  gain: number;
  setGain?: React.Dispatch<React.SetStateAction<number>>;
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
      <MenuItem icon="headset" text="Audio" disabled />
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

function Display() {
  const [radioCheck, setRadioCheck] = useState("3dFlat");
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

function Streaming() {
  const [browser, setBrowser] = useState(false);
  const [udp, setUdp] = useState(false);
  const [rtmp, setRtmp] = useState(false);
  const [mpeg, setMpeg] = useState(false);
  const [rtsp, setRtsp] = useState(false);

  /*
    const [usb, setUsb] = useState(false);
    <Switch label="USB enabled" checked={usb} onChange={() => setUsb(!usb)} />
  */

  return (
    <div className="Menubar-content">
      <Switch label="Browser stream" checked={browser} onChange={() => setBrowser(!browser)} />
      <Label>
        Stream UDP
        <ControlGroup>
          <Switch checked={udp} onChange={() => setUdp(!udp)} />
          <InputGroup placeholder="Client addresses" fill />
        </ControlGroup>
      </Label>
      <Label>
        RTMP
        <ControlGroup>
          <Switch checked={rtmp} onChange={() => setRtmp(!rtmp)} />
          <InputGroup placeholder="URL" fill />
        </ControlGroup>
      </Label>
      <Label>
        MPEG-TS
        <ControlGroup>
          <Switch checked={mpeg} onChange={() => setMpeg(!mpeg)} />
          <InputGroup placeholder="Clients addresses" fill />
        </ControlGroup>
      </Label>
      <Switch label="RTSP enabled" checked={rtsp} onChange={() => setRtsp(!rtsp)} />
    </div>
  );
}

function Lighting() {
  const [radioCheck, setRadioCheck] = useState("nightOutside");
  const [contrast, setContrast] = useState(0);
  const [sharpness, setSharpness] = useState(0);
  const [gain, setGain] = useState(0.0);

  return (
    <div className="Menubar-content">
      <RadioGroup
        onChange={(event) => {
          const value = event.currentTarget.value;
          const settings = LIGHTING[value];

          setRadioCheck(value);
          setContrast(settings.contrast);
          setSharpness(settings.sharpness);
          setGain(settings.gain);
        }}
        selectedValue={radioCheck}
      >
        <Radio label="Night outside" value="nightOutside" />
        <Radio label="Day inside" value="dayInside" />
        <Radio label="Night inside" value="nightInside" />
        <Radio label="Day outside" value="dayOutside" />
      </RadioGroup>
      <PictureInner contrast={contrast} sharpness={sharpness} gain={gain} disabled />
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
          text="Wifi-settings"
          onClick={() => openPanel({ component: SelectNetwork, props, title: "Wifi settings" })}
        />
      </Menu>
      <MenuDivider />
      <Button icon="wrench" text="Factory reset" fill />
      <Button icon="updated" text="Update" fill disabled />
    </div>
  );
}

function Picture({ closePanel }: PanelProps) {
  const [contrast, setContrast] = useState(0);
  const [sharpness, setSharpness] = useState(0);
  const [gain, setGain] = useState(0.0);
  const [bitrate, setBitrate] = useState(30);
  const [framerate, setFramerate] = useState(30);

  return (
    <div className="Menubar-content">
      <PictureInner
        contrast={contrast}
        setContrast={setContrast}
        sharpness={sharpness}
        setSharpness={setSharpness}
        gain={gain}
        setGain={setGain}
      />
      <Label>
        Bitrate (Mbps)
        <Slider
          min={5}
          max={100}
          stepSize={5}
          labelStepSize={25}
          value={bitrate}
          showTrackFill={false}
          onChange={setBitrate}
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
          onChange={setFramerate}
        />
      </Label>
      <Button icon="floppy-disk" text="Save" fill onClick={() => closePanel()} disabled />
    </div>
  );
}

function PictureInner({
  contrast,
  setContrast,
  sharpness,
  setSharpness,
  gain,
  setGain,
  disabled,
}: PictureProps) {
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
          <select>
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
          <select>
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
          onChange={setContrast}
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
          onChange={setSharpness}
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
          onChange={setGain}
          disabled={disabled}
        />
      </Label>
    </div>
  );
}

function SelectNetwork({ closePanel, setNetwork }: PanelProps) {
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
      vertical
    />
  );
}

export default Menubar;
