import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, Download, Calendar, ArrowUpRight, 
  ArrowDownLeft, TrendingUp, DollarSign, Filter,
  PieChart as PieChartIcon, Clock, AlertCircle,
  FileText, Users, MapPin, Table as TableIcon, ShoppingBag
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area,
  BarChart, Bar, PieChart, Cell, Pie, Legend
} from 'recharts';
import api from '../../../../utils/api';
import { exportToCSV } from '../../../../utils/csvExport';
import { maskCurrency, getReplacedName, maskQuantity } from '../../utils/dataMask';
import { useBranchContext } from '../../../../context/BranchContext';

export default function SalesReports() {
  const { activeBranch } = useBranchContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [activeReport, setActiveReport] = useState('summary');

  // Filters
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    orderType: '',
    waiter: '',
    biller: '',
    table: '',
    outlet: ''
  });

  // Temp Filters for inputs (only applied on Apply click)
  const [tempFilters, setTempFilters] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    orderType: '',
    waiter: '',
    biller: '',
    table: '',
    outlet: ''
  });

  // Filter Options (to be fetched)
  const [options, setOptions] = useState({
    waiters: [],
    billers: [],
    tables: [],
    outlets: ['Main Outlet (Sadar)']
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reportRes, staffRes, tableRes] = await Promise.all([
        api.get('/reports/sales', { params: { ...filters, reportType: activeReport, branch: activeBranch } }),
        api.get(`/staff?branch=${activeBranch}`),
        api.get(`/tables?branch=${activeBranch}`)
      ]);

      setData(reportRes.data);
      const staffList = staffRes.data.data || staffRes.data || [];
      setOptions(prev => ({
        ...prev,
        waiters: staffList.filter(w => w.role?.toLowerCase() === 'waiter'),
        billers: staffList.filter(w => w.role?.toLowerCase() === 'biller'),
        tables: tableRes.data
      }));
      setLoading(false);
    } catch (err) {
      console.error('Fetch Error:', err);
      setError(err.response?.data?.message || 'Failed to load report data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters, activeReport, activeBranch]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setTempFilters(prev => ({ ...prev, [name]: value }));
  };

  // Data Masking Memos for Overview Dashboard (summary)
  const maskedTrends = useMemo(() => {
    if (activeReport !== 'summary' || !data?.trends) return [];
    return data.trends.map(t => ({
      ...t,
      revenue: maskCurrency(t.revenue)
    }));
  }, [data?.trends, activeReport]);

  const maskedTopItems = useMemo(() => {
    if (activeReport !== 'summary' || !data?.topItems) return [];
    return data.topItems.map(item => ({
      ...item,
      name: getReplacedName(item.name),
      quantity: maskQuantity(item.quantity)
    }));
  }, [data?.topItems, activeReport]);

  const maskedPaymentBreakdown = useMemo(() => {
    if (activeReport !== 'summary' || !data?.paymentBreakdown) return [];
    return data.paymentBreakdown.map(p => ({
      ...p,
      revenue: maskCurrency(p.revenue)
    }));
  }, [data?.paymentBreakdown, activeReport]);

  const maskedHourlySales = useMemo(() => {
    if (activeReport !== 'summary' || !data?.hourlySales) return [];
    return data.hourlySales.map(h => ({
      ...h,
      orders: maskQuantity(h.orders),
      revenue: maskCurrency(h.revenue)
    }));
  }, [data?.hourlySales, activeReport]);

  const maskedTaxSummary = useMemo(() => {
    if (activeReport !== 'summary' || !data?.taxSummary) return [];
    return data.taxSummary.map(t => ({
      ...t,
      amount: maskCurrency(t.amount)
    }));
  }, [data?.taxSummary, activeReport]);

  const maskedCancellations = useMemo(() => {
    if (activeReport !== 'summary' || !data?.cancellations) return [];
    return data.cancellations.map(c => ({
      ...c,
      count: maskQuantity(c.count),
      potentialRevenue: maskCurrency(c.potentialRevenue)
    }));
  }, [data?.cancellations, activeReport]);

  const exportCsv = () => {
    if (!data) return;

    let headers = [];
    let rows = [];
    let filename = `sales_report_${activeReport}_${filters.startDate}_to_${filters.endDate}.csv`;

    switch (activeReport) {
      case 'bills':
        headers = ['Bill Number', 'Date/Time', 'Biller', 'Waiter', 'Table', 'Order Type', 'Customer Name', 'Customer Phone', 'Subtotal', 'Discount', 'Tax', 'Grand Total', 'Payment Method'];
        rows = data.map(o => [
          o.orderNumber,
          o.completedAt ? new Date(o.completedAt).toLocaleString() : '-',
          o.biller?.name || 'Admin',
          o.waiter?.name || 'N/A',
          o.table?.name || 'N/A',
          o.orderType,
          o.customer?.name || '-',
          o.customer?.phone || '-',
          maskCurrency(o.subtotal || 0),
          maskCurrency(o.discount?.amount || 0),
          maskCurrency((o.taxes || []).reduce((s, t) => s + (t.amount || 0), 0)),
          maskCurrency(o.totalAmount || 0),
          o.paymentMethod || '-'
        ]);
        break;
      case 'items':
        headers = ['Item Name', 'Category', 'Quantity Sold', 'Unit Price', 'Total Revenue'];
        rows = data.map(item => [
          getReplacedName(item.name),
          item.category,
          maskQuantity(item.quantity),
          maskCurrency(item.price),
          maskCurrency(item.revenue)
        ]);
        break;
      case 'categories':
        headers = ['Category Name', 'Items Sold', 'Total Revenue'];
        rows = data.map(cat => [
          cat.categoryName,
          maskQuantity(cat.quantity),
          maskCurrency(cat.revenue)
        ]);
        break;
      case 'cashiers':
        headers = ['Cashier Name', 'Bills Settled', 'Cash Sales', 'UPI Sales', 'Card Sales', 'Total Revenue'];
        rows = data.map(c => [
          c.cashierName,
          maskQuantity(c.orderCount),
          maskCurrency(c.cashRevenue),
          maskCurrency(c.upiRevenue),
          maskCurrency(c.cardRevenue),
          maskCurrency(c.totalRevenue)
        ]);
        break;
      case 'waiters':
        headers = ['Waiter Name', 'Tables Served', 'Total Sales Volume', 'Average Ticket Size'];
        rows = data.map(w => [
          w.waiterName,
          maskQuantity(w.orderCount),
          maskCurrency(w.totalRevenue),
          maskCurrency(w.avgTicketSize)
        ]);
        break;
      case 'cancellations':
        headers = ['Bill Number', 'Date/Time', 'Reason', 'Table', 'Waiter', 'Lost Value'];
        rows = data.map(o => [
          o.orderNumber,
          o.cancelledAt ? new Date(o.cancelledAt).toLocaleString() : '-',
          o.cancellationReason || 'No reason',
          o.table?.name || 'N/A',
          o.waiter?.name || 'N/A',
          maskCurrency(o.totalAmount || 0)
        ]);
        break;
      case 'discounts':
        headers = ['Bill Number', 'Date/Time', 'Biller', 'Subtotal', 'Discount Type', 'Value', 'Discount Amount', 'Reason', 'Grand Total'];
        rows = data.map(o => [
          o.orderNumber,
          o.completedAt ? new Date(o.completedAt).toLocaleString() : '-',
          o.biller?.name || 'Admin',
          maskCurrency(o.subtotal || 0),
          o.discount?.type || 'FLAT',
          maskQuantity(o.discount?.value || 0),
          maskCurrency(o.discount?.amount || 0),
          o.discount?.reason || 'N/A',
          maskCurrency(o.totalAmount || 0)
        ]);
        break;
      case 'tax':
        headers = ['Date', 'Taxable Base Sales', 'CGST Collected', 'SGST Collected', 'Total Tax', 'Total Sales'];
        rows = data.map(t => [
          t._id,
          maskCurrency(t.taxableAmount),
          maskCurrency(t.cgst),
          maskCurrency(t.sgst),
          maskCurrency(t.totalTax),
          maskCurrency(t.totalSales)
        ]);
        break;
      case 'hourly':
        headers = ['Hour', 'Orders Completed', 'Revenue Generated'];
        rows = data.map(h => [
          `${h._id}:00`,
          maskQuantity(h.orderCount),
          maskCurrency(h.revenue)
        ]);
        break;
      case 'summary':
      default:
        const summaryRows = [
          ['SALES REPORT PERIOD SUMMARY'],
          ['Start Date', filters.startDate],
          ['End Date', filters.endDate],
          [],
          ['METRIC', 'VALUE'],
          ['Gross Revenue', `INR ${maskCurrency(data.summary.totalRevenue).toLocaleString()}`],
          ['Net Revenue', `INR ${maskCurrency(data.summary.netRevenue).toLocaleString()}`],
          ['Total Orders', maskQuantity(data.summary.orderCount)],
          ['Average Ticket Size', `INR ${maskCurrency(data.summary.avgOrderValue).toLocaleString()}`],
          ['Total Tax Compliance', `INR ${maskCurrency(data.summary.taxAmount).toLocaleString()}`],
          [],
          ['DAILY TRENDS'],
          ['Date', 'Revenue (INR)', 'Orders'],
          ...maskedTrends.map(t => [t._id, t.revenue, t.orders]),
          [],
          ['TOP SELLING ITEMS'],
          ['Item Name', 'Quantity Sold', 'Revenue (INR)'],
          ...maskedTopItems.map(item => [item.name, item.quantity, maskCurrency(item.revenue)]),
          [],
          ['TAX SUMMARY'],
          ['Tax Component', 'Amount (INR)'],
          ...maskedTaxSummary.map(tax => [tax._id, tax.amount]),
          [],
          ['CANCELLATIONS'],
          ['Reason', 'Count', 'Lost Value (INR)'],
          ...maskedCancellations.map(c => [c._id || 'UNSPECIFIED', c.count, c.potentialRevenue])
        ];

        exportToCSV(summaryRows, `sales_report_${filters.startDate}_to_${filters.endDate}.csv`);
        return;
    }

    exportToCSV([headers, ...rows], filename);
  };

  const renderBillsTable = () => {
    if (!Array.isArray(data)) return null;
    const totalGross = data.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalDiscount = data.reduce((sum, o) => sum + (o.discount?.amount || 0), 0);
    const totalSubtotal = data.reduce((sum, o) => sum + (o.subtotal || 0), 0);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-100 p-4 rounded-sm shadow-sm">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Bills</div>
            <div className="text-lg font-black text-slate-900 mt-1">{maskQuantity(data.length)}</div>
          </div>
          <div className="bg-white border border-slate-100 p-4 rounded-sm shadow-sm">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Subtotal</div>
            <div className="text-lg font-black text-slate-900 mt-1">₹{maskCurrency(totalSubtotal).toLocaleString()}</div>
          </div>
          <div className="bg-white border border-slate-100 p-4 rounded-sm shadow-sm">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Discount</div>
            <div className="text-lg font-black text-rose-500 mt-1">₹{maskCurrency(totalDiscount).toLocaleString()}</div>
          </div>
          <div className="bg-white border border-slate-100 p-4 rounded-sm shadow-sm">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Revenue (Gross)</div>
            <div className="text-lg font-black text-slate-900 mt-1">₹{maskCurrency(totalGross).toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-sm shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Bill No</th>
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Biller</th>
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Waiter</th>
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Table</th>
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Subtotal</th>
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Discount</th>
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Grand Total</th>
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-[11px] font-bold text-slate-600">
                {data.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-black text-slate-900">{o.orderNumber}</td>
                    <td className="px-4 py-3">{o.completedAt ? new Date(o.completedAt).toLocaleString() : '-'}</td>
                    <td className="px-4 py-3">{o.biller?.name || 'Admin'}</td>
                    <td className="px-4 py-3">{o.waiter?.name || 'N/A'}</td>
                    <td className="px-4 py-3">{o.table?.name || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-full text-[8px] font-black">{o.orderType}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {o.customer?.name ? `${getReplacedName(o.customer.name)} (${o.customer.phone || ''})` : '-'}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">₹{maskCurrency(o.subtotal || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-rose-500 tabular-nums">₹{maskCurrency(o.discount?.amount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-black text-slate-900 tabular-nums">₹{maskCurrency(o.totalAmount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-sm text-[8px] font-black">{o.paymentMethod || 'CASH'}</span>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan="11" className="px-4 py-8 text-center text-slate-300 uppercase tracking-widest text-[9px] font-black">No transaction records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderItemsTable = () => {
    if (!Array.isArray(data)) return null;
    const totalRevenue = data.reduce((sum, i) => sum + (i.revenue || 0), 0);
    const totalQty = data.reduce((sum, i) => sum + (i.quantity || 0), 0);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-100 p-4 rounded-sm shadow-sm">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Items Sold</div>
            <div className="text-lg font-black text-slate-900 mt-1">{maskQuantity(totalQty).toLocaleString()}</div>
          </div>
          <div className="bg-white border border-slate-100 p-4 rounded-sm shadow-sm">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Revenue (Menu Items)</div>
            <div className="text-lg font-black text-slate-900 mt-1">₹{maskCurrency(totalRevenue).toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-sm shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Item Name</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Qty Sold</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Avg Unit Price</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-[11px] font-bold text-slate-600">
                {data.map((item, idx) => (
                  <tr key={item._id || idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3 font-black text-slate-900">{getReplacedName(item.name)}</td>
                    <td className="px-6 py-3">{item.category}</td>
                    <td className="px-6 py-3 text-right tabular-nums font-black text-slate-900">{maskQuantity(item.quantity)}</td>
                    <td className="px-6 py-3 text-right tabular-nums">₹{maskCurrency(item.price || 0).toLocaleString()}</td>
                    <td className="px-6 py-3 text-right font-black text-slate-900 tabular-nums">₹{maskCurrency(item.revenue || 0).toLocaleString()}</td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-300 uppercase tracking-widest text-[9px] font-black">No item sales records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderCategoriesTable = () => {
    if (!Array.isArray(data)) return null;
    const totalRevenue = data.reduce((sum, c) => sum + (c.revenue || 0), 0);
    const totalQty = data.reduce((sum, c) => sum + (c.quantity || 0), 0);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-100 p-4 rounded-sm shadow-sm">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Items Sold</div>
            <div className="text-lg font-black text-slate-900 mt-1">{maskQuantity(totalQty).toLocaleString()}</div>
          </div>
          <div className="bg-white border border-slate-100 p-4 rounded-sm shadow-sm">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Sales Revenue</div>
            <div className="text-lg font-black text-slate-900 mt-1">₹{maskCurrency(totalRevenue).toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-sm shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Category Name</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Items Sold (Qty)</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Total Revenue</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Revenue Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-[11px] font-bold text-slate-600">
                {data.map((cat, idx) => {
                  const share = totalRevenue > 0 ? ((cat.revenue / totalRevenue) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={cat._id || idx} className="hover:bg-slate-50/50 transition-colors">
                       <td className="px-6 py-3 font-black text-slate-900">{cat.categoryName}</td>
                       <td className="px-6 py-3 text-right tabular-nums">{maskQuantity(cat.quantity)}</td>
                       <td className="px-6 py-3 text-right font-black text-slate-900 tabular-nums">₹{maskCurrency(cat.revenue || 0).toLocaleString()}</td>
                       <td className="px-6 py-3 text-right text-slate-500 font-bold tabular-nums">{share}%</td>
                    </tr>
                  );
                })}
                {data.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-300 uppercase tracking-widest text-[9px] font-black">No category sales records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderCashiersTable = () => {
    if (!Array.isArray(data)) return null;

    return (
      <div className="bg-white border border-slate-100 rounded-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Cashier Name</th>
                <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Bills Settled</th>
                <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Cash Collection</th>
                <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">UPI Collection</th>
                <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Card Collection</th>
                <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Total Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[11px] font-bold text-slate-600">
              {data.map((c, idx) => (
                <tr key={c._id || idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 font-black text-slate-900">{c.cashierName}</td>
                  <td className="px-6 py-3 text-right tabular-nums">{maskQuantity(c.orderCount)}</td>
                  <td className="px-6 py-3 text-right text-emerald-600 tabular-nums">₹{maskCurrency(c.cashRevenue || 0).toLocaleString()}</td>
                  <td className="px-6 py-3 text-right text-blue-600 tabular-nums">₹{maskCurrency(c.upiRevenue || 0).toLocaleString()}</td>
                  <td className="px-6 py-3 text-right text-slate-600 tabular-nums">₹{maskCurrency(c.cardRevenue || 0).toLocaleString()}</td>
                  <td className="px-6 py-3 text-right font-black text-slate-900 tabular-nums">₹{maskCurrency(c.totalRevenue || 0).toLocaleString()}</td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-300 uppercase tracking-widest text-[9px] font-black">No cashier records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderWaitersTable = () => {
    if (!Array.isArray(data)) return null;

    return (
      <div className="bg-white border border-slate-100 rounded-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Waiter Name</th>
                <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Tables Served</th>
                <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Total Sales Volume</th>
                <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Avg Ticket Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[11px] font-bold text-slate-600">
              {data.map((w, idx) => (
                <tr key={w._id || idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 font-black text-slate-900">{w.waiterName}</td>
                  <td className="px-6 py-3 text-right tabular-nums">{maskQuantity(w.orderCount)}</td>
                  <td className="px-6 py-3 text-right font-black text-slate-900 tabular-nums">₹{maskCurrency(w.totalRevenue || 0).toLocaleString()}</td>
                  <td className="px-6 py-3 text-right text-slate-500 tabular-nums">₹{maskCurrency(Math.round(w.avgTicketSize || 0)).toLocaleString()}</td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-300 uppercase tracking-widest text-[9px] font-black">No waiter performance records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCancellationsTable = () => {
    if (!Array.isArray(data)) return null;
    const totalLost = data.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-100 p-4 rounded-sm shadow-sm">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Cancelled Bills</div>
            <div className="text-lg font-black text-slate-900 mt-1">{maskQuantity(data.length)}</div>
          </div>
          <div className="bg-white border border-slate-100 p-4 rounded-sm shadow-sm">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Potential Revenue Lost</div>
            <div className="text-lg font-black text-rose-500 mt-1">₹{maskCurrency(totalLost).toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-sm shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Bill No</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Table</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Waiter</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Reason</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Lost Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-[11px] font-bold text-slate-600">
                {data.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3 font-black text-slate-900">{o.orderNumber}</td>
                    <td className="px-6 py-3">{o.cancelledAt ? new Date(o.cancelledAt).toLocaleString() : '-'}</td>
                    <td className="px-6 py-3">{o.table?.name || 'N/A'}</td>
                    <td className="px-6 py-3">{o.waiter?.name || 'N/A'}</td>
                    <td className="px-6 py-3 text-rose-500 font-bold">{o.cancellationReason || 'No reason specified'}</td>
                    <td className="px-6 py-3 text-right font-black text-slate-900 tabular-nums">₹{maskCurrency(o.totalAmount || 0).toLocaleString()}</td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-300 uppercase tracking-widest text-[9px] font-black">No cancelled bills recorded in period</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderDiscountsTable = () => {
    if (!Array.isArray(data)) return null;
    const totalDiscount = data.reduce((sum, o) => sum + (o.discount?.amount || 0), 0);
    const totalSubtotal = data.reduce((sum, o) => sum + (o.subtotal || 0), 0);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-100 p-4 rounded-sm shadow-sm">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Bills with Discounts</div>
            <div className="text-lg font-black text-slate-900 mt-1">{maskQuantity(data.length)}</div>
          </div>
          <div className="bg-white border border-slate-100 p-4 rounded-sm shadow-sm">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Subtotal</div>
            <div className="text-lg font-black text-slate-900 mt-1">₹{maskCurrency(totalSubtotal).toLocaleString()}</div>
          </div>
          <div className="bg-white border border-slate-100 p-4 rounded-sm shadow-sm">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Discount Offered</div>
            <div className="text-lg font-black text-rose-500 mt-1">₹{maskCurrency(totalDiscount).toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-sm shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Bill No</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Biller</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Subtotal</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Disc Type</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Disc Value</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Disc Amount</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Reason</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Grand Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-[11px] font-bold text-slate-600">
                {data.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3 font-black text-slate-900">{o.orderNumber}</td>
                    <td className="px-6 py-3">{o.completedAt ? new Date(o.completedAt).toLocaleString() : '-'}</td>
                    <td className="px-6 py-3">{o.biller?.name || 'Admin'}</td>
                    <td className="px-6 py-3 text-right tabular-nums">₹{maskCurrency(o.subtotal || 0).toLocaleString()}</td>
                    <td className="px-6 py-3"><span className="px-2 py-0.5 bg-rose-50 text-rose-800 rounded-full text-[8px] font-black">{o.discount?.type || 'FLAT'}</span></td>
                    <td className="px-6 py-3 text-right tabular-nums">{maskQuantity(o.discount?.value || 0)}</td>
                    <td className="px-6 py-3 text-right text-rose-500 font-bold tabular-nums">₹{maskCurrency(o.discount?.amount || 0).toLocaleString()}</td>
                    <td className="px-6 py-3 font-semibold text-slate-700">{o.discount?.reason || 'N/A'}</td>
                    <td className="px-6 py-3 text-right font-black text-slate-900 tabular-nums">₹{maskCurrency(o.totalAmount || 0).toLocaleString()}</td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan="9" className="px-6 py-8 text-center text-slate-300 uppercase tracking-widest text-[9px] font-black">No discount transactions recorded in period</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderTaxTable = () => {
    if (!Array.isArray(data)) return null;
    const totalSales = data.reduce((sum, t) => sum + (t.totalSales || 0), 0);
    const totalTaxable = data.reduce((sum, t) => sum + (t.taxableAmount || 0), 0);
    const totalCGST = data.reduce((sum, t) => sum + (t.cgst || 0), 0);
    const totalSGST = data.reduce((sum, t) => sum + (t.sgst || 0), 0);
    const totalTax = data.reduce((sum, t) => sum + (t.totalTax || 0), 0);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-100 p-4 rounded-sm shadow-sm">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Base Taxable Sales</div>
            <div className="text-lg font-black text-slate-900 mt-1">₹{maskCurrency(totalTaxable).toLocaleString()}</div>
          </div>
          <div className="bg-white border border-slate-100 p-4 rounded-sm shadow-sm">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total CGST Collected</div>
            <div className="text-lg font-black text-blue-600 mt-1">₹{maskCurrency(totalCGST).toLocaleString()}</div>
          </div>
          <div className="bg-white border border-slate-100 p-4 rounded-sm shadow-sm">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total SGST Collected</div>
            <div className="text-lg font-black text-purple-600 mt-1">₹{maskCurrency(totalSGST).toLocaleString()}</div>
          </div>
          <div className="bg-white border border-slate-100 p-4 rounded-sm shadow-sm">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Tax Provision</div>
            <div className="text-lg font-black text-emerald-600 mt-1">₹{maskCurrency(totalTax).toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-sm shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Taxable Base</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">CGST Collected</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">SGST Collected</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Total Tax</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Total Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-[11px] font-bold text-slate-600">
                {data.map((t, idx) => (
                  <tr key={t._id || idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3 font-black text-slate-900">{t._id}</td>
                    <td className="px-6 py-3 text-right tabular-nums">₹{maskCurrency(t.taxableAmount || 0).toLocaleString()}</td>
                    <td className="px-6 py-3 text-right tabular-nums text-blue-600">₹{maskCurrency(t.cgst || 0).toLocaleString()}</td>
                    <td className="px-6 py-3 text-right tabular-nums text-purple-600">₹{maskCurrency(t.sgst || 0).toLocaleString()}</td>
                    <td className="px-6 py-3 text-right tabular-nums text-emerald-600 font-black">₹{maskCurrency(t.totalTax || 0).toLocaleString()}</td>
                    <td className="px-6 py-3 text-right font-black text-slate-900 tabular-nums">₹{maskCurrency(t.totalSales || 0).toLocaleString()}</td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-300 uppercase tracking-widest text-[9px] font-black">No tax records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderHourlyTable = () => {
    if (!Array.isArray(data)) return null;
    const avgOrders = data.length > 0 ? data.reduce((s, h) => s + h.orderCount, 0) / data.length : 0;

    return (
      <div className="bg-white border border-slate-100 rounded-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Time Interval</th>
                <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Orders Completed</th>
                <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Revenue Generated</th>
                <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Peak Traffic Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[11px] font-bold text-slate-600">
              {data.map((h) => {
                const isPeak = h.orderCount >= avgOrders && h.orderCount > 1;
                return (
                  <tr key={h._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3 font-black text-slate-900">{h._id}:00 - {h._id + 1}:00</td>
                    <td className="px-6 py-3 text-right tabular-nums font-black text-slate-900">{maskQuantity(h.orderCount)}</td>
                    <td className="px-6 py-3 text-right tabular-nums">₹{maskCurrency(h.revenue || 0).toLocaleString()}</td>
                    <td className="px-6 py-3 text-center">
                      <span className={`px-3 py-0.5 rounded-full text-[8px] font-black border ${
                        isPeak 
                          ? 'bg-rose-50 text-rose-800 border-rose-100' 
                          : 'bg-slate-50 text-slate-500 border-slate-100'
                      }`}>
                        {isPeak ? 'PEAK TRAFFIC' : 'NORMAL'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {data.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-300 uppercase tracking-widest text-[9px] font-black">No traffic data recorded</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderReportContent = () => {
    if (activeReport === 'summary') {
      return (
        <>
          {/* KPI Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-100 p-6 rounded-sm shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:bg-slate-100" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gross Revenue</span>
                <TrendingUp size={14} className="text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tighter mb-1">₹{maskCurrency(data.summary.totalRevenue).toLocaleString()}</div>
              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Aggregate Transaction Value</div>
            </div>

            <div className="bg-white border border-slate-100 p-6 rounded-sm shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:bg-slate-100" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Net Revenue</span>
                <DollarSign size={14} className="text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tighter mb-1">₹{maskCurrency(data.summary.netRevenue).toLocaleString()}</div>
              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Base Price Exclusive of Tax</div>
            </div>

            <div className="bg-white border border-slate-100 p-6 rounded-sm shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:bg-slate-100" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Orders</span>
                <FileText size={14} className="text-slate-400" />
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tighter mb-1">{maskQuantity(data.summary.orderCount)}</div>
              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Orders Finalized In Period</div>
            </div>

            <div className="bg-white border border-slate-100 p-6 rounded-sm shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:bg-slate-100" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Avg Transaction</span>
                <BarChart3 size={14} className="text-slate-400" />
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tighter mb-1">₹{maskCurrency(Math.round(data.summary.avgOrderValue || 0)).toLocaleString()}</div>
              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Mean Ticket Size</div>
            </div>
          </div>

          {/* Charts Section 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white border border-slate-100 rounded-sm shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">Revenue Trajectory</h3>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Daily growth performance visualization</p>
                </div>
                <div className="bg-slate-50 px-2 py-1 rounded text-[8px] font-black uppercase text-slate-500 tracking-widest">30 Day Trend</div>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={maskedTrends}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0F172A" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="_id" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fontWeight: 700, fill: '#94A3B8' }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fontWeight: 700, fill: '#94A3B8' }}
                      tickFormatter={(val) => `₹${val/1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0F172A', 
                        border: 'none', 
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '10px',
                        fontWeight: '900',
                        textTransform: 'uppercase'
                      }}
                      itemStyle={{ color: '#fff' }}
                      cursor={{ stroke: '#0F172A', strokeWidth: 1 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#0F172A" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-sm shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">Top Performance (Items)</h3>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">High volume inventory performance</p>
                </div>
                <TrendingUp size={16} className="text-slate-400" />
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={maskedTopItems} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fontWeight: 700, fill: '#475569' }}
                      width={100}
                    />
                    <Tooltip 
                      cursor={{ fill: '#F8FAFC' }}
                      contentStyle={{ 
                        backgroundColor: '#0F172A', 
                        border: 'none', 
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '10px'
                      }}
                    />
                    <Bar 
                      dataKey="quantity" 
                      fill="#0F172A" 
                      radius={[0, 4, 4, 0]} 
                      barSize={12}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Section 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white border border-slate-100 rounded-sm shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">Payment Matrix</h3>
                <PieChartIcon size={16} className="text-slate-400" />
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={maskedPaymentBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="revenue"
                      nameKey="_id"
                    >
                      {maskedPaymentBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend 
                      layout="vertical" 
                      verticalAlign="middle" 
                      align="right"
                      iconType="circle"
                      wrapperStyle={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-sm shadow-sm p-6 space-y-6 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">Hourly Load Velocity</h3>
                <Clock size={16} className="text-slate-400" />
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={maskedHourlySales}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="_id" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fontWeight: 700, fill: '#94A3B8' }}
                      tickFormatter={(val) => `${val}:00`}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fontWeight: 700, fill: '#94A3B8' }}
                    />
                    <Tooltip />
                    <Bar 
                      dataKey="orders" 
                      fill="#64748B" 
                      radius={[4, 4, 0, 0]} 
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Tables Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white border border-slate-100 rounded-sm shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle size={14} className="text-blue-500" />
                  Tax Provision Reserved
                </h3>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Tax Component</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Aggregate Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {maskedTaxSummary.map((tax, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-[11px] font-black text-slate-700 uppercase">{tax._id}</td>
                      <td className="px-6 py-4 text-[11px] font-black text-slate-900 text-right tabular-nums">₹{tax.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  {maskedTaxSummary.length === 0 && (
                    <tr>
                      <td colSpan="2" className="px-6 py-8 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">No tax data for period</td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-50">
                  <tr>
                    <td className="px-6 py-4 text-[10px] font-black text-slate-900 uppercase">Total Compliance</td>
                    <td className="px-6 py-4 text-[12px] font-black text-slate-900 text-right">₹{maskCurrency(data.summary.taxAmount).toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="bg-white border border-slate-100 rounded-sm shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle size={14} className="text-rose-500" />
                  Cancellation Log Analytics
                </h3>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Reason Manifest</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Count</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Lost Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {maskedCancellations.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-[10px] font-bold text-slate-600 uppercase">{c._id || 'UNSPECIFIED'}</td>
                      <td className="px-6 py-4 text-[11px] font-black text-slate-900 text-right tabular-nums">{c.count}</td>
                      <td className="px-6 py-4 text-[11px] font-black text-rose-500 text-right tabular-nums">₹{c.potentialRevenue.toLocaleString()}</td>
                    </tr>
                  ))}
                  {maskedCancellations.length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">Zero cancellations recorded</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      );
    }

    switch (activeReport) {
      case 'bills':
        return renderBillsTable();
      case 'items':
        return renderItemsTable();
      case 'categories':
        return renderCategoriesTable();
      case 'cashiers':
        return renderCashiersTable();
      case 'waiters':
        return renderWaitersTable();
      case 'cancellations':
        return renderCancellationsTable();
      case 'discounts':
        return renderDiscountsTable();
      case 'tax':
        return renderTaxTable();
      case 'hourly':
        return renderHourlyTable();
      default:
        return null;
    }
  };

  if (loading && !data) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Synchronizing Intelligence Streams...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <AlertCircle size={48} className="text-rose-500 mb-4" />
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">System Analytics Failure</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{error}</p>
        <button 
          onClick={fetchData}
          className="mt-6 px-8 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-sm"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const COLORS = ['#0F172A', '#334155', '#64748B', '#94A3B8', '#CBD5E1'];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header & Filters */}
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Sales Intelligence</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Fiscal Metrics & Revenue Performance</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={exportCsv}
              className="h-10 px-6 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95 transition-all outline-none"
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Report Types Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4">
          {[
            { id: 'summary', name: 'Overview', icon: BarChart3 },
            { id: 'bills', name: 'Bill-Wise', icon: FileText },
            { id: 'items', name: 'Item-Wise', icon: ShoppingBag },
            { id: 'categories', name: 'Category-Wise', icon: TableIcon },
            { id: 'cashiers', name: 'Cashier-Wise', icon: Users },
            { id: 'waiters', name: 'Waiter-Wise', icon: Users },
            { id: 'cancellations', name: 'Cancellations', icon: AlertCircle },
            { id: 'discounts', name: 'Discounts', icon: DollarSign },
            { id: 'tax', name: 'Tax Provisions', icon: AlertCircle },
            { id: 'hourly', name: 'Hourly Traffic', icon: Clock }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeReport === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setData(null);
                  setActiveReport(tab.id);
                }}
                className={`h-9 px-4 rounded-sm text-[10px] font-black uppercase tracking-wider flex items-center gap-2 border transition-all active:scale-95 ${
                  isActive
                    ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                    : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon size={12} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 bg-white p-4 border border-slate-100 rounded-sm shadow-sm">
          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
            <input 
              type="date" 
              name="startDate"
              value={tempFilters.startDate}
              onChange={handleFilterChange}
              className="w-full h-8 px-2 border border-slate-200 rounded-sm text-[10px] font-bold outline-none focus:border-slate-900 transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">End Date</label>
            <input 
              type="date" 
              name="endDate"
              value={tempFilters.endDate}
              onChange={handleFilterChange}
              className="w-full h-8 px-2 border border-slate-200 rounded-sm text-[10px] font-bold outline-none focus:border-slate-900 transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Payment</label>
            <select 
              name="paymentMethod"
              value={tempFilters.paymentMethod}
              onChange={handleFilterChange}
              className="w-full h-8 px-2 border border-slate-200 rounded-sm text-[10px] font-bold outline-none focus:border-slate-900 transition-all"
            >
              <option value="">All Methods</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Type</label>
            <select 
              name="orderType"
              value={tempFilters.orderType}
              onChange={handleFilterChange}
              className="w-full h-8 px-2 border border-slate-200 rounded-sm text-[10px] font-bold outline-none focus:border-slate-900 transition-all"
            >
              <option value="">All Types</option>
              <option value="DINE-IN">Dine-In</option>
              <option value="CAR-SERVICE">Car Service</option>
              <option value="PICKUP">Pickup</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Waiter</label>
            <select 
              name="waiter"
              value={tempFilters.waiter}
              onChange={handleFilterChange}
              className="w-full h-8 px-2 border border-slate-200 rounded-sm text-[10px] font-bold outline-none focus:border-slate-900 transition-all"
            >
              <option value="">All Waiters</option>
              {options.waiters.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Biller</label>
            <select 
              name="biller"
              value={tempFilters.biller}
              onChange={handleFilterChange}
              className="w-full h-8 px-2 border border-slate-200 rounded-sm text-[10px] font-bold outline-none focus:border-slate-900 transition-all"
            >
              <option value="">All Billers</option>
              {options.billers.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => setFilters({ ...tempFilters })}
              className="w-full h-8 bg-slate-100 text-slate-900 rounded-sm text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {renderReportContent()}
    </div>
  );
}
