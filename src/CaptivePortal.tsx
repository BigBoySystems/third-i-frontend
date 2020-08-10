import React, { useState, useEffect } from "react";
import {
  Dialog,
  Menu,
  MenuItem,
  Button,
  Popover,
  Label,
  Toaster,
  Intent,
  Overlay,
  Spinner,
} from "@blueprintjs/core";
import "./CaptivePortal.css";
import * as api from "./api";

interface CaptivePortalProps {
  onConnected: () => void;
  dialogOpen: boolean;
  setDialogOpen: (value: boolean) => void;
}

function CaptivePortal({ onConnected, dialogOpen, setDialogOpen }: CaptivePortalProps) {
  const [networks, setNetworks] = useState([] as api.Network[]);
  const [initialized, setInitialized] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const updateNetworks = () => {
    setNetworks([]);
    api.networks().then((x) => setNetworks(x));
  };

  const connect = (essid: string, password: string) => {
    setConnecting(true);
    setNetworks([]);

    api.connect(essid, password).then((res) => {
      setConnecting(false);

      if (res.success) {
        onConnected();
      } else {
        CaptivePortalToaster.show({
          message: `Could not connect to "${essid}".`,
          intent: Intent.WARNING,
          timeout: 10000,
        });
        updateNetworks();
      }
    });
  };

  useEffect(() => {
    if (!initialized) {
      updateNetworks();
      setInitialized(true);
    }
  }, [initialized, networks]);

  return (
    <Dialog
      isOpen={dialogOpen}
      onClose={(dialogOpen) => setDialogOpen(false)}
      className="bp3-dark bp3-large bp3-text-large"
      title={<div>Select network</div>}
      icon="globe-network"
      hasBackdrop={false}
    >
      <Overlay isOpen={connecting}>
        <Spinner size={Spinner.SIZE_LARGE} className="CaptivePortal-spinner" />
      </Overlay>
      <div className="CaptivePortal-content">
        <div className="CaptivePortal-list">
          <Menu>
            {networks.length === 0 && <MenuItem icon="refresh" text="Loading..." disabled />}
            {networks.map(({ essid, password }) =>
              password ? (
                <Popover className="CaptivePortal-popover" position="left" key={essid}>
                  <MenuItem icon={password ? "lock" : "unlock"} text={essid} />
                  <PasswordEntry onValidate={(password) => connect(essid, password)} />
                </Popover>
              ) : (
                <MenuItem
                  key={essid}
                  icon={password ? "lock" : "unlock"}
                  text={essid}
                  onClick={() => alert(essid)}
                />
              )
            )}
          </Menu>
        </div>
        <div className="CaptivePortal-buttons">
          <Button text="Refresh" onClick={updateNetworks} />
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
          autoFocus
        />
      </Label>
    </div>
  );
}

const CaptivePortalToaster = Toaster.create({});

export default CaptivePortal;
