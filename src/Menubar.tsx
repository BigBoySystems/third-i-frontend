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
      <MenuItem icon="desktop" text="3D flat" />
      <MenuItem icon="fullscreen" text="2D left only" />
      <MenuItem icon="fullscreen" text="2D right only" />
    </Menu>
  );
}

export default Menubar;
