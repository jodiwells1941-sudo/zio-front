export default function OrderUnreadBadge({ count }: { count?: number }) {
  const unread = Math.max(0, Number(count) || 0);
  if (!unread) return null;

  return (
    <span className="local-order-unread-badge" aria-label={`${unread} unread messages`} aria-live="polite">
      {unread > 99 ? '99+' : unread}
    </span>
  );
}
