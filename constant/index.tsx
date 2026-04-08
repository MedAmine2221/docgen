import { IconApi } from "@/components/icons/IconApi";
import { IconDocs } from "@/components/icons/IconDocs";
import { IconSettings } from "@/components/icons/IconSettings";
import { IconUsers } from "@/components/icons/IconUsers";

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
  }
] 

const NAV_ITEMS = [
  { label: "Gérer les users", path: "/admin/users",    icon: <IconUsers />, disabled: true },
  { label: "Gérer les docs",  path: "/admin/docs",     icon: <IconDocs />, disabled: true  },
  { label: "Gérer les APIs",  path: "/admin/apis",     icon: <IconApi />, disabled: true   },
  { label: "Gérer Votre Profil",  path: "/profil",     icon: <IconApi />, disabled: false  },

];

const NAV_BOTTOM = [
  { label: "Paramètres", path: "/admin/settings", icon: <IconSettings /> },
];
export { AVATAR_COLORS, roles, NAV_ITEMS, NAV_BOTTOM}