import { LayoutDashboard, BookText, Users, Megaphone, Tags, Flag, MessageSquareWarning, Settings, ChevronRight, Activity, ClipboardList } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

import { useAuth } from "@/components/auth/AuthProvider";

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, roles: ["admin", "moderator"] },
  { title: "Novel", url: "/admin/novels", icon: BookText, roles: ["admin", "moderator"] },
  { title: "Genres", url: "/admin/genres", icon: Tags, roles: ["admin"] },
  { title: "Announcements", url: "/admin/announcements", icon: Megaphone, roles: ["admin"] },
  {
    title: "Reports",
    icon: Flag,
    roles: ["admin", "moderator"],
    items: [
      {
        title: "Reports Comment",
        url: "/admin/reports/comments",
        icon: MessageSquareWarning,
      },
      {
        title: "Reports Chapter",
        url: "/admin/reports/chapters",
        icon: Flag,
      },
    ]
  },
  { title: "Activity", url: "/admin/activity", icon: Activity, roles: ["admin"] },
  { title: "Admin Logs", url: "/admin/logs", icon: ClipboardList, roles: ["admin", "moderator"] },
  { title: "Users", url: "/admin/users", icon: Users, roles: ["admin"] },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    roles: ["admin", "moderator"]
  },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { userRole } = useAuth();
  const collapsed = state === "collapsed";

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(userRole || "user")
  );


  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b border-border p-4">
        <NavLink to="/admin" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
            <img src="/logo-small.webp" alt="Logo" className="w-full h-full object-cover" />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold text-foreground hidden sm:block">
              Celestial<span className="text-primary">Scrolls</span>
            </span>)}
        </NavLink>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <Collapsible defaultOpen className="group/collapsible">
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted">
                          <item.icon className="h-4 w-4 shrink-0" />
                          {!collapsed && (
                            <>
                              <span>{item.title}</span>
                              <ChevronRight className="ml-auto w-4 h-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </>
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild isActive={isActive(subItem.url)}>
                                <NavLink to={subItem.url}>
                                  <subItem.icon className="h-4 w-4 shrink-0" />
                                  <span>{subItem.title}</span>
                                </NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url!)}
                    >
                      <NavLink
                        to={item.url!}
                        end={item.url === "/admin"}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                          isActive(item.url!)
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
