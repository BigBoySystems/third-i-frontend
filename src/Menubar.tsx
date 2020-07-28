import React from "react";
import "./Menubar.css";
import { Menu, MenuItem, Icon, MenuDivider, Classes } from "@blueprintjs/core";

function Menubar() {
  return (
    <div className="Menubar">
      <Menu className={Classes.ELEVATION_1}>
        <MenuItem icon="new-text-box" text="New text box" />
        <MenuItem icon="new-object" text="New object" />
        <MenuItem icon="new-link" text="New link" />
        <MenuDivider />
        <MenuItem
          icon="cog"
          labelElement={<Icon icon="share" />}
          text="Settings..."
        />
      </Menu>
    </div>
  );
}

export default Menubar;
