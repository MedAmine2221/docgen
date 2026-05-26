import { IconApi } from "@/components/icons/IconApi";
import { IconDocs } from "@/components/icons/IconDocs";
import { IconSettings } from "@/components/icons/IconSettings";
import { IconUsers } from "@/components/icons/IconUsers";
import { FiFileText, FiHome, FiSettings } from "react-icons/fi";
import { SiLogseq } from "react-icons/si";

const TODAY = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
});

const AVATAR_COLORS = ["#c5262e", "#185FA5", "#0F6E56", "#854F0B", "#534AB7"];

const roles = [
  {
    id : 1,
    name_eng : "ADMIN",
    name_fr : "ADMIN"
  },
  {
    id : 2,
    name_eng : "DEVELOPER",
    name_fr : "DÉVELOPPEUR"
  },
  {
    id : 3,
    name_eng : "CLIENT",
    name_fr : "CLIENT"
  }
] 

const doc_status = [
  {
    id : 1,
    name : "pending",
  },
  {
    id : 2,
    name : "approve",
  },
  {
    id : 3,
    name : "rejected",
  }
] 

const API_METHOD = [
  {
    id : 1,
    name : "POST",
  },
  {
    id : 2,
    name : "GET",
  },
  {
    id : 3,
    name : "PUT",
  },
  {
    id : 4,
    name : "DELETE",
  },
  {
    id : 5,
    name : "PATCH",
  }
] 

// Clés de traduction pour les éléments de navigation
// Les labels sont maintenant des clés i18n
const NAV_ITEMS = [
  { labelKey: "nav.admin_dashboard", path: "/admin/dashboard", icon: <FiHome />, disabled: true },
  { labelKey: "nav.users_management", path: "/admin/users", icon: <IconUsers />, disabled: true },
  { labelKey: "nav.documents_management", path: "/admin/docs", icon: <IconDocs />, disabled: true },
  { labelKey: "nav.history", path: "/admin/logs", icon: <SiLogseq />, disabled: true },
  { labelKey: "nav.profile", path: "/profil", icon: <IconApi />, disabled: false },
];

const NAV_ITEMS_Dev = [
  { labelKey: "nav.dev_dashboard", path: "/developer/dashboard", icon: <FiHome />, disabled: true },
  { labelKey: "nav.manage_docs", path: "/developer/docs", icon: <IconDocs />, disabled: true },
  { labelKey: "nav.profile", path: "/profil", icon: <IconApi />, disabled: false },
];

const NAV_CLIENT_ITEMS = [
  { labelKey: "nav.client_dashboard", path: "/client", icon: <FiHome className="w-4 h-4" />, disabled: true },
  { labelKey: "nav.my_profile", path: "/profil", icon: <FiSettings className="w-4 h-4" />, disabled: true },
];

const NAV_BOTTOM = [
  { labelKey: "nav.settings", path: "/settings", icon: <IconSettings />, disabled: true },
];

const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

export { 
  NAV_ITEMS_Dev, 
  TODAY, 
  MONTHS, 
  API_METHOD, 
  doc_status, 
  AVATAR_COLORS, 
  roles, 
  NAV_ITEMS, 
  NAV_BOTTOM,
  NAV_CLIENT_ITEMS
}

export const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export const PAGE_SIZE = 5;