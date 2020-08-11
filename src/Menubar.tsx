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
  Icon,
  Label,
  Slider,
  Button,
  InputGroup,
  ControlGroup,
} from "@blueprintjs/core";
import { PhotoMode } from "./App";

function Menubar({ setPhotoMode, photoMode }: PhotoMode) {
  const [panels, setPanels] = useState<(IPanel<PhotoMode> | IPanel)[]>([
    {
      component: Settings,
      props: {
        photoMode,
        setPhotoMode,
      },
      title: "Settings",
    },
  ]);

  return (
    <PanelStack
      className="Menubar"
      initialPanel={panels[0]}
      onOpen={(new_) => setPanels([new_, ...panels])}
      onClose={() => setPanels(panels.slice(1))}
    />
  );
}

function Settings({ openPanel, photoMode, setPhotoMode }: IPanelProps & PhotoMode) {
  const [viewAngleSquare, setViewAngleSquare] = useState(false);

  return (
    <Menu>
      <MenuItem
        icon="desktop"
        text="Display"
        onClick={() => openPanel({ component: Display, title: "Display" })}
      />
      <MenuItem
        icon="camera"
        text="Photo/Video mode"
        labelElement={<Icon icon={photoMode ? "media" : "mobile-video"} />}
        onClick={() => setPhotoMode(!photoMode)}
      />
      <MenuItem
        icon="mobile-video"
        text="Streaming settings"
        onClick={() => openPanel({ component: Streaming, title: "Streaming settings" })}
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
        onClick={() => openPanel({ component: Lightning, title: "Lighting" })}
      />
      <MenuDivider />
      <MenuItem
        icon="cog"
        text="Advanced parameters"
        onClick={() => openPanel({ component: Advanced, title: "Advanced parameters" })}
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
        <Radio label="3D distorted" value="3dDistorted" />
        <Radio label="2D left only" value="2dLeftOnly" />
        <Radio label="2D right only" value="2dRightOnly" />
        <Radio label="Anaglyph" value="anaglyph" />
      </RadioGroup>
      <Switch label="Inverted" checked={inverted} onChange={() => setInverted(!inverted)} />
      <Switch label="Flipped" checked={flipped} onChange={() => setFlipped(!flipped)} />
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

function Lightning() {
  const [radioCheck, setRadioCheck] = useState("nightOutside");

  return (
    <div className="Menubar-content">
      <RadioGroup
        onChange={(event) => setRadioCheck(event.currentTarget.value)}
        selectedValue={radioCheck}
      >
        <Radio label="Night outside" value="nightOutside" />
        <Radio label="Day inside" value="dayInside" />
        <Radio label="Night inside" value="nightInside" />
        <Radio label="Day outside" value="dayOutside" />
      </RadioGroup>
    </div>
  );
}

function Advanced({ openPanel }: IPanelProps) {
  /*
      <MenuItem icon="refresh" text="Loop record" />
      <MenuItem icon="power" text="Auto shut off" />
      <MenuItem icon="lock" text="Auto standby" />
      <MenuItem icon="time" text="Timer" />
  */
  return (
    <div className="Menubar-content">
      <Menu>
        <MenuItem
          icon="media"
          text="Video settings"
          onClick={() => openPanel({ component: Picture, title: "Video settings" })}
        />
        <MenuItem
          icon="globe-network"
          text="Wifi-settings"
          onClick={() => openPanel({ component: SelectNetwork, title: "Wifi settings" })}
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
  const [bitrate, setBitrate] = useState(3000000);
  const [framerate, setFramerate] = useState(30);

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
            onChange={(x) => setContrast(x)}
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
            onChange={(x) => setSharpness(x)}
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
            onChange={(x) => setGain(x)}
          />
        </Label>
        <Label>
          Bitrate (Mbps)
          <Slider
            min={5}
            max={100}
            stepSize={5}
            labelStepSize={25}
            value={bitrate / 100000}
            showTrackFill={false}
            onChange={(x) => setBitrate(x * 100000)}
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
            onChange={(x) => setFramerate(x)}
          />
        </Label>
      </Menu>
    </div>
  );
}

function SelectNetwork({ closePanel }: IPanelProps) {
  return <CaptivePortal onConnected={() => closePanel()} />;
}

export default Menubar;
