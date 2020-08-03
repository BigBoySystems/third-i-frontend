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
  return (
    <Menu>
      <MenuItem
        icon="desktop"
        text="Display"
        onClick={() => openPanel({ component: MenubarDisplay, title: "Display" })}
      />
      <MenuItem icon="fullscreen" text="Resolution" />
      <MenuItem icon="camera" text="Photo/Video mode" />
      <MenuItem icon="mobile-video" text="Streaming settings" />
      <MenuItem icon="headset" text="Audio settings" />
      <MenuItem
        icon="square"
        text="Viewing angle"
        onClick={() => openPanel({ component: MenubarAngle, title: "Viewing angle" })}
      />
      <MenuItem
        icon="lightbulb"
        text="Lightning"
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
  return (
    <Menu>
      <MenuItem icon="refresh" text="Loop record" />
      <MenuItem icon="dashboard" text="Framerate" />
      <MenuItem icon="globe-network" text="Wifi settings" />
      <MenuItem icon="power" text="Auto shut off" />
      <MenuItem icon="lock" text="Auto standby" />
      <MenuItem icon="time" text="Timer" />
      <MenuItem
        icon="media"
        text="Picture settings"
        onClick={() => openPanel({ component: MenuPicture, title: "Picture settings" })}
      />
      <MenuItem icon="pulse" text="Bitrate" />
      <MenuItem icon="wrench" text="Factory reset" />
      <MenuItem icon="updated" text="Update" />
    </Menu>
  );
}

function MenuPicture() {
  return (
    <Menu>
      <MenuItem icon="wrench" text="WB" />
      <MenuItem icon="flash" text="Exposure" />
      <MenuItem icon="contrast" text="Contrast" />
      <MenuItem icon="delta" text="Sharpness" />
      <MenuItem icon="pivot-table" text="Stabilization" />
      <MenuItem icon="cell-tower" text="Av gain" />
    </Menu>
  );
}

export default Menubar;
