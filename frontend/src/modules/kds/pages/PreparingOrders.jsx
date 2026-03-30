import React from 'react';
import KdsOrderQueueTemplate from '../components/KdsOrderQueueTemplate';

export default function PreparingOrders() {
  return (
    <KdsOrderQueueTemplate 
      title="Preparing Orders" 
      statusFilter={['preparing', 'delayed']} 
      emptyMessage="No active preparation"
      accentColor="orange"
    />
  );
}
