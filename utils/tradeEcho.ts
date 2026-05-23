import apiClient from "@/utils/apiClient";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

type TradeEcho = Echo<any>;
type TradeChannel = { name: string };
type TradeAuthorizerCallback = (error: boolean, data: unknown) => void;

let echoInstance: TradeEcho | null = null;

function apiOrigin(): string {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
  return base.replace(/\/?api\/?$/, "");
}

function reverbHost(): string {
  const h = process.env.NEXT_PUBLIC_REVERB_HOST;
  if (h) return h;
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api").hostname;
  } catch {
    return "127.0.0.1";
  }
}

/** Laravel Echo + Reverb; returns null if NEXT_PUBLIC_REVERB_APP_KEY is unset. */
export function getTradeEcho(): TradeEcho | null {
  console.log('okk', process.env.NEXT_PUBLIC_REVERB_HOST);
  
  if (typeof window === "undefined") return null;
  const key = process.env.NEXT_PUBLIC_REVERB_APP_KEY;
  if (!key) return null;

  if (!echoInstance) {
    window.Pusher = Pusher;
    const scheme = process.env.NEXT_PUBLIC_REVERB_SCHEME || "http";
    const port = Number(process.env.NEXT_PUBLIC_REVERB_PORT || 8080);
    echoInstance = new Echo({
      broadcaster: "reverb",
      key,
      wsHost: reverbHost(),
      // wsPort: port,
      // wssPort: port,
      forceTLS: scheme === "https",
      enabledTransports: ["ws", "wss"],
      disableStats: true,
      authorizer: (channel: TradeChannel) => ({
        authorize: (socketId: string, callback: TradeAuthorizerCallback) => {
          apiClient
            .post(
              `${apiOrigin()}/broadcasting/auth`,
              {
                socket_id: socketId,
                channel_name: channel.name,
              },
              { headers: { Accept: "application/json" } }
            )
            .then((res) => {
              callback(false, res.data);
            })
            .catch((err) => {
              callback(true, err);
            });
        },
      }),
    });
  }
  return echoInstance;
}

export function disconnectTradeEcho(): void {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}
