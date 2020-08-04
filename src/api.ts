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

export function isPortal() {
  return fetch("/portal")
    .then((resp) => resp.json())
    .then((json: Portal) => json.portal);
}

export function networks() {
  return fetch("/list-networks").then((resp) => (resp.json() as any) as Network[]);
}

export function connect(essid: string, password?: string) {
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
  }).then((resp) => (resp.json() as any) as Connect);
}
