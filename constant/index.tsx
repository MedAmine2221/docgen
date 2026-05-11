import { IconApi } from "@/components/icons/IconApi";
import { IconDocs } from "@/components/icons/IconDocs";
import { IconSettings } from "@/components/icons/IconSettings";
import { IconUsers } from "@/components/icons/IconUsers";
import { FiHome } from "react-icons/fi";
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

const NAV_ITEMS = [
  { label: "Page d'acceuil Admin", path: "/admin/dashboard",    icon: <FiHome />, disabled: true },
  { label: "Gérer les utilisateur", path: "/admin/users",    icon: <IconUsers />, disabled: true },
  { label: "Gérer les Documents",  path: "/admin/docs",     icon: <IconDocs />, disabled: true  },
  { label: "Historique",  path: "/admin/logs",     icon: <SiLogseq />, disabled: true  },
  { label: "Gérer Votre Profil",  path: "/profil",     icon: <IconApi />, disabled: false  },

];

const NAV_ITEMS_Dev = [
  { label: "Developer Dashboard", path: "/developer/dashboard",    icon: <FiHome />, disabled: true },
  { label: "Gérer les docs",  path: "/developer/docs",     icon: <IconDocs />, disabled: true  },
  { label: "Gérer Votre Profil",  path: "/profil",     icon: <IconApi />, disabled: false  },

];

const NAV_BOTTOM = [
  { label: "Paramètres", path: "/settings", icon: <IconSettings /> },
];
const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

export {NAV_ITEMS_Dev, TODAY, MONTHS, API_METHOD, doc_status, AVATAR_COLORS, roles, NAV_ITEMS, NAV_BOTTOM}