import { useEffect, useMemo, useState } from 'react';
import {
  Banknote, CreditCard, Download, History, RefreshCw,
  Search, Smartphone
} from 'lucide-react';
import api from '../../../../utils/api';
import { exportToCSV } from '../../../../utils/csvExport';

const formatMoney = (value = 0) => `Rs ${Number(value || 0).toLocaleString()}`;

const paymentIcon = {
  Cash: Banknote,
  CASH: Banknote,
  Card: CreditCard,
  CARD: CreditCard,
  UPI: Smartphone
};

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/orders?status=completed');
      setPayments(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load payment history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return payments.filter((payment) => {
      const text = [
        payment.orderNumber,
        payment.paymentMethod,
        payment.table?.name,
        payment.waiter?.name,
        payment.totalAmount
      ].filter(Boolean).join(' ').toLowerCase();
      return !query || text.includes(query);
    });
  }, [payments, searchQuery]);

  const totalsByMethod = useMemo(() => {
    return filteredPayments.reduce((totals, payment) => {
      const method = payment.paymentMethod || 'Other';
      totals[method] = (totals[method] || 0) + Number(payment.totalAmount || 0);
      return totals;
    }, {});
  }, [filteredPayments]);

  const exportCsv = () => {
    const rows = [
      ['Order', 'Payment Method', 'Completed At', 'Cashier', 'Source', 'Amount'],
      ...filteredPayments.map((payment) => [
        payment.orderNumber,
        payment.paymentMethod || '',
        payment.completedAt || '',
        payment.waiter?.name || '',
        payment.table?.name || payment.carNumber || payment.orderType || '',
        payment.totalAmount || 0
      ])
    ];
    exportToCSV(rows, `payment_history_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="h-full flex flex-col bg-[#F8F9FB] animate-in fade-in duration-500 overflow-hidden">
      <header className="px-8 py-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">Payment History & Transaction Logs</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Review completed payments by mode and cashier</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchPayments}
              className="h-9 px-4 bg-white border border-slate-200 text-slate-500 rounded text-[9px] font-black uppercase tracking-widest hover:text-slate-900 transition-all shadow-sm flex items-center gap-2 outline-none"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={exportCsv}
              className="h-9 px-4 bg-slate-900 text-white rounded text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2 outline-none"
            >
              <Download size={14} />
              Audit Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
          {[
            { label: 'UPI Revenue', value: totalsByMethod.UPI || 0, color: 'text-blue-500', icon: Smartphone },
            { label: 'Cash Flow', value: totalsByMethod.Cash || totalsByMethod.CASH || 0, color: 'text-emerald-500', icon: Banknote },
            { label: 'Card Volume', value: totalsByMethod.Card || totalsByMethod.CARD || 0, color: 'text-amber-500', icon: CreditCard }
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-50/50 border border-slate-100 p-4 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className={`text-lg font-extrabold tracking-tighter ${stat.color}`}>{formatMoney(stat.value)}</h3>
              </div>
              <div className={`w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center ${stat.color} opacity-70`}>
                <stat.icon size={14} />
              </div>
            </div>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search order, payment mode, source, cashier..."
            className="w-full bg-slate-50 border border-slate-100 rounded py-2.5 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
          />
        </div>
      </header>

      <div className="flex-1 p-8 overflow-y-auto no-scrollbar">
        {error && <div className="mb-5 rounded border border-rose-100 bg-rose-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-rose-600">{error}</div>}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Transaction</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Source</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Cashier</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-20 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Loading payment history...</td></tr>
              ) : filteredPayments.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-20 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">No completed payments found</td></tr>
              ) : filteredPayments.map((payment) => {
                const Icon = paymentIcon[payment.paymentMethod] || CreditCard;
                return (
                  <tr key={payment._id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-500 bg-slate-50">
                          <Icon size={14} />
                        </div>
                        <div>
                          <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{payment.orderNumber}</span>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{payment.paymentMethod || 'Unknown'} payment</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{payment.table?.name || payment.carNumber || payment.orderType}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{payment.completedAt ? new Date(payment.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{payment.waiter?.name || 'System'}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-[13px] font-black text-slate-950 tracking-tighter">{formatMoney(payment.totalAmount)}</span>
                        <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">Success</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
            <History size={14} />
            {filteredPayments.length} transactions loaded
          </div>
        </div>
      </div>
    </div>
  );
}
