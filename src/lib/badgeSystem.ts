export interface BadgeTier {
  name: string;
  minChapters: number;
  maxStages: number; // Jumlah stage maksimal (misal 9 Bintang)
  stageLabel: string; // Label stage (Star, Chakra, Stage)
  style: {
    background: string;
    color: string;
    border: string;
    glow?: string;
    textShadow?: string;
  };
}

export const BADGE_TIERS: BadgeTier[] = [
  // TIER 1: BASIC (Material Mentah)
  {
    name: "Martial Apprentice",
    minChapters: 0,
    maxStages: 7,
    stageLabel: "Chakra",
    style: {
      background: "#E5E7EB",
      color: "#374151",
      border: "#9CA3AF"
    }
  },

  // TIER 2-3: LOW (Basic Elements)
  {
    name: "Martial Warrior",
    minChapters: 10,
    maxStages: 9,
    stageLabel: "Star",
    style: {
      background: "#93C5FD",
      color: "#1E3A8A",
      border: "#3B82F6"
    }
  },
  {
    name: "Martial Master",
    minChapters: 20,
    maxStages: 9,
    stageLabel: "Star",
    style: {
      background: "#86EFAC",
      color: "#14532D",
      border: "#22C55E"
    }
  },

  // TIER 4-6: INTERMEDIATE (Precious Metals)
  {
    name: "Great Martial Master",
    minChapters: 30,
    maxStages: 9,
    stageLabel: "Star",
    style: {
      background: "linear-gradient(135deg, #E0F2FE 0%, #0EA5E9 100%)",
      color: "#FFFFFF",
      border: "#0284C7",
      textShadow: "0px 1px 2px rgba(0,0,0,0.5)"
    }
  },
  {
    name: "Martial Lord",
    minChapters: 40,
    maxStages: 9,
    stageLabel: "Star",
    style: {
      background: "linear-gradient(135deg, #DDD6FE 0%, #7C3AED 100%)",
      color: "#FFFFFF",
      border: "#6D28D9",
      textShadow: "0px 1px 2px rgba(0,0,0,0.5)"
    }
  },
  {
    name: "Martial King",
    minChapters: 50,
    maxStages: 9,
    stageLabel: "Star",
    style: {
      background: "linear-gradient(135deg, #FDE68A 0%, #D97706 100%)",
      color: "#FFFFFF",
      border: "#B45309",
      textShadow: "0px 1px 2px rgba(0,0,0,0.6)",
      glow: "#F59E0B"
    }
  },

  // TIER 7-9: HIGH (Gemstones/Mystic)
  {
    name: "Martial Grandmaster",
    minChapters: 60,
    maxStages: 9,
    stageLabel: "Star",
    style: {
      background: "linear-gradient(135deg, #FECACA 0%, #DC2626 100%)",
      color: "#FFFFFF",
      border: "#991B1B",
      textShadow: "0px 0px 4px rgba(0,0,0,0.8)",
      glow: "#EF4444"
    }
  },
  {
    name: "Martial Emperor",
    minChapters: 75, // Adjusted gap
    maxStages: 9,
    stageLabel: "Star",
    style: {
      background: "linear-gradient(135deg, #FBCFE8 0%, #DB2777 50%, #BE185D 100%)",
      color: "#FFFFFF",
      border: "#831843",
      textShadow: "0px 0px 5px rgba(190, 24, 93, 0.8)",
      glow: "#EC4899"
    }
  },
  {
    name: "Martial Supreme",
    minChapters: 90,
    maxStages: 9,
    stageLabel: "Star",
    style: {
      background: "linear-gradient(45deg, #6366F1 0%, #A855F7 50%, #EC4899 100%)",
      color: "#FFFFFF",
      border: "#FFFFFF",
      textShadow: "0 0 10px rgba(255,255,255,0.5)",
      glow: "#8B5CF6"
    }
  },

  // TIER 10: LEGENDARY
  {
    name: "Martial Sovereign",
    minChapters: 110,
    maxStages: 9,
    stageLabel: "Star",
    style: {
      background: "linear-gradient(135deg, #0F172A 0%, #334155 50%, #0F172A 100%)",
      color: "#38BDF8",
      border: "#38BDF8",
      textShadow: "0 0 5px #38BDF8, 0 0 10px #38BDF8",
      glow: "#0EA5E9"
    }
  },

  // TIER 11: MARTIAL GOD - 4 Sub-Realms sebagai stages
  {
    name: "Martial God",
    minChapters: 130,
    maxStages: 4, // 4 sub-realms: Return to Truth, Heavenly Mastery, Void Extreme, Creation
    stageLabel: "Realm",
    style: {
      background: "linear-gradient(45deg, #FF3D00, #FFD600, #00E676, #2979FF, #D500F9)",
      color: "#FFFFFF",
      border: "transparent",
      textShadow: "0 2px 4px rgba(0,0,0,0.5)",
      glow: "rainbow"
    }
  }
];

// 4 Sub-Realm stages untuk Martial God
export const GOD_STAGES = [
  {
    stage: 1,
    name: "Return to Truth",
    chineseName: "归真境",
    minChapters: 130,
    effect: {
      glowIntensity: 1,
      animationSpeed: "6s",
      // White/Gold Theme (Purity) - Gold Glow, White Border
      glowColor: "rgba(255, 215, 0, 0.5)",
      borderColor: "#FFFFFF",
      boxShadow: "0 0 10px rgba(255,215,0,0.3), 0 0 20px rgba(255,255,255,0.2)",
    }
  },
  {
    stage: 2,
    name: "Heavenly Mastery",
    chineseName: "掌天境",
    minChapters: 160,
    effect: {
      glowIntensity: 2,
      animationSpeed: "4s",
      // Cyan/Sky Blue Theme (Heaven) - Blue Glow, White Border
      glowColor: "rgba(0, 229, 255, 0.6)",
      borderColor: "#FFFFFF",
      boxShadow: "0 0 15px rgba(0,229,255,0.4), 0 0 25px rgba(0,100,255,0.3)",
    }
  },
  {
    stage: 3,
    name: "Void Extreme",
    chineseName: "虚极境",
    minChapters: 200,
    effect: {
      glowIntensity: 3,
      animationSpeed: "3s",
      // Purple/Void Theme (Mystery) - Purple Glow, White Border
      glowColor: "rgba(213, 0, 249, 0.6)",
      borderColor: "#FFFFFF",
      boxShadow: "0 0 15px rgba(213,0,249,0.5), 0 0 30px rgba(100,0,255,0.4)",
    }
  },
  {
    stage: 4,
    name: "Creation Realm Good Fortune",
    chineseName: "造化境",
    minChapters: 250,
    effect: {
      glowIntensity: 4,
      animationSpeed: "2s",
      // Full Rainbow/Divine Theme - Rainbow Glow, White Border
      glowColor: "rgba(255, 61, 0, 0.7)",
      borderColor: "#FFFFFF",
      boxShadow: "0 0 20px rgba(255,0,0,0.5), 0 0 40px rgba(0,255,0,0.3), 0 0 60px rgba(0,0,255,0.3)",
    }
  }
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

// Helper untuk menghitung stage detail (e.g., 5th Star)
export const getBadgeStageInfo = (chapterCount: number) => {
  const currentTier = getBadgeInfo(chapterCount);
  const nextTierIndex = BADGE_TIERS.indexOf(currentTier) + 1;
  const nextTier = BADGE_TIERS[nextTierIndex];
  const isGodTier = currentTier.style.glow === "rainbow";

  // === SPECIAL HANDLING UNTUK MARTIAL GOD ===
  if (isGodTier) {
    // Cari God stage saat ini berdasarkan chapter count
    let godStage = GOD_STAGES[0];
    for (const stage of GOD_STAGES) {
      if (chapterCount >= stage.minChapters) {
        godStage = stage;
      } else {
        break;
      }
    }

    const nextGodStageIndex = GOD_STAGES.indexOf(godStage) + 1;
    const nextGodStage = GOD_STAGES[nextGodStageIndex];

    const progressInCurrentStage = nextGodStage
      ? (chapterCount - godStage.minChapters) / (nextGodStage.minChapters - godStage.minChapters)
      : 1;

    const chaptersToNextStage = nextGodStage
      ? nextGodStage.minChapters - chapterCount
      : 0;

    return {
      ...currentTier,
      currentStage: godStage.stage,
      progressInCurrentStage,
      chaptersPerStage: nextGodStage ? nextGodStage.minChapters - godStage.minChapters : 0,
      chaptersToNextStage,
      isMaxStage: godStage.stage === 4,
      // God-specific info
      godStageName: godStage.name,
      godStageChineseName: godStage.chineseName,
      godStageEffect: godStage.effect,
      isGodTier: true
    };
  }

  // === TIER NORMAL ===
  const chaptersInCurrentTier = chapterCount - currentTier.minChapters;

  const chaptersPerStage = nextTier
    ? (nextTier.minChapters - currentTier.minChapters) / currentTier.maxStages
    : 10;

  let currentStage = Math.floor(chaptersInCurrentTier / chaptersPerStage) + 1;

  if (currentStage > currentTier.maxStages) {
    currentStage = currentTier.maxStages;
  }

  const progressInCurrentStage = currentStage < currentTier.maxStages
    ? (chaptersInCurrentTier % chaptersPerStage) / chaptersPerStage
    : 1;

  const chaptersToNextStage = currentStage < currentTier.maxStages
    ? Math.ceil(chaptersPerStage - (chaptersInCurrentTier % chaptersPerStage))
    : nextTier
      ? nextTier.minChapters - chapterCount
      : 0;

  return {
    ...currentTier,
    currentStage,
    progressInCurrentStage,
    chaptersPerStage: Math.ceil(chaptersPerStage),
    chaptersToNextStage,
    isMaxStage: currentStage === currentTier.maxStages,
    godStageName: null as string | null,
    godStageChineseName: null as string | null,
    godStageEffect: null as typeof GOD_STAGES[0]['effect'] | null,
    isGodTier: false
  };
};