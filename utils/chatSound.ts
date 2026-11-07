type IncomingMessage = { id?: number | string; trade_id?: number | string; sender_id?: number | string };

let context: AudioContext | null = null;
const heard = new Set<string>();
let lastPlayed = 0;

export async function enableChatSound(): Promise<boolean> {
  try {
    const Constructor = window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Constructor) return false;
    if (!context || context.state === 'closed') context = new Constructor();
    if (context.state !== 'running') await context.resume();
    return context.state === 'running';
  } catch {
    return false;
  }
}

export function playChatChime(): boolean {
  if (!context || context.state !== 'running') return false;
  try {
    const audio = context;
    const start = audio.currentTime;
    [740, 988].forEach((frequency, index) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      const time = start + index * 0.15;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.2, time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      oscillator.start(time);
      oscillator.stop(time + 0.27);
    });
    return true;
  } catch {
    return false;
  }
}

export function notifyIncomingChat(row: IncomingMessage, userId: number): void {
  if (!userId || !row.id || !row.sender_id || Number(row.sender_id) === Number(userId)) return;
  const key = [userId, row.trade_id, row.id].join(':');
  if (heard.has(key)) return;
  heard.add(key);
  if (heard.size > 1000) heard.delete(heard.values().next().value!);
  if (Date.now() - lastPlayed < 600) return;
  if (playChatChime()) lastPlayed = Date.now();
}
