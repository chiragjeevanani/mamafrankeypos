import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, ShoppingBag, Clock, CheckCircle2, 
  ArrowUpRight, ArrowDownRight, Utensils, Users,
  Table, ChefHat, CreditCard, AlertCircle, BarChart3,
  Package, Truck, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_STATS_HISTORY } from '../data/adminData';
import { maskCurrency, maskQuantity, calculateMaskedOrderTotal } from '../utils/dataMask';
import api from '../../../utils/api';
import { playClickSound } from '../../pos/utils/sounds';


export default function AdminDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const now = new Date();

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await api.get('/dashboard/stats');
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const [recentOrders, setRecentOrders] = useState([]);
  
  React.useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const { data } = await api.get('/orders');
        setRecentOrders(data.slice(0, 5));
      } catch (error) {
        console.error("Error fetching recent orders:", error);
      }
    };
    fetchRecentOrders();
  }, []);

  const handleExportReport = () => {
    playClickSound();
    if (!dashboardData) return;

    const sections = [];

    // Section 1: Summary Metrics
    sections.push([
      "OPERATIONS REPORT - SUMMARY",
      new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    ]);
    sections.push(["Metric", "Value"]);
    sections.push(["Today's Revenue", `₹${maskCurrency(dashboardData.sales.today.total).toLocaleString()}`]);
    sections.push(["MTD Sales", `₹${maskCurrency(dashboardData.sales.month.total).toLocaleString()}`]);
    sections.push(["Weekly Performance", `₹${maskCurrency(dashboardData.sales.week.total).toLocaleString()}`]);
    sections.push(["Total Customers", dashboardData.customers.toString()]);
    sections.push(["MTD Expenses", `₹${dashboardData.expenses.toLocaleString()}`]);
    sections.push(["Today's Orders", `${maskQuantity(dashboardData.sales.today.count)} Units`]);
    sections.push(["Top Selling Item", dashboardData.topItems[0]?._id || "N/A"]);
    sections.push([]); // Blank row separator

    // Section 2: Top Selling Items
    sections.push(["TOP SELLING ITEMS (CURRENT MONTH)"]);
    sections.push(["Item Name", "Quantity Sold", "Revenue"]);
    if (dashboardData.topItems && dashboardData.topItems.length > 0) {
      dashboardData.topItems.forEach(item => {
        sections.push([item._id, item.count, `₹${item.revenue.toLocaleString()}`]);
      });
    } else {
      sections.push(["No top items found", "", ""]);
    }
    sections.push([]); // Blank row separator

    // Section 3: Hourly Sales Performance
    sections.push(["HOURLY SALES (TODAY)"]);
    sections.push(["Hour", "Revenue"]);
    if (dashboardData.hourlySales && dashboardData.hourlySales.length > 0) {
      dashboardData.hourlySales.forEach(item => {
        sections.push([`${item._id}:00`, `₹${maskCurrency(item.total).toLocaleString()}`]);
      });
    } else {
      sections.push(["No hourly sales data", ""]);
    }
    sections.push([]); // Blank row separator

    // Section 4: Recent Orders
    sections.push(["RECENT ORDERS (LAST 5)"]);
    sections.push(["Order Number", "Destination", "Time", "Payment Method", "Total Amount"]);
    if (recentOrders && recentOrders.length > 0) {
      recentOrders.forEach(order => {
        const destination = order.orderType === 'DINE-IN' ? order.table?.name : order.carNumber || 'Pickup';
        const time = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const amount = `₹${calculateMaskedOrderTotal(order).toFixed(0)}`;
        sections.push([`#${order.orderNumber}`, destination, time, order.paymentMethod || "N/A", amount]);
      });
    } else {
      sections.push(["No recent orders", "", "", "", ""]);
    }

    // Convert array of arrays to CSV string
    const csvContent = sections
      .map(row => 
        row.map(cell => {
          const cellStr = cell === null || cell === undefined ? "" : String(cell);
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replaceAll('"', '""')}"`;
          }
          return cellStr;
        }).join(",")
      )
      .join("\n");

    // Create download link with UTF-8 BOM to properly support currency symbols
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `operations_report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (loading) {
    return <div className="p-8 flex items-center justify-center min-h-screen"><div className="animate-spin text-[#E1261C]"><BarChart3 size={32} /></div></div>;
  }

  if (!dashboardData) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-screen text-stone-500">
        <AlertCircle size={48} className="mb-4 text-[#E1261C]" />
        <h2 className="text-xl font-bold mb-2">Failed to load dashboard data</h2>
        <p className="text-sm">Please ensure you are logged in and the server is running.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-[#E1261C] text-white rounded-lg text-sm font-bold uppercase"
        >
          Retry
        </button>
      </div>
    );
  }

  const stats = [
    { 
      label: "Today's Revenue", value: `₹${maskCurrency(dashboardData.sales.today.total).toLocaleString()}`, trend: "Live", isUp: true, 
      icon: TrendingUp, accent: "border-amber-500", iconBg: "bg-amber-50", iconColor: "text-amber-600",
      trendBg: "bg-emerald-50 text-emerald-600"
    },
    { 
      label: "MTD Sales", value: `₹${maskCurrency(dashboardData.sales.month.total).toLocaleString()}`, trend: "MTD", isUp: true, 
      icon: ShoppingBag, accent: "border-blue-500", iconBg: "bg-blue-50", iconColor: "text-blue-600",
      trendBg: "bg-emerald-50 text-emerald-600"
    },
    { 
      label: "Total Customers", value: dashboardData.customers.toString(), trend: "Growth", isUp: true, 
      icon: Users, accent: "border-orange-500", iconBg: "bg-orange-50", iconColor: "text-orange-600",
      trendBg: "bg-orange-50 text-orange-600"
    },
    { 
      label: "MTD Expenses", value: `₹${dashboardData.expenses.toLocaleString()}`, trend: "MTD", isUp: false, 
      icon: CreditCard, accent: "border-emerald-500", iconBg: "bg-emerald-50", iconColor: "text-emerald-600",
      trendBg: "bg-rose-50 text-rose-600"
    },
  ];

  const quickStats = [
    { label: 'Today Orders', value: `${maskQuantity(dashboardData.sales.today.count)} Units`, icon: ShoppingBag, color: 'text-[#E1261C]' },
    { label: 'Weekly Performance', value: `₹${maskCurrency(dashboardData.sales.week.total).toLocaleString()}`, icon: ChefHat, color: 'text-orange-600' },
    { label: 'Top Item', value: dashboardData.topItems[0]?._id || 'N/A', icon: CreditCard, color: 'text-blue-600' },
    { label: 'Customer Base', value: `${dashboardData.customers} Total`, icon: Users, color: 'text-emerald-600' },
  ];

  const maxRevenue = Math.max(...(dashboardData.hourlySales.length > 0 ? dashboardData.hourlySales.map(d => d.total) : [1000]));

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Utensils size={18} className="text-[#E1261C]" />
            <h1 className="text-xl font-black uppercase tracking-tight text-stone-800">Today's Operations</h1>
          </div>
          <p className="text-xs text-stone-400 font-semibold">
            {now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExportReport}
            className="px-3 py-2 bg-white border border-stone-200 rounded-lg text-[11px] font-bold text-stone-500 uppercase tracking-wider hover:bg-stone-50 transition-all shadow-sm"
          >
            Export Report
          </button>
        </div>
      </div>

      {/* Quick Floor Overview Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickStats.map((qs, i) => (
          <div key={i} className="bg-white border border-stone-200 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm hover:border-stone-300 transition-all">
            <div className={`${qs.color} bg-stone-50 rounded-lg p-2 shrink-0`}>
              <qs.icon size={16} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider leading-none mb-0.5">{qs.label}</p>
              <p className="text-sm font-black text-stone-800">{qs.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.07 }}
            className={`bg-white p-5 border-l-4 ${stat.accent} border border-stone-100 rounded-xl shadow-sm hover:shadow-md transition-all group`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.iconBg} ${stat.iconColor}`}>
                <stat.icon size={18} />
              </div>
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black ${stat.trendBg}`}>
                {stat.isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {stat.trend}
              </div>
            </div>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-stone-900">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white border border-stone-200 rounded-xl shadow-sm flex flex-col min-h-[360px]">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-stone-800">Hourly Sales — Today</h3>
              <p className="text-[10px] text-stone-400 font-semibold mt-0.5">Dine-in vs Takeaway performance</p>
            </div>
          </div>
          <div className="flex-1 p-6">
            <div className="h-full w-full flex flex-col relative overflow-hidden rounded-lg">
              {/* Grid Lines */}
              <div className="absolute inset-0 pb-10 pr-4 flex flex-col justify-between pointer-events-none">
                {[1,2,3,4].map(i => <div key={i} className="w-full h-px bg-stone-100" />)}
              </div>

              {/* SVG Line Graph */}
              <div className="absolute inset-0 pb-10 pr-4">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="lineGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E1261C" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#E1261C" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {dashboardData.hourlySales.length > 1 && (
                    <>
                      <motion.path
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        d={`M 0 100 ${dashboardData.hourlySales.map((item, i) => {
                          const x = (i / (dashboardData.hourlySales.length - 1)) * 100;
                          const denominator = maskCurrency(maxRevenue) || 1;
                          const y = 98 - (maskCurrency(item.total) / denominator) * 90; 
                          return `L ${x} ${y}`;
                        }).join(' ')} L 100 100 Z`}
                        fill="url(#lineGlow)" stroke="none"
                      />
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                        d={`M 0 100 ${dashboardData.hourlySales.map((item, i) => {
                          const x = (i / (dashboardData.hourlySales.length - 1)) * 100;
                          const denominator = maskCurrency(maxRevenue) || 1;
                          const y = 98 - (maskCurrency(item.total) / denominator) * 90;
                          return `L ${x} ${y}`;
                        }).join(' ')}`}
                        fill="none" stroke="#E1261C" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"
                      />
                    </>
                  )}
                </svg>
              </div>

              {/* Interaction Layer */}
              <div className="flex-1 flex justify-between gap-0 h-full relative z-10 pr-4">
                {dashboardData.hourlySales.map((item, idx) => {
                  const maxRevenueMasked = maskCurrency(maxRevenue) || 1;
                  const itemTotalMasked = maskCurrency(item.total);
                  const yPos = 98 - (itemTotalMasked / maxRevenueMasked) * 90;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center group relative h-full">
                      <div 
                        className="absolute inset-x-0 bottom-10 transition-all duration-300 opacity-0 group-hover:opacity-100 flex flex-col items-center pointer-events-none"
                        style={{ top: `${yPos}%` }}
                      >
                        <div className="w-3 h-3 bg-white border-[2.5px] border-[#E1261C] rounded-full shadow-md -mt-1.5 z-20" />
                        <div className="w-px h-full bg-gradient-to-b from-[#E1261C]/20 to-transparent" />
                      </div>
                      <div 
                        className="absolute opacity-0 group-hover:opacity-100 transition-all duration-200 z-30 pointer-events-none"
                        style={{ top: `calc(${yPos}% - 38px)` }}
                      >
                        <div className="bg-stone-800 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                          ₹{maskCurrency(item.total).toLocaleString()}
                        </div>
                      </div>
                      <div className="mt-auto pt-2 w-full h-10 flex items-center justify-center">
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-tighter w-full text-center truncate px-1">
                          {item._id}:00
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders Panel */}
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-stone-800">Recent Orders</h3>
            <span className="text-[9px] font-bold text-stone-400 bg-stone-50 px-2 py-0.5 rounded-full border border-stone-100">Live</span>
          </div>
          <div className="p-3 space-y-1.5 flex-1 overflow-y-auto no-scrollbar">
            {recentOrders.map((order, i) => (
              <div key={order._id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-stone-50/60 hover:bg-stone-100 border border-transparent hover:border-stone-200 cursor-pointer transition-all group">
                <div className="w-8 h-8 rounded-lg bg-[#E1261C]/10 text-[#E1261C] flex items-center justify-center group-hover:bg-[#E1261C] group-hover:text-white transition-all shrink-0">
                  <ShoppingBag size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-stone-800 uppercase tracking-tight leading-none">#{order.orderNumber} — {order.orderType === 'DINE-IN' ? order.table?.name : order.carNumber || 'Pickup'}</p>
                  <p className="text-[9px] font-semibold text-stone-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {order.paymentMethod}
                  </p>
                </div>
                <span className="text-[11px] font-black text-stone-800">₹{calculateMaskedOrderTotal(order).toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-stone-100">
            <button 
              onClick={() => { playClickSound(); navigate('/admin/orders'); }}
              className="w-full py-2 bg-stone-50 text-stone-500 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-[#E1261C] hover:text-white transition-all border border-stone-200 hover:border-transparent"
            >
              Open Order History
            </button>
          </div>
        </div>
      </div>


      {/* Footer */}
      <footer className="border-t border-stone-200 pt-4 flex items-center justify-between opacity-50">
        <p className="text-[9px] font-semibold text-stone-400 uppercase tracking-widest">Time to eat System v2.4.0 · {new Date().toLocaleDateString()}</p>
        <div className="flex items-center gap-4 text-[9px] font-semibold text-stone-400 uppercase tracking-widest">
          <span className="hover:text-stone-700 cursor-pointer transition-colors">System Settings</span>
          <span className="hover:text-stone-700 cursor-pointer transition-colors">Support</span>
        </div>
      </footer>
    </div>
  );
}
