import { signOut } from 'firebase/auth';
import { useNavigate, NavLink } from 'react-router-dom';
import { LogOut, LayoutDashboard, ShoppingBag, Receipt } from 'lucide-react';
import { auth } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import MezoWordmark from '../brand/MezoWordmark';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Inicio',    Icon: LayoutDashboard },
  { to: '/pos',       label: 'POS',       Icon: Receipt },
  { to: '/productos', label: 'Productos', Icon: ShoppingBag },
];

export default function Navbar() {
  const { user, negocio } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut(auth);
    navigate('/login');
  }

  return (
    <header className="bg-mezo-ink border-b border-mezo-ink-line px-8 flex items-center justify-between sticky top-0 z-30" style={{ height: 64 }}>
      <div className="flex items-center gap-10">
        <MezoWordmark height={50} color="#C8903F" />
        <nav className="hidden sm:flex items-center gap-1">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-mezo-sm font-medium transition`
                + ` text-[15px]`
                + (isActive
                  ? ' bg-mezo-ink-muted text-mezo-gold'
                  : ' text-mezo-cream-dim hover:text-mezo-cream hover:bg-mezo-ink-raised')
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-5">
        <span className="text-base text-mezo-cream-dim hidden md:block font-body">
          {negocio?.nombre ?? user?.email}
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
