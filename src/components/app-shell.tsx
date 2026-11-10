import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Check, ChevronsUpDown, Compass, LayoutGrid, Megaphone, Menu, PanelLeftClose, PanelLeftOpen, Settings } from "lucide-react";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TeamIntroduction } from "@/components/team-introduction";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CURRENT_USER } from "@/lib/studio-data";
import { HOME_SEARCH } from "@/routes/index";

type NavItem = { label: string; icon: typeof Compass; to?: "/ai-studio" | "/"; match: (p: string) => boolean; soon?: boolean };
const nav: NavItem[] = [
  { label: "AI Studio", icon: Compass, to: "/ai-studio", match: (p) => p.startsWith("/ai-studio") },
  { label: "Agent Marketplace", icon: LayoutGrid, match: () => false, soon: true },
  { label: "Knowledge Base", icon: BookOpen, match: () => false, soon: true },
  { label: "Campaigns", icon: Megaphone, to: "/", match: (p) => p === "/" || p.startsWith("/campaigns") || p === "/audiences" },
];

const PROPERTIES = ["The Meridian Hotel", "The Meridian Lalibela"];

function Sidebar({ collapsed, path, introOpen, onNav, onToggle }: { collapsed: boolean; path: string; introOpen: boolean; onNav: (to?: string) => void; onToggle?: () => void }) {
  const [property, setProperty] = useState(PROPERTIES[0]!);
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className={cn("flex h-14 items-center gap-2 border-b border-sidebar-border", collapsed ? "justify-center px-2" : "px-5")}>
        <span className="grid size-6 shrink-0 place-items-center rounded-sm bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">D</span>
        {!collapsed && <span className="text-[15px] font-semibold tracking-tight text-sidebar-accent-foreground">Directful</span>}
      </div>
      <nav className="flex flex-col gap-0.5 p-2" aria-label="Main">
        {nav.map((n) => {
          const cls = cn("flex items-center gap-2.5 rounded-sm py-2 text-sm", collapsed ? "justify-center px-0" : "px-3");
          const inner = <><n.icon className="size-4 shrink-0" strokeWidth={1.75} />{!collapsed && <span className="flex-1">{n.label}</span>}{!collapsed && n.soon && <span className="text-[10px] uppercase opacity-60">Soon</span>}</>;
          if (!n.to) return <span key={n.label} title={`${n.label} — coming next`} className={cn(cls, "cursor-default opacity-50")}>{inner}</span>;
          const active = n.to === "/" ? n.match(path) && !introOpen : n.match(path);
          const common = { title: collapsed ? n.label : undefined, onClick: () => onNav(n.to), className: cn(cls, active ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/60") };
          return n.to === "/" ? <Link key={n.label} to="/" search={HOME_SEARCH} {...common}>{inner}</Link> : <Link key={n.label} to="/ai-studio" search={{}} {...common}>{inner}</Link>;
        })}
      </nav>
      <div className="mt-auto space-y-1 border-t border-sidebar-border p-2">
        <DropdownMenu>
          <DropdownMenuTrigger className={cn("flex w-full items-center gap-2 rounded-sm py-2 text-left text-sm hover:bg-sidebar-accent/60", collapsed ? "justify-center" : "px-3")} title={property}>
            <span className="grid size-6 shrink-0 place-items-center rounded-sm bg-sidebar-accent text-[11px] font-semibold text-sidebar-accent-foreground">M</span>
            {!collapsed && <><span className="flex-1 truncate">{property}</span><ChevronsUpDown className="size-3.5 opacity-60" /></>}
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-56">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Property</DropdownMenuLabel>
            {PROPERTIES.map((p) => <DropdownMenuItem key={p} onSelect={() => { setProperty(p); if (p !== PROPERTIES[0]) toast("Sample data shows The Meridian Hotel only"); }}>{p}{p === property && <Check className="ml-auto size-4" />}</DropdownMenuItem>)}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className={cn("flex items-center gap-2 py-1.5 text-sm", collapsed ? "justify-center" : "px-3")}>
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-sidebar-primary text-[10px] font-semibold text-sidebar-primary-foreground">{CURRENT_USER.initials}</span>
          {!collapsed && <span className="min-w-0 flex-1 leading-tight"><span className="block truncate text-sidebar-accent-foreground">{CURRENT_USER.name}</span><span className="block truncate text-[11px] opacity-70">{CURRENT_USER.role}</span></span>}
          {!collapsed && <button aria-label="Workspace settings" onClick={() => toast("Workspace settings are part of a later phase")} className="rounded-sm p-1 opacity-70 hover:bg-sidebar-accent hover:opacity-100"><Settings className="size-4" /></button>}
        </div>
        {onToggle && (
          <button onClick={onToggle} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} className={cn("flex w-full items-center gap-2.5 rounded-sm py-2 text-sm opacity-70 hover:opacity-100", collapsed ? "justify-center" : "px-3")}>
            {collapsed ? <PanelLeftOpen className="size-4" /> : <><PanelLeftClose className="size-4" /> Collapse</>}
          </button>
        )}
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [introductionOpen, setIntroductionOpen] = useState(true);
  const introOpen = path === "/" && introductionOpen;
  const onNav = (to?: string) => { if (to === "/") setIntroductionOpen(false); setMobileOpen(false); };
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-sidebar px-3 text-sidebar-foreground md:hidden">
        <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="rounded-sm p-1.5 hover:bg-sidebar-accent"><Menu className="size-5" /></button>
        <span className="text-sm font-semibold text-sidebar-accent-foreground">Directful</span>
      </header>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 border-0 p-0"><SheetHeader className="sr-only"><SheetTitle>Menu</SheetTitle></SheetHeader><Sidebar collapsed={false} path={path} introOpen={introOpen} onNav={onNav} /></SheetContent>
      </Sheet>
      <aside className={cn("sticky top-0 hidden h-screen shrink-0 transition-[width] duration-200 md:block", collapsed ? "w-14" : "w-60")}>
        <Sidebar collapsed={collapsed} path={path} introOpen={introOpen} onNav={onNav} onToggle={() => setCollapsed((c) => !c)} />
      </aside>
      <main className="min-w-0 flex-1">{introOpen ? <TeamIntroduction onContinue={() => setIntroductionOpen(false)} /> : children}</main>
    </div>
  );
}
