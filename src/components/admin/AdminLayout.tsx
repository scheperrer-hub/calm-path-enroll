import { Link, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Kanban, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function AdminLayout() {
  const { t } = useTranslation();
  const { user, userRole, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: '/app', icon: LayoutDashboard, label: t('admin.dashboard') },
    { path: '/app/anmeldungen', icon: ClipboardList, label: t('admin.registrations') },
    { path: '/app/board', icon: Kanban, label: t('admin.board') },
    ...(userRole === 'admin' ? [{ path: '/app/users', icon: Users, label: t('admin.users') }] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="lg:hidden bg-charcoal text-cream px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-warm-orange flex items-center justify-center">
            <span className="text-charcoal font-serif font-bold">B</span>
          </div>
          <span className="font-serif">Buddhayana CRM</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-charcoal text-cream transform transition-transform lg:translate-x-0 lg:static lg:inset-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-6 border-b border-charcoal-light hidden lg:block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-warm-orange flex items-center justify-center">
                <span className="text-charcoal font-serif text-xl font-bold">B</span>
              </div>
              <div>
                <span className="font-serif text-lg block">Buddhayana</span>
                <span className="text-xs text-cream/60">CRM</span>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  location.pathname === item.path
                    ? "bg-warm-orange text-charcoal"
                    : "text-cream/70 hover:bg-charcoal-light hover:text-cream"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-charcoal-light">
            <div className="mb-4 px-4">
              <p className="text-xs text-cream/50 truncate">{user?.email}</p>
              <p className="text-xs text-warm-orange capitalize">{userRole || 'User'}</p>
            </div>
            <div className="flex items-center gap-2 px-2">
              <LanguageSwitcher />
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="flex-1 text-cream/70 hover:text-cream hover:bg-charcoal-light"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t('nav.logout')}
              </Button>
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-h-screen lg:ml-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}