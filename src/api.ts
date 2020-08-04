export interface Portal {
  portal: boolean;
}

export interface Network {
  essid: string;
  password: boolean;
}

export function isPortal() {
  return fetch("/portal")
    .then((resp) => resp.json())
    .then((json: Portal) => json.portal);
}

export function networks() {
  return fetch("/list-networks").then(
    (resp) => (resp.json() as any) as Network[]
  );
}
