export interface Portal {
  portal: boolean;
}

export interface Network {
  essid: string;
  password: boolean;
}

export interface Connect {
  success: boolean;
}

export interface Storage {
  used: number;
  total: number;
}

export interface File {
  name: string;
  preview?: string;
  download?: string;
  rename?: string;
  delete?: string;
  directory: boolean;
  children: File[];
}

export function isPortal() {
  return fetch("/portal")
    .then((resp) => resp.json())
    .then((json: Portal) => json.portal);
}

export function networks(): Promise<Network[]> {
  return fetch("/list-networks").then((resp) => resp.json());
}

export function connect(essid: string, password?: string): Promise<Connect> {
  const data = {
    essid,
    password,
  };

  return fetch("/connect", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(data),
  }).then((resp) => resp.json());
}

export function startAp(): Promise<any> {
  const data = {};

  return fetch("/start-ap", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(data),
  });
}
