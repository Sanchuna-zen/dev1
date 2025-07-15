
import { createClient } from './client';
import { RealtimeChannel } from '@supabase/supabase-js';

const supabase = createClient();

export const subscribeToInventoryUpdates = (
  shopId: string,
  callback: (payload: any) => void
): RealtimeChannel => {
  const channel = supabase
    .channel(`inventory-changes-for-shop-${shopId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'inventory', filter: `shop_id=eq.${shopId}` },
      callback
    )
    .subscribe();

  return channel;
};

export const unsubscribeFromChannel = (channel: RealtimeChannel) => {
  supabase.removeChannel(channel);
};
