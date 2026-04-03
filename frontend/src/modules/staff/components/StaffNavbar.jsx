import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutGrid, 
  Map, 
  ClipboardList, 
  Users, 
  UserCircle 
} from 'lucide-react';

export function StaffNavbar({ activeTab }) {
  const navigate = useNavigate();

  const tabs = [
    { id: 'dashboard', icon: LayoutGrid, label: 'Home', path: '/staff/dashboard' },
    { id: 'tables', icon: Map, label: 'Tables', path: '/staff/tables' },
    { id: 'orders', icon: ClipboardList, label: 'Orders', path: '/staff/active-orders' },
    { id: 'customers', icon: Users, label: 'Guests', path: '/staff/customers' },
    { id: 'profile', icon: UserCircle, label: 'Me', path: '/staff/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-staff-card border-t border-staff-border pb-safe">
      <nav className="max-w-lg mx-auto px-6 py-3 flex items-center justify-between">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-1 flex-1 transition-all ${
                isActive ? 'text-staff-text-primary' : 'text-staff-text-muted'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-staff-primary text-staff-text-white shadow-lg shadow-staff-primary/20' : ''}`}>
                <tab.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="nav-pill"
                  className="w-1 h-1 rounded-full bg-staff-primary absolute -bottom-1"
                />
              )}
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
}

