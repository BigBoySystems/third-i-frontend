import React, { useState } from "react";
import { Dialog, Menu, MenuItem, Button, Popover, Label } from "@blueprintjs/core";
import "./CaptivePortal.css";

function CaptivePortal() {
  const [networks, setNetworks] = useState([
    {
      essid: "Weyland",
      password: true,
    },
    {
      essid: "CyberCafeDuCoin",
      password: false,
    },
    {
      essid: "Weyland",
      password: true,
    },
    {
      essid: "CyberCafeDuCoin",
      password: false,
    },
    {
      essid: "Weyland",
      password: true,
    },
    {
      essid: "CyberCafeDuCoin",
      password: false,
    },
  ]);

  return (
    <Dialog
      isCloseButtonShown={false}
      isOpen={true}
      className="bp3-dark bp3-large bp3-text-large"
      title={<div>"Captive Portal FTW"</div>}
      icon="globe-network"
    >
      <div className="CaptivePortal-content">
        <div className="CaptivePortal-list">
          <Menu>
            {networks.map(({ essid, password }) =>
              password ? (
                <Popover className="CaptivePortal-popover">
                  <MenuItem icon={password ? "lock" : "unlock"} text={essid} />
                  <PasswordEntry onValidate={(password) => alert(`${essid} : ${password}`)} />
                </Popover>
              ) : (
                <MenuItem
                  icon={password ? "lock" : "unlock"}
                  text={essid}
                  onClick={() => alert(essid)}
                />
              )
            )}
          </Menu>
        </div>
        <div className="CaptivePortal-buttons">
          <Button text="Refresh" />
        </div>
      </div>
    </Dialog>
  );
}

interface PasswordEntryProps {
  onValidate: (value: string) => void;
}

function PasswordEntry({ onValidate }: PasswordEntryProps) {
  return (
    <div className="CaptivePortal-password bp3-large bp3-text-large">
      <Label>
        Password:
        <input
          className="bp3-input"
          type="password"
          placeholder="Type ENTER to validate"
          onKeyUp={(ev) => {
            if (ev.key === "Enter") {
              onValidate(ev.currentTarget.value);
            }
          }}
        />
      </Label>
    </div>
  );
}

export default CaptivePortal;
