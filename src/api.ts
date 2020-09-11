const API_PREFIX = process.env.NODE_ENV === "development" ? "" : "/api";

export interface Portal {
  // implement if you are in portal mode or not
  portal: boolean;
  essid: string | null;
}

export interface Network {
  // implement the network you are connected to
  essid: string;
  password: boolean;
}

export interface Response {
  // implement the api response
  success: boolean;
  reason?: string;
}

export interface Connect extends Response {}

export interface RenameFile extends Response {
  file: File;
}

export interface Storage {
  // retrieve the disk usage of the Third-i
  used: number;
  total: number;
}

export interface File {
  // retrieve the file you will use in the Filemanager
  name: string;
  path: string;
  url: string;
  directory: boolean;
  children: File[];
}

export interface Config {
  // retrieve the configuration file
  photo_resolution: string;
  video_width: string;
  video_mode: string;
  video_height: string;
  video_fps: string;
  video_bitrate: string;
  video_profile: string;
  rtmp_url: string;
  rtmp_enabled: string;
  mpegts_clients: string;
  mpegts_enabled: string;
  rtsp_enabled: string;
  usb_enabled: string;
  audio_enabled: string;
  video_wb: string;
  exposure: string;
  contrast: string;
  sharpness: string;
  digitalgain: string;
  wifi_iface: string;
  wifi_ssid: string;
  wifi_psk: string;
  record_enabled: string;
  record_time: string;
  dec_enabled: string;
  up_down: string;
  swapcams: string;
  udp_clients: string;
  udp_enabled: string;
  ws_enabled: string;
}

export function isPortal(): Promise<Portal> {
  // function who set if you are in portal mode or not
  const controller = new AbortController();
  const signal = controller.signal;
  setTimeout(() => controller.abort(), 5000);
  return fetch(`${API_PREFIX}/portal`, { signal }).then((resp) => resp.json());
}

export function networks(): Promise<Network[]> {
  // function who return a list of network nearby
  return fetch(`${API_PREFIX}/list-networks`).then((resp) => resp.json());
}

export function connect(essid: string, password?: string): Promise<Connect> {
  // function to connect your device to a network nearby
  const data = {
    essid,
    password,
  };

  return fetch(`${API_PREFIX}/connect`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(data),
  }).then((resp) => resp.json());
}

export function startAp(): Promise<any> {
  // call to start the Access point mode
  const data = {};

  return fetch(`${API_PREFIX}/start-ap`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(data),
  });
}

export function updateConfig(patch: Partial<Config>): Promise<any> {
  // call to update the configuration file when you make a change in settings
  return fetch(`${API_PREFIX}/config`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(patch),
  });
}

export function getConfig(): Promise<Config> {
  // call to retrieve the configuration file
  return fetch(`${API_PREFIX}/config`).then((resp) => resp.json());
}

export function getFiles(): Promise<File> {
  // call to retrieve the third-i user files
  return fetch(`${API_PREFIX}/files`).then((resp) => resp.json());
}

export function makePhoto(): Promise<string> {
  // call api when you take a picture
  const data = {};

  return fetch(`${API_PREFIX}/make-photo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(data),
  })
    .then((resp) => resp.json())
    .then((data) => data.filename);
}

export function getDiskUsage(): Promise<Storage> {
  // call to retrieve the disk usage of the Third-i user files
  return fetch(`${API_PREFIX}/disk-usage`).then((resp) => resp.json());
}
