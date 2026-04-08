// Cross-tab sync utility using BroadcastChannel + storage events
// This ensures admin changes instantly reflect on the store tab

const CHANNEL_NAME = 'nexletronics_sync';

let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (!channel) channel = new BroadcastChannel(CHANNEL_NAME);
  return channel;
}

/** Call after every localStorage write to notify other tabs */
export function broadcastUpdate(key: string) {
  getChannel()?.postMessage({ type: 'update', key });
  // Also dispatch a storage event for same-origin cross-tab
  window.dispatchEvent(new StorageEvent('storage', { key }));
}

/** Listen for updates from any tab (including same tab via broadcast) */
export function onStoreUpdate(callback: (key?: string) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const bc = getChannel();
  const handler = (e: MessageEvent) => { if (e.data?.type === 'update') callback(e.data.key); };
  const storageHandler = () => callback();

  bc?.addEventListener('message', handler);
  window.addEventListener('storage', storageHandler);

  return () => {
    bc?.removeEventListener('message', handler);
    window.removeEventListener('storage', storageHandler);
  };
}
