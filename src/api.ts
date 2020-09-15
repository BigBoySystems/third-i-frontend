const API_PREFIX = process.env.NODE_ENV === "development" ? "" : "/api";

export async function callApi(path: string, options?: RequestInit, data?: any): Promise<any> {
  const body = data === undefined ? undefined : JSON.stringify(data);
  const headers: any =
    data === undefined ? {} : { "Content-Type": "application/json;charset=utf-8" };
  const all_options: RequestInit = {
    headers: {
      ...headers,
      ...options?.headers,
    },
    body,
    ...options,
  };

  const url = path.startsWith("/") ? `${API_PREFIX}${path}` : path;
  const resp = await fetch(url, all_options);

  if (resp.status >= 500) {
    throw new Error(`Internal server error: ${resp.status}`);
  }

  return resp.json();
}

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

// make photo response
export interface MakePhoto extends Response {
  filename: string;
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
export const isPortal = async (): Promise<Portal> => {
  const controller = new AbortController();
  const signal = controller.signal;
  setTimeout(() => controller.abort(), 5000);
  return callApi("/portal", { signal });
};

// call the API to retrieve a list of networks nearby
export const networks = async (): Promise<Network[]> => callApi("/list-networks");

// call the API to connect the Third-I to a network
export const connect = async (essid: string, password?: string): Promise<Connect> =>
  callApi(
    "/connect",
    {
      method: "POST",
    },
    {
      essid,
      password,
    }
  );

// call the API to start the Access point mode
export const startAp = async (): Promise<any> =>
  callApi(
    "/start-ap",
    {
      method: "POST",
    },
    {}
  );

// call the API to update the configuration file
export const updateConfig = (patch: Partial<Config>): Promise<any> =>
  callApi(
    "/config",
    {
      method: "PATCH",
    },
    patch
  );

// call the API to retrieve the configuration file
export const getConfig = async (): Promise<Config> => callApi("/config");

// call the API to retrieve the third-i user files
export const getFiles = async (): Promise<File> => callApi("/files");

// call the API when you take a picture
export const makePhoto = async (): Promise<MakePhoto> =>
  callApi(
    "/make-photo",
    {
      method: "POST",
    },
    {}
  );

// call the API to retrieve the disk usage of the Third-i
export const getDiskUsage = async (): Promise<Storage> => callApi("/disk-usage");
