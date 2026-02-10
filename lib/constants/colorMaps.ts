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
} from "@phosphor-icons/react/dist/ssr";

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

export const PILL_COLOR_MAP: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  red: { bg: "bg-red-100", text: "text-red-700", border: "border-red-700" },
  orange: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-700",
  },
  yellow: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-700",
  },
  emerald: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-700",
  },
  blue: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-700" },
  indigo: {
    bg: "bg-indigo-100",
    text: "text-indigo-700",
    border: "border-indigo-700",
  },
  purple: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-700",
  },
  pink: { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-700" },
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

export const BORDER_COLOR_MAP: Record<string, string> = {
  red: "hover:border-red-500",
  orange: "hover:border-orange-500",
  yellow: "hover:border-yellow-500",
  emerald: "hover:border-emerald-500",
  blue: "hover:border-blue-500",
  indigo: "hover:border-indigo-500",
  purple: "hover:border-purple-500",
  pink: "hover:border-pink-500",
};

export const GRADIENT_COLOR_MAP: Record<string, string> = {
  red: "rgba(239, 68, 68, 0.4)",
  orange: "rgba(249, 115, 22, 0.4)",
  yellow: "rgba(234, 179, 8, 0.4)",
  emerald: "rgba(16, 185, 129, 0.4)",
  blue: "rgba(59, 130, 246, 0.4)",
  indigo: "rgba(99, 102, 241, 0.4)",
  purple: "rgba(168, 85, 247, 0.4)",
  pink: "rgba(236, 72, 153, 0.4)",
};
