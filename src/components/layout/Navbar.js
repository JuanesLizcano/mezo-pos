import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Home, ShoppingBag, Receipt, LayoutGrid, BarChart2, Users, Calculator, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEmployee } from '../../context/EmployeeContext';
import MezoWordmark from '../brand/MezoWordmark';

const NAV_ITEMS_BASE = [
  { to: '/dashboard',    label: 'Inicio',    Icon: Home,          roles: null },
  { to: '/pos',          label: 'POS',       Icon: Receipt,       roles: null },
  { to: '/mesas',        label: 'Mesas',     Icon: LayoutGrid,    roles: null },
  { to: '/productos',    label: 'Productos', Icon: ShoppingBag,   roles: null },
  { to: '/arqueo',       label: 'Caja',      Icon: Calculator,    roles: null },
  { to: '/reportes',     label: 'Reportes',  Icon: BarChart2,     roles: null },
  { to: '/empleados',    label: 'Equipo',    Icon: Users,         roles: null },
  { to: '/mensajes',     label: 'Mensajes',  Icon: MessageCircle, roles: null },
];

export default function Navbar() {
  const { user, negocio, logout } = useAuth();
  const { tieneRol }              = useEmployee();
  const navigate                  = useNavigate();

  // Filtrar ítems según rol del empleado activo
  const navItems = NAV_ITEMS_BASE.filter(item => {
    if (!item.roles) return true;
    return item.roles.some(r => tieneRol(r));
  });

  return (
    <header className="bg-mezo-ink border-b border-mezo-ink-line px-8 flex items-center justify-between sticky top-0 z-30" style={{ height: 64 }}>
      <div className="flex items-center gap-10">
        <MezoWordmark height={50} color="#C8903F" />
        <nav className="hidden sm:flex items-center gap-1">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group relative flex items-center gap-2 px-4 py-2 rounded-mezo-sm font-medium transition`
                + ` text-[15px]`
                + (isActive
                  ? ' bg-mezo-ink-muted text-mezo-gold'
                  : ' text-mezo-cream-dim hover:text-mezo-cream hover:bg-mezo-ink-raised')
              }
            >
              <span className="transition-transform duration-150 group-hover:-translate-y-px group-hover:translate-x-px">
                <Icon size={16} />
              </span>
              {label}
              {/* Badge "próximamente" en Mensajes — feature en construcción */}
              {to === '/mensajes' && (
                <span className="absolute -top-1 -right-1 font-bold leading-none"
                  style={{ fontSize: 7, background: '#4A3F35', color: '#A89880', padding: '2px 5px', borderRadius: 3 }}>
                  pronto
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/configuracion')}
          aria-label="Configuración"
          className="group p-2 rounded-lg transition"
          style={{ color: '#9A8A78' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,236,216,0.04)'; e.currentTarget.style.color = '#C8903F'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9A8A78'; }}
        >
          <svg
            width="18" height="18" viewBox="0 0 24 24" fill="none"
            className="group-hover:rotate-45 transition-transform duration-300"
            stroke="currentColor"
          >
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" strokeWidth="1.5"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
        </button>

        <span className="text-base text-mezo-cream-dim hidden md:block font-body">
          {negocio?.name ?? user?.email}
        </span>
        <div className="hidden md:block w-px h-5 bg-mezo-ink-line" />

        <button
          onClick={logout}
          className="flex items-center gap-2 text-base text-mezo-stone hover:text-mezo-rojo transition"
        >
          <LogOut size={16} />
          <span className="hidden sm:block">Salir</span>
        </button>
      </div>
    </header>
  );
}
