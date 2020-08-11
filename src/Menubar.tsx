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

const LIGHTING: any = {
  nightOutside: {
    contrast: 0,
    sharpness: 0,
    gain: 0,
    bitrate: 30,
    framerate: 30,
  },
  dayInside: {
    contrast: 1,
    sharpness: 1,
    gain: 1,
    bitrate: 31,
    framerate: 31,
  },
  nightInside: {
    contrast: 2,
    sharpness: 2,
    gain: 2,
    bitrate: 32,
    framerate: 32,
  },
  dayOutside: {
    contrast: 3,
    sharpness: 3,
    gain: 3,
    bitrate: 33,
    framerate: 33,
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
  bitrate: number;
  setBitrate?: React.Dispatch<React.SetStateAction<number>>;
  framerate: number;
  setFramerate?: React.Dispatch<React.SetStateAction<number>>;
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
      <MenuItem icon="headset" text="Audio settings" />
      <MenuItem
        icon="square"
        text="Viewing angle"
        labelElement={viewAngleSquare ? "Square" : "Extended"}
        onClick={() => setViewAngleSquare(!viewAngleSquare)}
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

  return (
    <div className="Menubar-content">
      <RadioGroup
        onChange={(event) => setRadioCheck(event.currentTarget.value)}
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
  const [bitrate, setBitrate] = useState(30);
  const [framerate, setFramerate] = useState(30);

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
          setBitrate(settings.bitrate);
          setFramerate(settings.framerate);
        }}
        selectedValue={radioCheck}
      >
        <Radio label="Night outside" value="nightOutside" />
        <Radio label="Day inside" value="dayInside" />
        <Radio label="Night inside" value="nightInside" />
        <Radio label="Day outside" value="dayOutside" />
      </RadioGroup>
      <PictureInner
        contrast={contrast}
        sharpness={sharpness}
        gain={gain}
        bitrate={bitrate}
        framerate={framerate}
        disabled
      />
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

function Picture() {
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
        bitrate={bitrate}
        setBitrate={setBitrate}
        framerate={framerate}
        setFramerate={setFramerate}
      />
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
  bitrate,
  setBitrate,
  framerate,
  setFramerate,
  disabled,
}: PictureProps) {
  return (
    <div className="Menubar-content">
      <Menu>
        <Label>
          White balance
          <select>
            <option>Off</option>
            <option>Auto</option>
            <option>Sun</option>
            <option>Cloud</option>
            <option>Shade</option>
            <option>Tungsten</option>
            <option>Fluorescent</option>
            <option>Incandescent</option>
            <option>Flash</option>
            <option>Horizon</option>
          </select>
        </Label>
        <Label>
          Exposure
          <select>
            <option>Off</option>
            <option>Auto</option>
            <option>Night</option>
            <option>Nightpreview</option>
            <option>Backlight</option>
            <option>Spotlight</option>
            <option>Sports</option>
            <option>Snow</option>
            <option>Beach</option>
            <option>Verylong</option>
            <option>Fixedfps</option>
            <option>Antishake</option>
            <option>Fireworks</option>
          </select>
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
        <MenuItem icon="pivot-table" text="Stabilization" />
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
            disabled={disabled}
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
            disabled={disabled}
          />
        </Label>
      </Menu>
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
    />
  );
}

export default Menubar;
