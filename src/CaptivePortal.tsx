import React, { useState, useEffect, useCallback } from "react";
import {
  Menu,
  MenuItem,
  Button,
  Popover,
  Label,
  Toaster,
  Intent,
  Overlay,
  Spinner,
  ButtonGroup,
} from "@blueprintjs/core";
import "./CaptivePortal.css";
import * as api from "./api";
import { MockApi } from "./App";

interface CaptivePortalProps {
  onConnected: (essid: string) => void;
  onAP: () => void;
  vertical?: boolean;
}

function CaptivePortal(props: CaptivePortalProps) {
  return (
    <MockApi.Consumer>
      {(mockApi) => <CaptivePortalInner mockApi={mockApi} {...props} />}
    </MockApi.Consumer>
  );
}

function CaptivePortalInner({
  onConnected,
  onAP,
  vertical,
  mockApi,
}: CaptivePortalProps & MockApi) {
  const [networks, setNetworks] = useState([] as api.Network[]);
  const [initialized, setInitialized] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(false);

  const updateNetworks = useCallback(() => {
    setNetworks([]);
    setError(false);
    if (mockApi) {
      setTimeout(() => setNetworks(SAMPLE_NETWORKS), 1500);
    } else {
      api
        .networks()
        .then((x) => setNetworks(x))
        .catch((err) => {
          console.log(err);
          setError(true);
        });
    }
  }, [mockApi]);

  const onFailure = (essid: string) => {
    CaptivePortalToaster.show({
      message: (
        <div>
          <p>Could not connect to "{essid}".</p>
          <p>
            Please check that the password is correct. If the problem persists, please contact the
            network administrator.
          </p>
        </div>
      ),
      intent: Intent.WARNING,
      timeout: 10000,
    });
    updateNetworks();
  };

  const waitConnected = async (waitDisconnected?: boolean) => {
    let connected = waitDisconnected ? true : false;
    do {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await api.isPortal();
        connected = true;
      } catch (err) {
        connected = false;
      }
    } while (waitDisconnected ? connected : !connected);
  };

  const waitDisconnected = async () => await waitConnected(true);

  const connect = async (essid: string, password?: string) => {
    setConnecting(true);
    setError(false);
    setNetworks([]);

    if (mockApi) {
      setTimeout(() => {
        setConnecting(false);

        if (essid.startsWith("Ted")) {
          onFailure(essid);
        } else {
          onConnected(essid);
        }
      }, 1500);
    } else {
      try {
        const res = await api.connect(essid, password);
        if (res.success) {
          CaptivePortalToaster.show({
            message: (
              <div>
                <p>The Third-I device is now connected to "{essid}".</p>
                <p>Please now connect your computer (or mobile device) to the same network.</p>
              </div>
            ),
            intent: Intent.SUCCESS,
            timeout: 0,
          });

          await waitDisconnected();
          await waitConnected();

          CaptivePortalToaster.clear();
          setConnecting(false);
          onConnected(essid);
        } else {
          setConnecting(false);
          onFailure(essid);
        }
      } catch (err) {
        console.log(err);
        setError(true);
        setConnecting(false);
      }
    }
  };

  useEffect(() => {
    if (!initialized) {
      updateNetworks();
      setInitialized(true);
    }
  }, [initialized, updateNetworks]);

  return (
    <div className="CaptivePortal-content">
      <Overlay isOpen={connecting}>
        <Spinner size={Spinner.SIZE_LARGE} className="CaptivePortal-spinner" />
      </Overlay>
      <div className="CaptivePortal-list">
        <Menu>
          {networks.length === 0 && (
            <MenuItem
              icon="refresh"
              text={error ? "An error occurred" : "No network detected"}
              disabled
            />
          )}
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
                onClick={() => connect(essid)}
              />
            )
          )}
        </Menu>
      </div>
      <div className="CaptivePortal-buttons">
        <ButtonGroup vertical={vertical} fill>
          <Popover className="CaptivePortal-popover" position="left">
            <Button text="Hidden network..." />
            <HiddenNetwork onValidate={(essid, password) => connect(essid, password)} />
          </Popover>
          <Button
            text="Use access point"
            onClick={() => {
              api.startAp();
              onAP();
            }}
          />
          <Button text="Refresh" onClick={updateNetworks} />
        </ButtonGroup>
      </div>
    </div>
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

interface HiddenNetworkProps {
  onValidate: (essid: string, password: string) => void;
}

function HiddenNetwork({ onValidate }: HiddenNetworkProps) {
  const [essid, setEssid] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="CaptivePortal-password bp3-large bp3-text-large">
      <Label>
        ESSID:
        <input
          className="bp3-input"
          placeholder="Type ENTER to validate"
          value={essid}
          onChange={(ev) => setEssid(ev.currentTarget.value)}
          onKeyUp={(ev) => {
            if (ev.key === "Enter") {
              onValidate(ev.currentTarget.value, password as string);
            }
          }}
          autoFocus
        />
      </Label>
      <Label>
        Password:
        <input
          className="bp3-input"
          type="password"
          placeholder="Type ENTER to validate"
          value={password}
          onChange={(ev) => setPassword(ev.currentTarget.value)}
          onKeyUp={(ev) => {
            if (ev.key === "Enter") {
              onValidate(essid, ev.currentTarget.value);
            }
          }}
        />
      </Label>
    </div>
  );
}

const CaptivePortalToaster = Toaster.create({});

const SAMPLE_NETWORKS: api.Network[] = [
  {
    essid: "MYHOME",
    password: true,
  },
  {
    essid: "eCafe",
    password: false,
  },
  {
    essid: "Ted's network (password will be invalid)",
    password: true,
  },
];

export default CaptivePortal;
