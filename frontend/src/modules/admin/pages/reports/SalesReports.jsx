import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, Download, Calendar, ArrowUpRight, 
  ArrowDownLeft, TrendingUp, DollarSign, Filter,
  PieChart as PieChartIcon, Clock, AlertCircle,
  FileText, Users, MapPin, Table as TableIcon
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area,
  BarChart, Bar, PieChart, Cell, Pie, Legend
} from 'recharts';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export default function SalesReports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    orderType: '',
    waiter: '',
    table: '',
    outlet: ''
  });

  // Filter Options (to be fetched)
  const [options, setOptions] = useState({
    waiters: [],
    tables: [],
    outlets: ['Main Outlet (Sadar)']
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_access');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: filters
      };

      const [reportRes, staffRes, tableRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/reports/sales`, config),
        axios.get(`${API_BASE_URL}/staff`, config),
        axios.get(`${API_BASE_URL}/tables`, config)
      ]);

      setData(reportRes.data);
      setOptions(prev => ({
        ...prev,
        waiters: staffRes.data,
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
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
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
            <button className="h-10 px-6 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95 transition-all outline-none">
              <Download size={14} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 bg-white p-4 border border-slate-100 rounded-sm shadow-sm">
          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
            <input 
              type="date" 
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full h-8 px-2 border border-slate-200 rounded-sm text-[10px] font-bold outline-none focus:border-slate-900 transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">End Date</label>
            <input 
              type="date" 
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full h-8 px-2 border border-slate-200 rounded-sm text-[10px] font-bold outline-none focus:border-slate-900 transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Payment</label>
            <select 
              name="paymentMethod"
              value={filters.paymentMethod}
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
              value={filters.orderType}
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
              value={filters.waiter}
              onChange={handleFilterChange}
              className="w-full h-8 px-2 border border-slate-200 rounded-sm text-[10px] font-bold outline-none focus:border-slate-900 transition-all"
            >
              <option value="">All Waiters</option>
              {options.waiters.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Outlet</label>
            <select 
              name="outlet"
              value={filters.outlet}
              onChange={handleFilterChange}
              className="w-full h-8 px-2 border border-slate-200 rounded-sm text-[10px] font-bold outline-none focus:border-slate-900 transition-all"
            >
              {options.outlets.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={fetchData}
              className="w-full h-8 bg-slate-100 text-slate-900 rounded-sm text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-100 p-6 rounded-sm shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:bg-slate-100" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gross Revenue</span>
            <TrendingUp size={14} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tighter mb-1">₹{data.summary.totalRevenue.toLocaleString()}</div>
          <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Aggregate Transaction Value</div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-sm shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:bg-slate-100" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Net Revenue</span>
            <DollarSign size={14} className="text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tighter mb-1">₹{data.summary.netRevenue.toLocaleString()}</div>
          <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Base Price Exclusive of Tax</div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-sm shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:bg-slate-100" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Orders</span>
            <FileText size={14} className="text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tighter mb-1">{data.summary.orderCount}</div>
          <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Orders Finalized In Period</div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-sm shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:bg-slate-100" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Avg Transaction</span>
            <BarChart3 size={14} className="text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tighter mb-1">₹{Math.round(data.summary.avgOrderValue || 0).toLocaleString()}</div>
          <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Mean Ticket Size</div>
        </div>
      </div>

      {/* Charts Section 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Trend */}
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
              <AreaChart data={data.trends}>
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

        {/* Top Items */}
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
              <BarChart data={data.topItems} layout="vertical">
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
        {/* Payment Breakdown */}
        <div className="bg-white border border-slate-100 rounded-sm shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">Payment Matrix</h3>
            <PieChartIcon size={16} className="text-slate-400" />
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.paymentBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="revenue"
                >
                  {data.paymentBreakdown.map((entry, index) => (
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

        {/* Hourly Traffic */}
        <div className="bg-white border border-slate-100 rounded-sm shadow-sm p-6 space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">Hourly Load Velocity</h3>
            <Clock size={16} className="text-slate-400" />
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.hourlySales}>
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
        {/* Tax Compliance */}
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
              {data.taxSummary.map((tax, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-[11px] font-black text-slate-700 uppercase">{tax._id}</td>
                  <td className="px-6 py-4 text-[11px] font-black text-slate-900 text-right tabular-nums">₹{tax.amount.toLocaleString()}</td>
                </tr>
              ))}
              {data.taxSummary.length === 0 && (
                <tr>
                  <td colSpan="2" className="px-6 py-8 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">No tax data for period</td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-slate-50">
              <tr>
                <td className="px-6 py-4 text-[10px] font-black text-slate-900 uppercase">Total Compliance</td>
                <td className="px-6 py-4 text-[12px] font-black text-slate-900 text-right">₹{data.summary.taxAmount.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Cancellation Analytics */}
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
              {data.cancellations.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-[10px] font-bold text-slate-600 uppercase">{c._id || 'UNSPECIFIED'}</td>
                  <td className="px-6 py-4 text-[11px] font-black text-slate-900 text-right tabular-nums">{c.count}</td>
                  <td className="px-6 py-4 text-[11px] font-black text-rose-500 text-right tabular-nums">₹{c.potentialRevenue.toLocaleString()}</td>
                </tr>
              ))}
              {data.cancellations.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">Zero cancellations recorded</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
