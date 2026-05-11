/** Consistent sidebar avatar color from a label (e.g. counterparty name). */
export function chatAvatarColor(label: string): string {
  const colors = [
    "#f59e0b",
    "#1e3a5f",
    "#dc2626",
    "#7c3aed",
    "#064e3b",
    "#b45309",
    "#0f4c75",
    "#4b5563",
  ];
  let h = 0;
  for (let i = 0; i < label.length; i++) {
    h = label.charCodeAt(i) + ((h << 5) - h);
  }
  return colors[Math.abs(h) % colors.length];
}
