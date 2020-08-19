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

export function updateConfig(patch: Partial<Config>): Promise<any> {
  return fetch("/config", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(patch),
  });
}

export function getConfig(): Promise<Config> {
  return fetch("/config").then((resp) => resp.json());
}
