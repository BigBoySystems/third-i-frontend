const API_PREFIX = process.env.NODE_ENV === "development" ? "" : "/api";

// response to the "portal" endpoint
export interface Portal {
  portal: boolean; // true if currently in portal mode
  essid: string | null; // a string with the essid if connected to a network
}

// item in the response to the "list networks" endpoint
export interface Network {
  essid: string;
  password: boolean;
}

// base API response (every endpoint should return that)
export interface Response {
  success: boolean;
  reason?: string;
}

export interface Connect extends Response {}

export interface RenameFile extends Response {
  file: File;
}

// response with the disk usage of the Third-i
export interface Storage {
  used: number;
  total: number;
}

// item of a file (used in the file manager component)
export interface File {
  name: string;
  path: string;
  url: string;
  directory: boolean;
  children: File[];
}

// response with the configuration file (/boot/stereopi.conf)
export interface Config {
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

// call the API endpoint to retrieve portal information
export function isPortal(): Promise<Portal> {
  const controller = new AbortController();
  const signal = controller.signal;
  setTimeout(() => controller.abort(), 5000);
  return fetch(`${API_PREFIX}/portal`, { signal }).then((resp) => resp.json());
}

// call the API to retrieve a list of networks nearby
export function networks(): Promise<Network[]> {
  return fetch(`${API_PREFIX}/list-networks`).then((resp) => resp.json());
}

// call the API to connect the Third-I to a network
export function connect(essid: string, password?: string): Promise<Connect> {
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

// call the API to start the Access point mode
export function startAp(): Promise<any> {
  const data = {};

  return fetch(`${API_PREFIX}/start-ap`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(data),
  });
}

// call the API to update the configuration file
export function updateConfig(patch: Partial<Config>): Promise<any> {
  return fetch(`${API_PREFIX}/config`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(patch),
  });
}

// call the API to retrieve the configuration file
export function getConfig(): Promise<Config> {
  return fetch(`${API_PREFIX}/config`).then((resp) => resp.json());
}

// call the API to retrieve the third-i user files
export function getFiles(): Promise<File> {
  return fetch(`${API_PREFIX}/files`).then((resp) => resp.json());
}

// call the API when you take a picture
export function makePhoto(): Promise<string> {
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

// call the API to retrieve the disk usage of the Third-i
export function getDiskUsage(): Promise<Storage> {
  return fetch(`${API_PREFIX}/disk-usage`).then((resp) => resp.json());
}
