export type NavItemId =
  | "home"
  | "workspace"
  | "projects"
  | "templates"
  | "materials"
  | "favorites"
  | "profile"
  | "settings"
  | "help";

export type NavItem = {
  id: NavItemId;
  label: string;
  href: string;
  disabled?: boolean;
};

export const WEB_NAV_ITEMS: NavItem[] = [
  { id: "home", label: "首页", href: "/" },
  { id: "workspace", label: "图纸工作台", href: "/workspace/upload" },
  { id: "projects", label: "我的项目", href: "/projects" },
  { id: "templates", label: "模板中心", href: "#", disabled: true },
  { id: "materials", label: "材料库", href: "#", disabled: true },
  { id: "favorites", label: "我的收藏", href: "#", disabled: true }
];

export const WEB_SECONDARY_NAV_ITEMS: NavItem[] = [
  { id: "profile", label: "个人中心", href: "#", disabled: true },
  { id: "settings", label: "设置", href: "#", disabled: true },
  { id: "help", label: "帮助与反馈", href: "#", disabled: true }
];

export const MOBILE_TAB_ITEMS: NavItem[] = [
  { id: "home", label: "首页", href: "/" },
  { id: "projects", label: "项目", href: "/projects" },
  { id: "templates", label: "模板", href: "#", disabled: true },
  { id: "profile", label: "我的", href: "#", disabled: true }
];

export function getPageTitle(pathname: string) {
  if (pathname.startsWith("/workspace")) return "图纸工作台";
  if (pathname.startsWith("/projects")) return "我的项目";
  if (pathname === "/") return "首页";
  return "豆图工坊";
}
