import React, { useState } from 'react';
import { ShoppingBag, Search, Filter, Clock, CheckCircle, XCircle, ChevronRight, Eye, Edit2, Trash2, Save, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { maskQuantity, maskCurrency, calculateMaskedOrderTotal, getReplacedName } from '../../utils/dataMask';
import AdminModal from '../../components/ui/AdminModal';
import api from '../../../../utils/api';
import { exportToCSV } from '../../../../utils/csvExport';
import OnscreenInvoice from '../../../../components/shared/OnscreenInvoice';

export default function AllOrders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filter state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [limit] = useState(15);
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Custom dialog modal state
  const [dialog, setDialog] = useState(null);

  const showAlert = (message, title = 'Notification', isError = false) => {
    return new Promise((resolve) => {
      setDialog({
        type: 'alert',
        title,
        message,
        isError,
        onConfirm: () => resolve(true)
      });
    });
  };

  const showPrompt = (message, title = 'Input Required', placeholder = 'Enter details...') => {
    return new Promise((resolve) => {
      setDialog({
        type: 'prompt',
        title,
        message,
        placeholder,
        onConfirm: (val) => resolve(val || '')
      });
    });
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      if (filterType !== 'ALL') {
        params.append('type', filterType);
      }
      if (filterStatus !== 'ALL') {
        params.append('status', filterStatus);
      }
      
      const { data } = await api.get(`/orders?${params.toString()}`);
      if (data && data.data) {
        setOrders(data.data);
        setTotalPages(data.totalPages || 1);
        setTotalOrders(data.total || 0);
      } else {
        setOrders(Array.isArray(data) ? data : []);
        setTotalPages(1);
        setTotalOrders(Array.isArray(data) ? data.length : 0);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const params = new URLSearchParams();
      params.append('page', 1);
      params.append('limit', 10000);
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      if (filterType !== 'ALL') {
        params.append('type', filterType);
      }
      if (filterStatus !== 'ALL') {
        params.append('status', filterStatus);
      }
      
      const { data } = await api.get(`/orders?${params.toString()}`);
      const exportList = data && data.data ? data.data : (Array.isArray(data) ? data : []);
      
      if (exportList.length === 0) {
        await showAlert("No orders to export.", "Export CSV", true);
        return;
      }

      const headers = ["Bill ID", "Date", "Items", "Subtotal", "Discount", "Taxes", "Total Amount", "Payment Mode", "Type", "Status"];
      
      const rows = exportList.map(order => [
        order.orderNumber || order._id || 'N/A',
        new Date(order.completedAt || order.createdAt).toLocaleString(),
        order.kots?.flatMap(k => k.items.map(i => i.name)).join(', ') || 'N/A',
        order.subtotal,
        order.discount?.amount || 0,
        (order.taxes || []).reduce((sum, t) => sum + t.amount, 0),
        order.totalAmount,
        order.paymentMethod || 'N/A',
        order.orderType,
        order.orderStatus
      ]);

      exportToCSV([headers, ...rows], `order_history_${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (error) {
      console.error("Failed to export orders CSV:", error);
      await showAlert("Failed to export orders. Please try again.", "Export CSV", true);
    }
  };

  React.useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchOrders();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, page, filterType, filterStatus]);

  const [formData, setFormData] = useState({
    status: 'RUNNING'
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'COMPLETED': return 'text-emerald-500 bg-emerald-50';
      case 'RUNNING': return 'text-blue-500 bg-blue-50';
      case 'BILLED': return 'text-amber-500 bg-amber-50';
      case 'CANCELLED': return 'text-red-500 bg-red-50';
      default: return 'text-slate-400 bg-slate-50';
    }
  };

  const handleOpenView = (order) => {
    setViewingOrder(order);
    setFormData({ status: order.orderStatus });
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      const payload = { orderStatus: formData.status };
      if (formData.status === 'CANCELLED') {
        const reason = await showPrompt('Enter reason for cancellation:', 'Cancel Order');
        if (!reason) return;
        payload.cancellationReason = reason || 'Cancelled by Administrator via override';
      }
      await api.put(`/orders/${viewingOrder._id}`, payload);
      setIsModalOpen(false);
      await fetchOrders();
      showAlert('Order status synchronized successfully.', 'Status Updated');
    } catch (error) {
      console.error("Error updating order status:", error);
      showAlert(error.response?.data?.message || 'Error updating order status', 'Update Failed', true);
    }
  };

  const handleCancelOrder = async (id) => {
    const reason = await showPrompt('Enter reason for cancellation:', 'Cancel Order');
    if (!reason) return;
    
    try {
      await api.post(`/orders/${id}/cancel`, { reason: reason || 'Cancelled by Administrator' });
      await fetchOrders();
      showAlert('Order cancelled successfully.', 'Order Cancelled');
    } catch (error) {
      console.error("Error cancelling order:", error);
      showAlert(error.response?.data?.message || 'Error cancelling order', 'Cancellation Failed', true);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleTypeChange = (e) => {
    setFilterType(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setFilterStatus(e.target.value);
    setPage(1);
  };

  const filteredOrders = orders;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Master Order Log</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Cross-Channel Order Flow</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-900/10">
            <ShoppingBag size={14} />
            {totalOrders} ACTIVE ORDERS
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-sm p-4 flex flex-col md:flex-row gap-4 shadow-sm">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={14} />
          <input 
            type="text" 
            placeholder="FILTER ORDERS BY ID, TYPE OR CUSTOMER..."
            className="w-full bg-slate-50 border-none rounded-sm py-2.5 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest outline-none shadow-sm"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={filterType} 
            onChange={handleTypeChange}
            className="h-10 px-3 bg-slate-50 border border-slate-100 text-slate-500 rounded-sm text-[10px] font-black uppercase tracking-widest outline-none focus:border-slate-300 transition-all cursor-pointer"
          >
            <option value="ALL">All Channels</option>
            <option value="DINE-IN">Dine-in</option>
            <option value="CAR-SERVICE">Car Service</option>
            <option value="PICKUP">Takeaway</option>
          </select>
          
          <select 
            value={filterStatus} 
            onChange={handleStatusChange}
            className="h-10 px-3 bg-slate-50 border border-slate-100 text-slate-500 rounded-sm text-[10px] font-black uppercase tracking-widest outline-none focus:border-slate-300 transition-all cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="RUNNING">Running</option>
            <option value="BILLED">Billed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button
            onClick={handleExportCsv}
            className="h-10 px-4 bg-[#E1261C] hover:bg-[#c91f16] text-white rounded-sm text-[10px] font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-2"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-sm overflow-hidden overflow-x-auto shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Order ID</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Order Channel</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter text-right">Order Amount</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Current Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <RefreshCw size={24} className="animate-spin text-slate-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading master log...</span>
                  </div>
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-16 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">
                  No orders found
                </td>
              </tr>
            ) : filteredOrders.map((order) => (
              <tr key={order._id} className="hover:bg-slate-900/5 group transition-all duration-300">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">#{order.orderNumber}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      {new Date(order.createdAt).toLocaleString()} | {order.orderType === 'DINE-IN' ? order.table?.name : order.carNumber || 'Pickup'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest tracking-tighter">
                    {order.orderType} ({maskQuantity(order.kots.reduce((acc, k) => acc + k.items.length, 0))} Items)
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-xs font-black text-slate-900 tracking-tighter">₹{calculateMaskedOrderTotal(order).toFixed(2)}</span>
                </td>
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-sm text-[8px] font-black uppercase tracking-widest ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => handleOpenView(order)}
                      className="p-2 text-slate-400 hover:text-slate-900 transition-colors outline-none"
                    ><Eye size={16} /></button>
                    {order.orderStatus !== 'CANCELLED' && (
                      <button 
                        onClick={() => handleCancelOrder(order._id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors outline-none"
                      ><XCircle size={16} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination controls */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Showing Page {page} of {totalPages} ({totalOrders} Total Orders)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="p-1.5 border border-slate-200 bg-white rounded-sm cursor-pointer hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={14} className="rotate-180 text-slate-500" />
              </button>
              <span className="text-xs font-bold text-slate-700">{page}</span>
              <button
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="p-1.5 border border-slate-200 bg-white rounded-sm cursor-pointer hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={14} className="text-slate-500" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={viewingOrder ? `Audit Order ${viewingOrder.orderNumber}` : 'Order Details'}
        subtitle="Edit Order Status"
        onSubmit={handleUpdateStatus}
        submitLabel="Update Status"
      >
        {viewingOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-sm">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Customer</label>
                <div className="text-xs font-black text-slate-900 uppercase">{getReplacedName(viewingOrder.customer?.name || viewingOrder.carNumber || 'N/A')}</div>
              </div>
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-sm">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Channel</label>
                <div className="text-xs font-black text-slate-900 uppercase">{viewingOrder.orderType}</div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 border border-slate-100 rounded-sm">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Select Order Status</label>
              <div className="flex gap-2">
                {['RUNNING', 'COMPLETED', 'CANCELLED'].map((status) => (
                   <button
                    key={status}
                    type="button"
                    onClick={() => setFormData({ status })}
                    className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-sm border transition-all ${
                      formData.status === status 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                        : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <OnscreenInvoice order={viewingOrder} />
          </div>
        )}
      </AdminModal>

      {/* Styled React custom dialog overlay */}
      <AnimatePresence>
        {dialog && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDialog(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-sm rounded-xl shadow-2xl relative overflow-hidden flex flex-col p-6 border border-slate-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dialog.isError ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  <AlertCircle size={16} />
                </div>
                <h3 className="text-sm font-extrabold uppercase text-slate-900">{dialog.title || 'Notification'}</h3>
              </div>
              
              <p className="text-xs text-slate-600 font-semibold mb-6 uppercase tracking-wider leading-relaxed">{dialog.message}</p>
              
              {dialog.type === 'prompt' && (
                <input
                  type="text"
                  placeholder={dialog.placeholder || 'Enter details...'}
                  id="custom-dialog-input"
                  className="w-full bg-slate-50 border border-slate-200 py-2.5 px-4 text-xs font-bold uppercase rounded-lg outline-none focus:ring-2 focus:ring-[#E1261C]/20 focus:border-[#E1261C] mb-6 placeholder:text-stone-300"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      dialog.onConfirm(e.target.value);
                      setDialog(null);
                    }
                  }}
                />
              )}
              
              <div className="flex items-center gap-3 justify-end">
                {dialog.type !== 'alert' && (
                  <button
                    onClick={() => setDialog(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => {
                    const inputVal = document.getElementById('custom-dialog-input')?.value;
                    dialog.onConfirm(inputVal);
                    setDialog(null);
                  }}
                  className="px-4 py-2 bg-[#E1261C] hover:bg-[#c81e17] text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
