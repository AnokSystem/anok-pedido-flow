import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ChevronRight, 
  Home, 
  Users, 
  Package, 
  FileText, 
  Settings, 
  HelpCircle,
  Menu,
  LayoutDashboard,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

type NavItemProps = {
  to: string;
  icon: React.ElementType;
  label: string;
  collapsed: boolean;
};

const NavItem = ({ to, icon: Icon, label, collapsed }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link 
            to={to} 
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
              isActive 
                ? "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80" 
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="w-5 h-5" />
            {!collapsed && <span className="animate-fade-in">{label}</span>}
          </Link>
        </TooltipTrigger>
        {collapsed && (
          <TooltipContent side="right">
            {label}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<{ first_name?: string; last_name?: string } | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email);
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();
        setProfile(profileData);
      }
    };

    fetchProfile();
  }, []);

  const getInitials = () => {
    if (profile?.first_name || profile?.last_name) {
      return `${(profile.first_name?.[0] || '').toUpperCase()}${(profile.last_name?.[0] || '').toUpperCase()}`;
    }
    return email ? email[0].toUpperCase() : 'A';
  };

  const getDisplayName = () => {
    if (profile?.first_name || profile?.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return 'Admin';
  };

  return (
    <div 
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border sticky top-0 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="anok-logo animate-fade-in">Anok</div>
        )}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent/50"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto anok-scrollbar">
        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} />
        <NavItem to="/clientes" icon={Users} label="Clientes" collapsed={collapsed} />
        <NavItem to="/produtos" icon={Package} label="Produtos" collapsed={collapsed} />
        <NavItem to="/pedidos" icon={FileText} label="Pedidos" collapsed={collapsed} />
        <NavItem to="/perfil" icon={User} label="Meu Perfil" collapsed={collapsed} />
        <NavItem to="/configuracoes" icon={Settings} label="Configurações" collapsed={collapsed} />
        <NavItem to="/ajuda" icon={HelpCircle} label="Ajuda" collapsed={collapsed} />
      </nav>

      <div className="p-2 border-t border-sidebar-border">
        <div className="flex items-center gap-3 p-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-anok-500 text-white">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 animate-fade-in min-w-0">
              <p className="text-sm font-medium truncate">{getDisplayName()}</p>
              <p className="text-xs text-sidebar-foreground/70 truncate">{email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
