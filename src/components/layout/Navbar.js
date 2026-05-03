import { useNavigate, NavLink } from 'react-router-dom';
import { LogOut, Home, ShoppingBag, Receipt, LayoutGrid, BarChart2, Users, Settings, Calculator, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEmployee } from '../../context/EmployeeContext';
import MezoWordmark from '../brand/MezoWordmark';

const NAV_ITEMS_BASE = [
  { to: '/dashboard',    label: 'Inicio',    Icon: Home,           roles: null },
  { to: '/pos',          label: 'POS',       Icon: Receipt,        roles: null },
  { to: '/mesas',        label: 'Mesas',     Icon: LayoutGrid,     roles: null },
  { to: '/productos',    label: 'Productos', Icon: ShoppingBag,    roles: null },
  { to: '/arqueo',       label: 'Caja',      Icon: Calculator,     roles: null },
  { to: '/reportes',     label: 'Reportes',  Icon: BarChart2,      roles: null },
  { to: '/empleados',    label: 'Equipo',    Icon: Users,          roles: null },
  { to: '/mensajes',     label: 'Mensajes',  Icon: MessageCircle,  roles: null },
  { to: '/configuracion',label: 'Config',    Icon: Settings,       roles: null },
];

export default function Navbar() {
  const { user, negocio, logout } = useAuth();
  const { tieneRol }              = useEmployee();
  const navigate = useNavigate();

  function handleLogout() {
    // Navegar primero — si logout va antes, ProtectedRoute detecta !user y redirige a /login
    navigate('/', { replace: true });
    logout();
  }

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
                `relative flex items-center gap-2 px-4 py-2 rounded-mezo-sm font-medium transition`
                + ` text-[15px]`
                + (isActive
                  ? ' bg-mezo-ink-muted text-mezo-gold'
                  : ' text-mezo-cream-dim hover:text-mezo-cream hover:bg-mezo-ink-raised')
              }
            >
              <Icon size={16} />
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

      <div className="flex items-center gap-5">
        <span className="text-base text-mezo-cream-dim hidden md:block font-body">
          {negocio?.name ?? user?.email}
        </span>
        <div className="hidden md:block w-px h-5 bg-mezo-ink-line" />

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-base text-mezo-stone hover:text-mezo-rojo transition"
        >
          <LogOut size={16} />
          <span className="hidden sm:block">Salir</span>
        </button>
      </div>
    </header>
  );
}
