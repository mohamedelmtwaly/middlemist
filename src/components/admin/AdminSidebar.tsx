import { Link } from '@tanstack/react-router';
import { 
  LayoutDashboard,
  Package,
  Folder,
  LogOut,
  X
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { signOut } from '@/lib/use-auth';
import { useRouter } from '@tanstack/react-router';
import logo from '@/assets/logo-middlemist-transparent.png';

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentPage: string;
  isMobile: boolean;
}

const menuItems = [
  { path: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard },
  { path: '/admin/products', label: 'المنتجات', icon: Package },
  { path: '/admin/categories', label: 'التصنيفات', icon: Folder },
];

export function AdminSidebar({ isOpen, onToggle, currentPage, isMobile }: AdminSidebarProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      await queryClient.invalidateQueries({ queryKey: ['auth'] });
      router.navigate({ to: '/admin/login' });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 right-0 z-50
          bg-[#282A18] text-white
          transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64 translate-x-0' : 'w-20 translate-x-full lg:translate-x-0'}
          ${isMobile ? 'translate-x-0' : ''}
        `}
      >
        {/* Logo Section */}
        <div className="h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6 border-b border-white/10">
          <div className="flex items-center gap-2 sm:gap-3">
            <img 
              src={logo} 
              alt="Middlemist Flower" 
              className="h-7 w-auto sm:h-8 object-contain"
            />
            {isOpen && (
              <span className="font-semibold text-sm sm:text-base hidden sm:block">Middlemist Flower</span>
            )}
          </div>
          
          {/* Close button for mobile */}
          {isMobile && (
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = currentPage === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={isMobile ? onToggle : undefined}
                className={`
                  flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all
                  ${isActive 
                    ? 'bg-[#5E6B2F] text-white shadow-md' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                {isOpen && (
                  <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 sm:p-4 border-t border-white/10">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-white/70 hover:bg-red-500/20 hover:text-red-400 transition-all"
          >
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            {isOpen && (
              <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                تسجيل الخروج
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
