import React, { useState } from "react";
import "./Menubar.css";
import { Menu, MenuItem, MenuDivider, PanelStack } from "@blueprintjs/core";

function Menubar() {
  const [panels, setPanels] = useState([
    {
      component: MenubarRoot,
      props: {},
      title: "Menu",
    } as any,
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

function MenubarRoot({ openPanel }: any) {
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

function MenubarSettings() {
  return (
    <Menu>
      <MenuItem icon="desktop" text="Display" />
      <MenuItem icon="fullscreen" text="Resolution" />
      <MenuDivider />
      <MenuItem icon="cog" text="Advanced parameters" />
    </Menu>
  );
}

export default Menubar;
