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

export default Menubar;
