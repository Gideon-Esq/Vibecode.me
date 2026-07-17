/**
 * Central source of truth for IEPS 3.0 event content.
 * Keeping copy here means every page/section stays consistent and easy to update.
 */

/** Canonical site URL (override with NEXT_PUBLIC_APP_URL in env). */
export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://ieps3.vercel.app";

export const EVENT = {
  shortName: "IEPS 3.0",
  name: "Ife Education Parliamentary Summit 3.0",
  fullName: "IFE EDUCATION PARLIAMENTARY SUMMIT",
  edition: "3.0",
  theme:
    "Nigerian Parliamentarian: A Strategic Panacea for Nation-Building and Education Reforms",
  themeLeadIn: "Nigerian Parliamentarian:",
  themeHighlight:
    "A Strategic Panacea for Nation-Building and Education Reforms",
  tagline: "Where policy meets purpose for the future of Nigerian education.",
  /** Countdown target — Wed 22 July 2026, 00:00:00 WAT (UTC+1) */
  dateISO: "2026-07-22T00:00:00+01:00",
  dateLabel: "Wednesday, 22nd July 2026",
  dayLabel: "Wednesday",
  timeLabel: "10:00 AM prompt",
  venue: {
    name: "New EDM Boardroom",
    shortName: "New EDM Boardroom, OAU",
    institution: "Obafemi Awolowo University",
    city: "Ile-Ife",
    state: "Osun State",
    country: "Nigeria",
    /** Exact map location — New EDM building, OAU (from the official pin). */
    lat: 7.5158395,
    lng: 4.5271551,
    mapLink: "https://maps.app.goo.gl/cY176Be9qsuqM5x48",
  },
} as const;

export const CONTACT = {
  name: "Abdulkareem Tijani Remilekun",
  role: "Speaker, ESRC OAU",
  email: "ayooluwaoloyede71@gmail.com",
  phone: "08126540417",
  phoneIntl: "+2348126540417",
} as const;

/**
 * Official ESRC/summit channels — general enquiries and social media.
 * `facebook.url` is a name search fallback; swap in the exact Page URL if known.
 */
export const SOCIALS = {
  email: "srceduoau@gmail.com",
  instagram: {
    label: "Instagram",
    handle: "@src_edu",
    url: "https://instagram.com/src_edu",
  },
  facebook: {
    label: "Facebook",
    handle: "Src Edu",
    url: "https://www.facebook.com/src.edu.2025",
  },
} as const;

/**
 * Certificate signatories — shown on the Certificate of Participation PDF.
 * `signature` points at a scanned signature PNG; when the file isn't present
 * yet, the certificate falls back to a decorative scribble.
 */
export const CERTIFICATE_SIGNATORIES = [
  {
    name: "Rt. Hon. Abdulkareem Tijani R.",
    role: "SPEAKER, ESRC OAU",
    signature: "/signatures/speaker-1.png",
  },
  {
    name: "Hon. Kanayo Daniel T.",
    role: "DEPUTY SPEAKER, ESRC OAU",
    signature: "/signatures/speaker-2.png",
  },
] as const;

export const ORGANIZERS = [
  {
    abbr: "OAU",
    name: "Obafemi Awolowo University",
    detail: "Host institution, Ile-Ife",
    role: "Host",
    logo: "/logos/oau.png",
    fallback: "/logos/oau.svg",
  },
  {
    abbr: "ESRC, OAU",
    name: "Education Students' Representative Council",
    detail: "Convener, Obafemi Awolowo University",
    role: "Convener",
    logo: "/logos/esrc.png",
    fallback: "/logos/esrc.svg",
  },
] as const;

/** Sponsors supporting IEPS 3.0. Logos live in /public/logos/sponsors. */
export const SPONSORS = [
  {
    name: "Luxora",
    logo: "/logos/sponsors/luxora.png",
  },
  {
    name: "Dynage",
    logo: "/logos/sponsors/dynage.png",
  },
  {
    name: "Last Born Tech",
    logo: "/logos/sponsors/lastborntech.png",
  },
] as const;

/**
 * Keynote speaker slots — names and portraits are NOT yet confirmed.
 * These are deliberate placeholders; swap in real names/photos when announced.
 */
export const KEYNOTE_SPEAKERS = [
  {
    slot: "Keynote Speaker",
    name: "Hon. Olujinmi Asagade",
    detail: "Chairman, House Committee on Local Government & Chieftaincy Affairs",
    photo: "/speakers/speaker1.png" as string | null,
    position: "center",
    scale: 1,
    fit: "cover" as "cover" | "contain",
  },
  {
    slot: "Keynote Speaker",
    name: "Rt. Hon. Ganiyu Yussuf (KOB)",
    detail:
      "National President, Nigeria Students Legislative Council (NSLC) · Erstwhile Speaker, Great Ife Students' Union",
    photo: "/speakers/speaker2.png" as string | null,
    position: "center top",
    scale: 1.1,
    fit: "cover" as "cover" | "contain",
  },
  {
    slot: "Keynote Speaker",
    name: "Hon. Engr. Abiola Jeremiah",
    detail: "Honorable representing Ife Central State Constituency, Osun State House of Assembly",
    photo: "/speakers/speaker3.png" as string | null,
    position: "center",
    scale: 1,
    fit: "contain" as "cover" | "contain",
  },
] as const;

/**
 * Panel-discussion panelist slots — swap in real people as announced.
 */
export const PANELISTS = [
  {
    slot: "Panelist",
    name: "Rt. Hon. Fakunle Habeeb",
    detail: "Erstwhile Speaker, ESRC OAU",
    photo: "/speakers/panelist1.png" as string | null,
    position: "58% 20%",
    scale: 1.5,
  },
  {
    slot: "Panelist",
    name: "Hon. Olayinka Damilare (SIBESIBE)",
    detail: "",
    photo: "/speakers/panelist2.png" as string | null,
    position: "50% 12%",
    scale: 1.55,
  },
  {
    slot: "Panelist",
    name: "Hon. Boluwatife Olatunji Paul (BOP)",
    detail: "",
    photo: "/speakers/panelist3.png" as string | null,
    position: "50% 14%",
    scale: 1.05,
  },
  {
    slot: "Panelist",
    name: "Rt. Hon. Praise Ojo",
    detail: "",
    photo: "/speakers/panelist4.png" as string | null,
    position: "50% 10%",
    scale: 1.05,
  },
] as const;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Programme", href: "/programme" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
] as const;

/** The 7 programme segments — "7 Sessions. One Powerful Day." */
export const PROGRAMME = [
  {
    title: "Keynote Addresses",
    description:
      "Flagship addresses from distinguished voices on the role of parliamentarians in national and educational development.",
  },
  {
    title: "Panel Discussion",
    description:
      "A cross-disciplinary panel of educators, lawmakers and student leaders unpacking pathways for reform.",
  },
  {
    title: "Interactive Session with Student Parliamentarians",
    description:
      "Open-floor dialogue connecting student parliamentarians from across Nigeria in real conversation.",
  },
  {
    title: "Leadership and Legislative Workshops",
    description:
      "Hands-on workshops building practical leadership and legislative capacity in young delegates.",
  },
  {
    title: "Policy Innovation Lab",
    description:
      "A collaborative lab where delegates prototype actionable education-policy solutions.",
  },
  {
    title: "Networking Session",
    description:
      "Structured networking that forges lasting national connections among future leaders.",
  },
  {
    title: "Summit Communiqué Presentation",
    description:
      "The official communiqué: resolutions and recommendations carried forward from the summit floor.",
  },
] as const;

/** Animated count-up figures shown in the About section. */
export const STATS = [
  { value: 500, suffix: "+", label: "Expected Attendees" },
  { value: 7, suffix: "", label: "Programme Segments" },
  { value: 1, suffix: "", label: "Transformative Day" },
] as const;

/** Three feature cards in the About section. */
export const ABOUT_FEATURES = [
  {
    icon: "graduation",
    title: "Student Parliament",
    text: "A simulated parliamentary process that puts student voices at the centre of national dialogue.",
  },
  {
    icon: "landmark",
    title: "Policy Innovation",
    text: "Critical thinking and real solutions to the issues shaping education across Nigeria.",
  },
  {
    icon: "handshake",
    title: "National Networking",
    text: "Connecting student parliamentarians from institutions nationwide in one room.",
  },
] as const;

export const THEME_QUOTE =
  "Through visionary leadership and strategic decision-making, they can help build a more educated, united, and prosperous Nigeria.";

/** Full descriptions + time-slot placeholders for the Programme timeline. */
export const PROGRAMME_TIMELINE = [
  {
    title: "Keynote Addresses",
    description:
      "Insightful presentations by distinguished legislators, policy experts, and education advocates.",
    time: "Opening Session",
  },
  {
    title: "Panel Discussion",
    description:
      "Engaging conversations on how effective legislative leadership can strengthen democratic institutions.",
    time: "Mid-Morning",
  },
  {
    title: "Interactive Session with Student Parliamentarians",
    description:
      "A collaborative forum for student leaders to share ideas.",
    time: "Late Morning",
  },
  {
    title: "Leadership and Legislative Workshops",
    description:
      "Hands-on sessions on policy drafting, public speaking, negotiation, and ethical leadership.",
    time: "Afternoon",
  },
  {
    title: "Policy Innovation Lab",
    description:
      "Participants will develop actionable policy proposals to address pressing educational and national development issues.",
    time: "Afternoon",
  },
  {
    title: "Networking Session",
    description:
      "Connect with lawmakers, educators, and fellow student leaders for strategic partnerships.",
    time: "Evening",
  },
  {
    title: "Summit Communiqué Presentation",
    description:
      "Key resolutions and recommendations for advancing nation building and educational reform in Nigeria.",
    time: "Closing Session",
  },
] as const;

/** The 7 summit objectives (from the proposal). */
export const OBJECTIVES = [
  {
    icon: "messages",
    title: "Parliamentary Discourse",
    text: "Foster robust, issue-driven debate on the policies shaping Nigeria's education and development.",
  },
  {
    icon: "briefcase",
    title: "Practical Experience",
    text: "Give student parliamentarians hands-on experience of a simulated legislative process.",
  },
  {
    icon: "compass",
    title: "Leadership Development",
    text: "Build the leadership, negotiation and public-speaking skills of emerging student leaders.",
  },
  {
    icon: "vote",
    title: "Democratic Engagement",
    text: "Deepen understanding of democratic institutions and active, informed citizenship.",
  },
  {
    icon: "users-round",
    title: "Community Building",
    text: "Connect student leaders nationwide into a lasting community of advocates for reform.",
  },
  {
    icon: "megaphone",
    title: "Expression of Ideas",
    text: "Create a platform for delegates to articulate fresh ideas and bold solutions.",
  },
  {
    icon: "hand",
    title: "Effective Participation",
    text: "Equip participants to engage parliamentarians meaningfully on education and nation building.",
  },
] as const;

/** Organising team — convener confirmed; remaining roles announced soon. */
export const TEAM = [
  { name: "Abdulkareem Tijani Remilekun", role: "Convener" },
  { name: "To be announced", role: "Co-Convener" },
  { name: "To be announced", role: "Secretary" },
  { name: "To be announced", role: "Director of Programmes" },
  { name: "To be announced", role: "Director of Publicity" },
  { name: "To be announced", role: "Director of Welfare" },
  { name: "To be announced", role: "Technical Lead" },
  { name: "To be announced", role: "Protocol Officer" },
  { name: "To be announced", role: "Finance Officer" },
] as const;
