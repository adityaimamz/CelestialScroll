export interface BadgeTier {
  name: string;
  minChapters: number;
  style: {
    background: string; // Bisa solid color atau linear-gradient
    color: string;      // Warna text
    border: string;     // Warna border
    glow?: string;      // Warna box-shadow glow
    textShadow?: string; // Efek outline pada text
  };
}

export const BADGE_TIERS: BadgeTier[] = [
  // TIER 1-3: BASIC (Stone / Iron / Bronze) - Kesan Solid & Material Mentah
  {
    name: "Martial Apprentice",
    minChapters: 0,
    style: {
      background: "#E5E7EB", // Abu-abu muda
      color: "#374151",
      border: "#9CA3AF"
    }
  },
  {
    name: "Martial Warrior",
    minChapters: 10,
    style: {
      background: "#93C5FD", // Biru Pucat
      color: "#1E3A8A",
      border: "#3B82F6"
    }
  },
  {
    name: "Martial Master",
    minChapters: 20,
    style: {
      background: "#86EFAC", // Hijau Pucat
      color: "#14532D",
      border: "#22C55E"
    }
  },

  // TIER 4-6: INTERMEDIATE (Silver / Gold / Platinum) - Kesan Metalik & Berharga
  {
    name: "Great Martial Master",
    minChapters: 30,
    style: {
      background: "linear-gradient(135deg, #E0F2FE 0%, #0EA5E9 100%)", // Gradasi Biru Langit
      color: "#FFFFFF",
      border: "#0284C7",
      textShadow: "0px 1px 2px rgba(0,0,0,0.5)"
    }
  },
  {
    name: "Martial Lord",
    minChapters: 40,
    style: {
      background: "linear-gradient(135deg, #DDD6FE 0%, #7C3AED 100%)", // Gradasi Ungu Royal
      color: "#FFFFFF",
      border: "#6D28D9",
      textShadow: "0px 1px 2px rgba(0,0,0,0.5)"
    }
  },
  {
    name: "Martial King",
    minChapters: 50,
    style: {
      background: "linear-gradient(135deg, #FDE68A 0%, #D97706 100%)", // Emas Solid
      color: "#FFFFFF",
      border: "#B45309",
      textShadow: "0px 1px 2px rgba(0,0,0,0.6)",
      glow: "#F59E0B"
    }
  },

  // TIER 7-9: HIGH (Diamond / Mystic / Ethereal) 
  {
    name: "Martial Grandmaster",
    minChapters: 60,
    style: {
      background: "linear-gradient(135deg, #FECACA 0%, #DC2626 100%)", // Merah Ruby
      color: "#FFFFFF",
      border: "#991B1B",
      textShadow: "0px 0px 4px rgba(0,0,0,0.8)",
      glow: "#EF4444"
    }
  },
  {
    name: "Martial Emperor",
    minChapters: 70,
    style: {
      background: "linear-gradient(135deg, #FBCFE8 0%, #DB2777 50%, #BE185D 100%)", // Magenta Kristal
      color: "#FFFFFF",
      border: "#831843",
      textShadow: "0px 0px 5px rgba(190, 24, 93, 0.8)",
      glow: "#EC4899"
    }
  },
  {
    name: "Martial Supreme",
    minChapters: 80,
    style: {
      background: "linear-gradient(45deg, #6366F1 0%, #A855F7 50%, #EC4899 100%)", // Nebula
      color: "#FFFFFF",
      border: "#FFFFFF",
      textShadow: "0 0 10px rgba(255,255,255,0.5)",
      glow: "#8B5CF6"
    }
  },

  // TIER 10-11: LEGENDARY/GOD (Prismatic / Celestial)
  {
    name: "Martial Sovereign",
    minChapters: 90,
    style: {
      background: "linear-gradient(135deg, #0F172A 0%, #334155 50%, #0F172A 100%)", // Dark Void
      color: "#38BDF8", // Cyan Neon
      border: "#38BDF8",
      textShadow: "0 0 5px #38BDF8, 0 0 10px #38BDF8",
      glow: "#0EA5E9"
    }
  },
  {
    name: "Martial God",
    minChapters: 100,
    style: {
      background: "linear-gradient(45deg, #FF3D00, #FFD600, #00E676, #2979FF, #D500F9)",
      color: "#FFFFFF",
      border: "#FFFFFF",
      textShadow: "0 2px 4px rgba(0,0,0,0.5)",
      glow: "rainbow"
    }
  },
];

export const getBadgeInfo = (chapterCount: number): BadgeTier => {
  let currentTier = BADGE_TIERS[0];
  for (const tier of BADGE_TIERS) {
    if (chapterCount >= tier.minChapters) {
      currentTier = tier;
    } else {
      break;
    }
  }
  return currentTier;
};