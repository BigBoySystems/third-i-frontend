import React, { useState } from "react";
import "./Menubar.css";
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
} from "@blueprintjs/core";

function Menubar() {
  const [panels, setPanels] = useState<IPanel[]>([
    {
      component: MenubarRoot,
      props: {},
      title: "Menu",
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

function MenubarRoot({ openPanel }: IPanelProps) {
  return (
    <Menu>
      <MenuItem
        icon="settings"
        text="Settings..."
        onClick={() => openPanel({ component: MenubarSettings, title: "Settings" })}
      />
    </Menu>
  );
}

function MenubarSettings({ openPanel }: IPanelProps) {
  const [photoMode, setPhotoMode] = useState(false);

  return (
    <Menu>
      <MenuItem
        icon="desktop"
        text="Display"
        onClick={() => openPanel({ component: MenubarDisplay, title: "Display" })}
      />
      <MenuItem
        icon="camera"
        text="Photo/Video mode"
        labelElement={<Icon icon={photoMode ? "media" : "mobile-video"} />}
        onClick={() => setPhotoMode(!photoMode)}
      />
      <MenuItem icon="mobile-video" text="Streaming settings" />
      <MenuItem icon="headset" text="Audio settings" />
      <MenuItem
        icon="square"
        text="Viewing angle"
        onClick={() => openPanel({ component: MenubarAngle, title: "Viewing angle" })}
      />
      <MenuItem
        icon="lightbulb"
        text="Lighting"
        onClick={() => openPanel({ component: MenubarLightning, title: "Lighting" })}
      />
      <MenuDivider />
      <MenuItem
        icon="cog"
        text="Advanced parameters"
        onClick={() => openPanel({ component: MenuAdvanced, title: "Advanced parameters" })}
      />
    </Menu>
  );
}

function MenubarDisplay() {
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
        <Radio label="3D distored" value="3dDistored" />
        <Radio label="2D left only" value="2dLeftOnly" />
        <Radio label="2D right only" value="2dRightOnly" />
        <Radio label="Anaglyph" value="anaglyph" />
      </RadioGroup>
      <Switch label="Inverted" checked={inverted} onChange={() => setInverted(!inverted)} />
      <Switch label="Flipped" checked={flipped} onChange={() => setFlipped(!flipped)} />
    </div>
  );
}

function MenubarAngle() {
  const [radioCheck, setRadioCheck] = useState("extended");

  return (
    <div className="Menubar-content">
      <RadioGroup
        onChange={(event) => setRadioCheck(event.currentTarget.value)}
        selectedValue={radioCheck}
      >
        <Radio label="Extended" value="extended" />
        <Radio label="Square" value="square" />
      </RadioGroup>
    </div>
  );
}

function MenubarLightning() {
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

function MenuAdvanced({ openPanel }: IPanelProps) {
  const [framerate, setFramerate] = useState(30);

  /*
      <MenuItem icon="refresh" text="Loop record" />

      <MenuItem icon="globe-network" text="Wifi settings" />
      <MenuItem icon="power" text="Auto shut off" />
      <MenuItem icon="lock" text="Auto standby" />
      <MenuItem icon="time" text="Timer" />
  */
  return (
    <div className="Menubar-content">
      <Label>
        Framerate
        <Slider
          min={25}
          max={60}
          stepSize={1}
          labelStepSize={5}
          value={framerate}
          onChange={(x) => setFramerate(x)}
        />
      </Label>
       <MenuItem
        icon="media"
        text="Video settings"
        onClick={() => openPanel({ component: MenuPicture, title: "Video settings" })}
      />
      <MenuDivider />
      <Button icon="wrench" text="Factory reset" fill />
      <Button icon="updated" text="Update" fill />
    </div>
  );
}

function MenuPicture() {
  const [contrast, setContrast] = useState(0);
  const [sharpness, setSharpness] = useState(0);
  const [gain, setGain] = useState(0.0);
  const [bitrate, setBitrate] = useState(5000000);
  
  return (
    <div className="Menubar-content">
        <MenuItem icon="wrench" text="WB" />
        <MenuItem icon="flash" text="Exposure" />
        <Label>
          Contrast
          <Slider 
            min={-50}
            max={100}
            stepSize={1}
            labelStepSize={10}
            value={contrast}
            onChange={(x) => setContrast(x)}
          />
        </Label>
        <Label>
          Sharpness
          <Slider 
            min={-50}
            max={100}
            stepSize={1}
            labelStepSize={10}
            value={sharpness}
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
            onChange={(x) => setGain(x)}
          />
        </Label>
        <Label>
          Bitrate (x100 000)
          <Slider 
            min={5}
            max={100}
            stepSize={5}
            labelStepSize={25}
            value={bitrate}
            onChange={(x) => setBitrate(x)}
          />
        </Label>
    </div>
  );
}

export default Menubar;
