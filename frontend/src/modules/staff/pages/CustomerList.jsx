import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Star, Plus, Phone, Calendar, ChevronRight } from 'lucide-react';
import { StaffNavbar } from '../components/StaffNavbar';
import { useNavigate } from 'react-router-dom';

const MOCK_CUSTOMERS = [
  { id: 1, name: 'Rahul Sharma', phone: '+91 98765 43210', points: 450, lastVisit: 'Yesterday' },
  { id: 2, name: 'Priya Patel', phone: '+91 87654 32109', points: 1200, lastVisit: '3 days ago' },
  { id: 3, name: 'Amit Verma', phone: '+91 76543 21098', points: 0, lastVisit: 'Never' },
  { id: 4, name: 'Sonia Gill', phone: '+91 65432 10987', points: 2800, lastVisit: 'Joined Today' },
];

export default function CustomerList() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filteredCustomers = MOCK_CUSTOMERS.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-100 px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Guests</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Customer Directory</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/staff/customers/add')}
            className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/20"
          >
            <Plus size={24} />
          </motion.button>
        </div>

        <div className="relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
          <input 
            type="text" 
            placeholder="Search name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold outline-none focus:ring-4 focus:ring-slate-900/5 focus:bg-white transition-all"
          />
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full bg-white shadow-xl shadow-slate-200/50 p-6 pb-32">
        <div className="space-y-4">
          {filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center">
              <Users size={64} strokeWidth={1} className="mb-4" />
              <p className="text-xs font-black uppercase tracking-widest">No Guests Found</p>
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <motion.div
                key={customer.id}
                whileTap={{ scale: 0.98 }}
                className="p-5 rounded-[2rem] border border-slate-100 bg-slate-50/50 flex items-center justify-between group hover:bg-white hover:shadow-xl hover:shadow-slate-900/5 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 font-black text-xl shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    {customer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 tracking-tight leading-none mb-2">{customer.name}</h3>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 opacity-60">
                        <Phone size={10} />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-60">
                        <Calendar size={10} />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Last: {customer.lastVisit}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-50 border border-yellow-100">
                    <Star size={10} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-[10px] font-black text-yellow-700">{customer.points}</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>

      <StaffNavbar activeTab="customers" />
    </div>
  );
}

