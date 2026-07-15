/**
 * Brand marks for the team/contact rows. Material Symbols ships no company
 * logos, so these are inline paths rather than <Icon name="…" />.
 */

const NETWORKS = {
  facebook: {
    label: "Facebook",
    href: "https://web.facebook.com/voyagoa",
    path: "M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12Z",
  },
  linkedin: {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/voyagoa",
    path: "M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 21h4V9H3v12ZM9 21h4v-6.5c0-1.6.9-2.5 2-2.5s2 .9 2 2.5V21h4v-7.2c0-3.2-1.7-4.8-4-4.8-1.8 0-2.7.9-3 1.6V9H9v12Z",
  },
  instagram: {
    label: "Instagram",
    href: "https://www.instagram.com/voyagoa/",
    path: "M12 2c2.72 0 3.06.01 4.12.06 1.07.05 1.8.22 2.43.46.66.26 1.22.6 1.77 1.16.56.55.9 1.11 1.16 1.77.24.63.41 1.36.46 2.43C21.99 8.94 22 9.28 22 12s-.01 3.06-.06 4.12c-.05 1.07-.22 1.8-.46 2.43-.26.66-.6 1.22-1.16 1.77-.55.56-1.11.9-1.77 1.16-.63.24-1.36.41-2.43.46-1.06.05-1.4.06-4.12.06s-3.06-.01-4.12-.06c-1.07-.05-1.8-.22-2.43-.46a4.9 4.9 0 0 1-1.77-1.16 4.9 4.9 0 0 1-1.16-1.77c-.24-.63-.41-1.36-.46-2.43C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.07.22-1.8.46-2.43.26-.66.6-1.22 1.16-1.77.55-.56 1.11-.9 1.77-1.16.63-.24 1.36-.41 2.43-.46C8.94 2.01 9.28 2 12 2Zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm5.25-3.5a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z",
  },
} as const;

export type Network = keyof typeof NETWORKS;

export function SocialRow({
  label,
  networks = ["facebook", "linkedin", "instagram"],
  className,
}: {
  label: string;
  networks?: readonly Network[];
  className?: string;
}) {
  return (
    <div className={`flex justify-center gap-2.5 ${className ?? ""}`} aria-label={label}>
      {networks.map((n) => {
        const net = NETWORKS[n];
        return (
          <a
            key={n}
            href={net.href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`Voyagoa on ${net.label}`}
            className="grid size-9 place-items-center rounded-full border border-[#dce8fb] bg-white text-blue-dark transition hover:-translate-y-0.5 hover:border-[#8fb8ff] hover:text-blue"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d={net.path} />
            </svg>
          </a>
        );
      })}
    </div>
  );
}
