import React from "react";
import "./Menubar.css";
import { Menu, MenuItem, MenuDivider, Classes } from "@blueprintjs/core";

function Menubar() {
  return (
    <Menu className={Classes.ELEVATION_1}>
      <MenuItem icon="settings" text="Settings...">
        <MenuItem icon="desktop" text="Display" />
        <MenuItem icon="fullscreen" text="Resolution" />
        <MenuDivider />
        <MenuItem icon="cog" text="Advanced parameters" />
      </MenuItem>
    </Menu>
  );
}

export default Menubar;
