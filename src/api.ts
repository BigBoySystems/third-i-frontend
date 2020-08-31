const API_PREFIX = process.env.NODE_ENV === "development" ? "" : "/api";

export interface Portal {
  portal: boolean;
  essid: string | null;
}

export interface Network {
  essid: string;
  password: boolean;
}

export interface Connect {
  success: boolean;
  reason?: string;
}

export interface Storage {
  used: number;
  total: number;
}

export interface File {
  name: string;
  url: string;
  directory: boolean;
  children: File[];
}

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

export function isPortal(): Promise<Portal> {
  return fetch(`${API_PREFIX}/portal`).then((resp) => resp.json());
}

export function networks(): Promise<Network[]> {
  return fetch(`${API_PREFIX}/list-networks`).then((resp) => resp.json());
}

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

export function updateConfig(patch: Partial<Config>): Promise<any> {
  return fetch(`${API_PREFIX}/config`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(patch),
  });
}

export function getConfig(): Promise<Config> {
  return fetch(`${API_PREFIX}/config`).then((resp) => resp.json());
}

export function getFiles(): Promise<File> {
  return fetch(`${API_PREFIX}/files`).then((resp) => resp.json());
}
