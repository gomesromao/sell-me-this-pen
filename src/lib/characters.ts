export type CharacterArchetype = {
  slug: string;
  label: string;
  vibe: string;
  seed: string;
  backgroundColor: string;
  accent: "navy" | "coral" | "sunny" | "gleam" | "mint";
};

export const CHARACTERS: CharacterArchetype[] = [
  {
    slug: "skeptical_cfo",
    label: "The Skeptical CFO",
    vibe: "Older, sharp, finance-obsessed. Wants every claim backed by numbers. Allergic to vague pitches.",
    seed: "Marcus-Stone-CFO-001",
    backgroundColor: "1b2e5c",
    accent: "navy",
  },
  {
    slug: "burned_out_founder",
    label: "The Burned-Out Founder",
    vibe: "Bootstrapped operator who's been burned by vendors before. Tired, jaded, but smart. Cuts to the point.",
    seed: "Theo-Banks-Founder-002",
    backgroundColor: "e5694b",
    accent: "coral",
  },
  {
    slug: "hustler_sales",
    label: "The Hustler",
    vibe: "High-energy sales leader. Smug, talks fast, loves a one-liner. Tests you with cocky challenges.",
    seed: "Lila-Vega-Sales-003",
    backgroundColor: "ffd66b",
    accent: "sunny",
  },
  {
    slug: "no_bs_operator",
    label: "The No-BS Operator",
    vibe: "COO type. Efficient, blunt, doesn't waste time. Wants concrete deliverables and timelines.",
    seed: "Priya-Rao-COO-004",
    backgroundColor: "2baa62",
    accent: "gleam",
  },
  {
    slug: "corporate_buyer",
    label: "The Corporate Buyer",
    vibe: "Procurement lead at an enterprise. Cautious, process-bound, asks about compliance, SLAs, references.",
    seed: "Walter-Hayes-Procurement-005",
    backgroundColor: "a6d9bd",
    accent: "mint",
  },
  {
    slug: "tech_vp",
    label: "The Tech VP",
    vibe: "VP of Engineering. Technical, sharp, asks how things actually work. Hates marketing fluff.",
    seed: "Naomi-Park-VPE-006",
    backgroundColor: "8997c0",
    accent: "navy",
  },
  {
    slug: "marketing_skeptic",
    label: "The Marketing Skeptic",
    vibe: "CMO who's seen every trend. Jaded but creative. Asks about distribution, channel, and proof.",
    seed: "Diego-Soto-CMO-007",
    backgroundColor: "ff8a6b",
    accent: "coral",
  },
  {
    slug: "detail_lawyer",
    label: "The Detail-Freak",
    vibe: "General Counsel or compliance lead. Asks pointed questions, watches the fine print, suspicious of bravado.",
    seed: "Margot-Cliff-GC-008",
    backgroundColor: "efe8da",
    accent: "navy",
  },
  {
    slug: "speed_sales_boss",
    label: "The Speed-Talker",
    vibe: "Chief Revenue Officer. Intense, fast, interrupts. Wants the bottom line in the first sentence.",
    seed: "Andre-Volk-CRO-009",
    backgroundColor: "f2b53c",
    accent: "sunny",
  },
  {
    slug: "tired_owner",
    label: "The Tired Owner-Operator",
    vibe: "Small business owner running it solo. Exhausted but pragmatic. Cares about real outcomes, not jargon.",
    seed: "Sara-Mendel-Owner-010",
    backgroundColor: "d6f3e2",
    accent: "gleam",
  },
];

export const CHARACTERS_BY_SLUG: Record<string, CharacterArchetype> = Object.fromEntries(
  CHARACTERS.map((c) => [c.slug, c]),
);

export function characterFromSlug(slug?: string): CharacterArchetype {
  if (slug && CHARACTERS_BY_SLUG[slug]) return CHARACTERS_BY_SLUG[slug];
  return CHARACTERS[0];
}

export const HOST_CHARACTER = {
  seed: "Coach-Pen-Host-Mascot",
  backgroundColor: "c9ecda",
  name: "The Coach",
};

export function dicebearUrl(seed: string, backgroundColor: string, size = 200) {
  const params = new URLSearchParams({
    seed,
    backgroundColor,
    radius: "50",
    size: String(size),
  });
  return `https://api.dicebear.com/9.x/notionists/svg?${params.toString()}`;
}
