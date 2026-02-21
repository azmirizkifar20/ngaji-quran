import { NavLink } from 'react-router-dom';
import { BookOpen, Home as HomeIcon, Target, Trophy } from 'lucide-react';

const Item = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-1 items-center justify-center gap-2 rounded-xl2 px-3 py-3 text-sm font-medium ${
        isActive ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-50'
      }`
    }
  >
    <Icon size={18} />
    <span className="hidden sm:inline">{label}</span>
  </NavLink>
);

export default function NavBar() {
  return (
    <div className="fixed bottom-4 left-0 right-0 mx-auto max-w-[560px] px-4">
      <div className="rounded-xl2 border border-zinc-100 bg-white/90 p-2 shadow-soft backdrop-blur">
        <div className="flex gap-2">
          <Item to="/" icon={HomeIcon} label="Home" />
          <Item to="/read" icon={BookOpen} label="Read" />
          <Item to="/goals" icon={Target} label="Goals" />
          <Item to="/leaderboard" icon={Trophy} label="Leaderboard" />
        </div>
      </div>
    </div>
  );
}
