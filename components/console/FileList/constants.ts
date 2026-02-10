import {
  Folder as FolderIcon,
  FolderOpen,
  Archive,
  BookBookmark,
  Briefcase,
  ChartBar,
  FileText,
  Gear,
  Heart,
  House,
  Image as ImageIcon,
  Lightning,
  MusicNote,
  Star,
  Users,
  VideoCamera,
} from "@phosphor-icons/react";

export const ICON_MAP: Record<string, React.ComponentType> = {
  Folder: FolderIcon,
  FolderOpen,
  Archive,
  BookBookmark,
  Briefcase,
  ChartBar,
  FileText,
  Gear,
  Heart,
  House,
  Image: ImageIcon,
  Lightning,
  MusicNote,
  Star,
  Users,
  VideoCamera,
};

export const COLOR_MAP: Record<string, string> = {
  red: "bg-red-500",
  orange: "bg-orange-500",
  yellow: "bg-yellow-500",
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  indigo: "bg-indigo-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
};

export const GRADIENT_HOVER_MAP: Record<string, string> = {
  red: "hover:bg-gradient-to-l hover:from-red-500/40 hover:to-transparent",
  orange:
    "hover:bg-gradient-to-l hover:from-orange-500/40 hover:to-transparent",
  yellow:
    "hover:bg-gradient-to-l hover:from-yellow-500/40 hover:to-transparent",
  emerald:
    "hover:bg-gradient-to-l hover:from-emerald-500/40 hover:to-transparent",
  blue: "hover:bg-gradient-to-l hover:from-blue-500/40 hover:to-transparent",
  indigo:
    "hover:bg-gradient-to-l hover:from-indigo-500/40 hover:to-transparent",
  purple:
    "hover:bg-gradient-to-l hover:from-purple-500/40 hover:to-transparent",
  pink: "hover:bg-gradient-to-l hover:from-pink-500/40 hover:to-transparent",
};

export const TEXT_COLOR_MAP: Record<string, string> = {
  red: "text-red-700",
  orange: "text-orange-700",
  yellow: "text-yellow-700",
  emerald: "text-emerald-700",
  blue: "text-blue-700",
  indigo: "text-indigo-700",
  purple: "text-purple-700",
  pink: "text-pink-700",
};

export const ITEMS_PER_PAGE = 50;
