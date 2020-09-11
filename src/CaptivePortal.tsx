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

interface CaptivePortalProps { // declare the props CaptivePortal needs
  onConnected: (essid: string) => void;
  onAP: () => void;
  vertical?: boolean;
  ap: boolean;
  setAp: (value: boolean) => void;
}

function CaptivePortal(props: CaptivePortalProps) { // component of the captive portal when is on MockApi mode 
  return (
    <MockApi.Consumer>
      {(mockApi) => <CaptivePortalInner mockApi={mockApi} {...props} />}
    </MockApi.Consumer>
  );
}

function CaptivePortalInner({ // inner of the captive portal when you are not in mockApi mode
  onConnected,
  onAP,
  vertical,
  mockApi,
  ap,
  setAp,
}: CaptivePortalProps & MockApi) {
  const [networks, setNetworks] = useState([] as api.Network[]);
  const [initialized, setInitialized] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(false);

  const updateNetworks = useCallback(() => { // update the network list the user can connect to
    setNetworks([]);
    setError(false);
    if (mockApi) { // in mockApi mode
      setTimeout(() => setNetworks(SAMPLE_NETWORKS), 1500);
    } else { // when you are not in mockApi mode
      api 
        .networks()
        .then((networks) => {
          networks.sort((a, b) => (a.essid < b.essid ? -1 : 1));
          setNetworks(networks);
          if (networks.length === 0 && !connecting) {
            setTimeout(updateNetworks, 1000);
          }
        })
        .catch((err) => {
          console.log(err);
          setError(true);
        });
    }
  }, [mockApi, connecting]);

  const onFailure = (essid: string) => { // handling possible error of connection
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

  const waitConnected = async (waitDisconnected?: boolean): Promise<api.Portal> => { // handling when you are waiting to connect the device to a new network
    let res: api.Portal = { portal: true, essid: null };
    let connected = waitDisconnected ? true : false;
    do {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        res = await api.isPortal();
        connected = true;
      } catch (err) {
        connected = false;
      }
    } while (waitDisconnected ? connected : !connected);
    return res;
  };

  const waitDisconnected = async (): Promise<api.Portal> => await waitConnected(true);

  const connect = async (essid: string, password?: string) => { // handling when you can connect to a network
    setConnecting(true);
    setError(false);
    setNetworks([]);

    try {
      if (!mockApi) {
        const res = await api.connect(essid, password);
        if (!res.success) {
          throw new Error(res?.reason || "API call failed");
        }
      }

      if (!mockApi && process.env.NODE_ENV !== "development") {
        await waitDisconnected();
      }

      CaptivePortalToaster.show({
        message: (
          <div>
            <p>The Third-I device is now connecting to "{essid}".</p>
            <p>Please now connect your computer (or mobile device) to the same WiFi network.</p>
            <ul>
              <li>
                If the connection works, this message should disappear by itself after your computer
                (or mobile device) gets connected to the WiFi network.
              </li>
              <li>
                If the connection failed, you will see the WiFi network "Third-I" reappearing in the
                list of available WiFi.
              </li>
            </ul>
            <p>
              <strong>Note:</strong> you should be able to connect to the Third-I device on the same
              URL if you are connected on the same WiFi network. You might want to refresh this page
              if you encounter difficulties.
            </p>
          </div>
        ),
        intent: Intent.SUCCESS,
        timeout: 0,
      });

      let portalInfo = undefined;
      if (!mockApi) {
        portalInfo = await waitConnected();
      } else {
        await new Promise((resolve) => setTimeout(resolve, 5000));

        if (essid.startsWith("Ted")) {
          portalInfo = {
            portal: true,
            network: null,
          };
        } else {
          portalInfo = {
            portalInfo: false,
            network: essid,
          };
        }
      }
      CaptivePortalToaster.clear();
      setConnecting(false);

      if (!portalInfo.portal) {
        setAp(false);
        onConnected(essid);
      } else {
        onFailure(essid);
      }
    } catch (err) {
      CaptivePortalToaster.show({
        message: (
          <div>
            <p>An error occured.</p>
            <p>Please try again.</p>
          </div>
        ),
        intent: Intent.DANGER,
        timeout: 10000,
      });

      console.log(err);
      setError(true);
      setConnecting(false);
    }
  };

  const startAp = async () => { // starting in access point when you want a device connect to the third-i
    if (ap) {
      onAP();
      return;
    }

    setConnecting(true);
    setError(false);
    setNetworks([]);

    try {
      if (!mockApi) {
        await api.startAp();
      }

      if (!mockApi && process.env.NODE_ENV !== "development") {
        await waitDisconnected();
      }

      CaptivePortalToaster.show({
        message: (
          <div>
            <p>The Third-I device is now using its own WiFi network.</p>
            <p>Please now connect your computer (or mobile device) to the Third-I WiFi network.</p>
            <p>
              When the access point is ready, this message should disappear by itself after your
              computer (or mobile device) gets connected to the Third-I WiFi network.
            </p>
            <p>
              <strong>Note:</strong> you should be able to connect to the Third-I device on the same
              URL if you are connected on the same WiFi network. You might want to refresh this page
              if you encounter difficulties.
            </p>
          </div>
        ),
        intent: Intent.SUCCESS,
        timeout: 0,
      });

      if (!mockApi) {
        await waitConnected();
      } else {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        // NOTE: uncomment this to simulate an error
        //throw new Error("boo");
      }

      CaptivePortalToaster.clear();
      setConnecting(false);
      setAp(true);
      onAP();
    } catch (err) {
      CaptivePortalToaster.show({
        message: (
          <div>
            <p>An error occured.</p>
            <p>Please try again.</p>
          </div>
        ),
        intent: Intent.DANGER,
        timeout: 10000,
      });

      console.log(err);
      setError(true);
      setConnecting(false);
    }
  };

  useEffect(() => { // initialize the captive portal and retrieve network nearby
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
          <Button text="Use access point" onClick={startAp} />
          <Button text="Refresh" onClick={updateNetworks} />
        </ButtonGroup>
      </div>
    </div>
  );
}

interface PasswordEntryProps {
  onValidate: (value: string) => void;
}

function PasswordEntry({ onValidate }: PasswordEntryProps) { // management of the password user give to connect to a network
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

function HiddenNetwork({ onValidate }: HiddenNetworkProps) { // management of the case the network is hidden but you know information for connecting to it
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

const SAMPLE_NETWORKS: api.Network[] = [ // mockApi network sample
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
