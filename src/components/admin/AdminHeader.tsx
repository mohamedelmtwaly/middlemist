import { Menu, Search, Bell, LogOut } from 'lucide-react';
import { signOut } from '@/lib/use-auth';
import { useNavigate } from '@tanstack/react-router';

interface AdminHeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

export function AdminHeader({ onMenuClick, sidebarOpen }: AdminHeaderProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate({ to: '/admin/login' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-[#5E6B2F]/20 flex items-center justify-between px-3 sm:px-4 md:px-6">
      {/* Left Side - Menu Toggle */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-[#5E6B2F]/10 transition-colors"
        >
          <Menu className="h-5 w-5 text-[#5E6B2F]" />
        </button>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex items-center">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5E6B2F]" />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-48 lg:w-64 pr-10 pl-4 py-2 rounded-lg border border-[#5E6B2F]/30 bg-[#F5F5F0] text-[#282A18] placeholder:text-[#77796D] focus:outline-none focus:ring-2 focus:ring-[#5E6B2F]/20 focus:border-[#5E6B2F] transition-colors text-sm"
            />
          </div>
        </div>
      </div>

      {/* Right Side - Notifications & Logout */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-[#5E6B2F]/10 transition-colors relative">
          <Bell className="h-4 sm:h-5 w-4 sm:w-5 text-[#5E6B2F]" />
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-[#5E6B2F]/20 hover:bg-[#5E6B2F]/10 rounded-lg px-2 sm:px-3 py-2 transition-colors"
        >
          <LogOut className="h-4 w-4 sm:h-5 sm:w-5 text-[#5E6B2F]" />
          <span className="hidden sm:block text-xs sm:text-sm font-semibold text-[#282A18]">تسجيل الخروج</span>
        </button>
      </div>
    </header>
  );
}
