import React, { useState } from "react";
import "./Menubar.css";
import {
  Menu,
  MenuItem,
  MenuDivider,
  PanelStack,
  IPanel,
  IPanelProps,
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
        onClick={() =>
          openPanel({ component: MenubarSettings, title: "Settings" })
        }
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
        onClick={() =>
          openPanel({ component: MenubarDisplay, title: "Display" })
        }
      />
      <MenuItem icon="fullscreen" text="Resolution" />
      <MenuItem icon="camera" text="Photo/Video Mode" />
      <MenuItem icon="mobile-video" text="Streaming settings" />
      <MenuItem icon="headset" text="Audio settings" />
      <MenuItem
        icon="square"
        text="Viewing Angle"
        onClick={() =>
          openPanel({ component: MenubarAngle, title: "Viewing Angle"})
        }
        />
      <MenuItem
        icon="lightbulb"
        text="Lightning"
        onClick={() =>
          openPanel({ component: MenuLightning, title: "Lighting"})
        }
        />
      <MenuDivider />
      <MenuItem icon="cog" text="Advanced parameters" />
    </Menu>
  );
}

function MenubarDisplay() {
  return (
    <Menu>
      <MenuItem icon="arrows-horizontal" text="3D flat" />
      <MenuItem icon="double-caret-horizontal" text="3D distored" />
      <MenuItem icon="arrow-left" text="2D left only" />
      <MenuItem icon="arrow-right" text="2D right only" />
      <MenuItem icon="group-objects" text="Anaglyph" />
      <MenuItem icon="swap-horizontal" text="Inverted" />
      <MenuItem icon="swap-vertical" text="Flipped" />
    </Menu>
  );
}

function MenubarAngle() {
  return (
    <Menu>
      <MenuItem icon="split-columns" text="Extended" />
      <MenuItem icon="merge-columns" text="Square" />
      <MenuItem icon="column-layout" text="Custom" />
    </Menu>
  );
}

function MenuLightning() {
  return (
    <Menu>
      <MenuItem icon="moon" text="Night outside" />
      <MenuItem icon="lightbulb" text="Day inside" />
      <MenuItem icon="torch" text="Night inside" />
      <MenuItem icon="flash" text="Day outside" />
    </Menu>
  );
}

export default Menubar;
