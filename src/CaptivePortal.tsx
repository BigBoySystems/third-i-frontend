import React, { useState, useEffect } from "react";
import { Dialog, Menu, MenuItem, Button, Popover, Label, Toaster, Intent } from "@blueprintjs/core";
import "./CaptivePortal.css";
import * as api from "./api";

interface CaptivePortalProps {
  onConnected: () => void;
}

function CaptivePortal({ onConnected }: CaptivePortalProps) {
  const [networks, setNetworks] = useState([] as api.Network[]);
  const [initialized, setInitialized] = useState(false);

  const updateNetworks = () => api.networks().then((x) => setNetworks(x));

  useEffect(() => {
    if (!initialized) {
      updateNetworks();
      setInitialized(true);
    }
  }, [initialized, networks]);

  return (
    <Dialog
      isCloseButtonShown={false}
      isOpen={true}
      className="bp3-dark bp3-large bp3-text-large"
      title={<div>Select network</div>}
      icon="globe-network"
      hasBackdrop={false}
    >
      <div className="CaptivePortal-content">
        <div className="CaptivePortal-list">
          <Menu>
            {networks.map(({ essid, password }) =>
              password ? (
                <Popover className="CaptivePortal-popover">
                  <MenuItem icon={password ? "lock" : "unlock"} text={essid} />
                  <PasswordEntry
                    onValidate={(password) =>
                      api.connect(essid, password).then((res) => {
                        if (res.success) {
                          onConnected();
                        } else {
                          CaptivePortalToaster.show({
                            message: "Could not connect to network.",
                            intent: Intent.WARNING,
                          });
                        }
                      })
                    }
                  />
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
