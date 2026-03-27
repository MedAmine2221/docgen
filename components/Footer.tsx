"use client";
import Image from "next/image";
import { FiGlobe, FiLinkedin, FiYoutube } from "react-icons/fi";

const SITE_MAP = [
  { label: "Accueil", href: "/" },
  { label: "Documentation", href: "/docs" },
  { label: "APIs", href: "/apis" },
  { label: "Versions", href: "/versions" },
];

const LEGAL = [
  { label: "Politique de confidentialité", href: "#" },
  { label: "Conditions d'utilisation", href: "#" },
  { label: "Mentions légales", href: "#" },
];

const SOCIALS = [
  {
    icon: FiLinkedin,
    href: "https://www.linkedin.com/company/warning-group/posts/?feedView=all",
    label: "LinkedIn",
  },
  {
    icon: FiYoutube,
    href: "https://www.youtube.com/@warning5886",
    label: "YouTube",
  },
  {
    icon: FiGlobe,
    href: "https://www.warning.fr/",
    label: "Site web",
  },
];

export default function Footer() {
  return (
    <footer className="px-6 pb-6 pt-2">
      <div className="bg-white border border-black/8 rounded-2xl shadow-sm overflow-hidden">
        {/* Top accent */}
        <div className="h-0.75 w-full bg-[#c5262e]" />

        <div className="px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

            {/* Brand column */}
            <div className="flex flex-col gap-4">
              <Image
                src="/logo-warning.png"
                alt="Warning Group"
                width={56}
                height={56}
                loading="eager"
                className="object-contain"
              />
              <p className="text-sm text-neutral-500 leading-relaxed max-w-xs">
                Plateforme centralisée de gestion de documentation API — création, validation, versionnement et partage sécurisé.
              </p>
              {/* Socials */}
              <div className="flex gap-2 mt-1">
                {SOCIALS.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#c5262e]/30
                               text-[#c5262e] hover:bg-[#c5262e] hover:text-white hover:border-[#c5262e]
                               transition-all duration-150"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* Site map */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#c5262e] mb-4">
                Plan du site
              </p>
              <ul className="space-y-2.5">
                {SITE_MAP.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-sm text-neutral-600 hover:text-[#c5262e] transition-colors"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#c5262e] mb-4">
                Légal
              </p>
              <ul className="space-y-2.5">
                {LEGAL.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-sm text-neutral-600 hover:text-[#c5262e] transition-colors"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-neutral-400">
              © {new Date().getFullYear()} Warning Group. Tous droits réservés.
            </p>
            <p className="text-xs text-neutral-400">
              DocGen — Usage interne
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}