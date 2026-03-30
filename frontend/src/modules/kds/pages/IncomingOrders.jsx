import React from 'react';
import KdsOrderQueueTemplate from '../components/KdsOrderQueueTemplate';

export default function IncomingOrders() {
  return (
    <KdsOrderQueueTemplate 
      title="Incoming Orders" 
      statusFilter="new" 
      emptyMessage="No new orders"
      accentColor="blue"
    />
  );
}
