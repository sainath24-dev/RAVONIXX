export interface Skill {
  name: string;
  type: "ACTIVE" | "PASSIVE";
  desc: string;
  iconUrl: string;
}

export interface Player {
  id: string;
  ign: string;
  realName?: string;
  role: string;
  location: string;
  uid: string;
  photoUrl: string;
  hudLayoutImageUrl?: string;
  loadout: {
    skills: Skill[];
    weapons: string[];
    weaponSkinNote?: string;
    pet?: string;
  };
  settings: {
    generalSens: number;
    redDotSens: number;
    scope2xSens: number;
    scope4xSens: number;
    sniperScopeSens: number;
    freeLookSens: number;
    dpi?: number;
    controlLayout: '2-finger' | '3-finger' | '4-finger claw' | 'custom';
    hudCode: string;
    gyroscope: boolean;
  };
  device?: string;
  achievements: string[];
  socials: { youtube?: string; instagram?: string; discord?: string; tracker?: string };
}

export const players: Player[] = [
  {
    id: "sainath",
    ign: "SAINATH",
    realName: "Sainath",
    role: "IGL / SUPPORTER",
    location: "Bangalore",
    uid: "561691696",
    photoUrl: "/character/xayne.jpeg",
    hudLayoutImageUrl: "/images/players/sainath_hud.jpeg",
    loadout: {
      skills: [
        {
          name: "Xayne",
          type: "ACTIVE",
          desc: "Extreme Encounter (HP boost & shield dmg)",
          iconUrl: "/character/xayne.jpeg"
        },
        {
          name: "Olivia",
          type: "PASSIVE",
          desc: "Healing Touch (Heal diffusion)",
          iconUrl: "/character/oliva.jpeg"
        },
        {
          name: "Thiva",
          type: "PASSIVE",
          desc: "Vital Vibes (Fast rescue & HP restore)",
          iconUrl: "/character/thiva.jpeg"
        },
        {
          name: "Joseph",
          type: "PASSIVE",
          desc: "Nutty Movement (Speed boost when hit)",
          iconUrl: "/character/joseph.jpeg"
        }
      ],
      weapons: ["AC80", "MP5"],
      weaponSkinNote: "AC80 - Golden Silencer",
      pet: "Rocky (Stay Chill skill cooldown reduction)"
    },
    settings: {
      generalSens: 200,
      redDotSens: 180,
      scope2xSens: 170,
      scope4xSens: 190,
      sniperScopeSens: 120,
      freeLookSens: 100,
      dpi: 480,
      controlLayout: "4-finger claw",
      hudCode: "#FFHUDT6O3jg0XLW9Po7eM",
      gyroscope: true
    },
    device: "ROG Phone 8 Pro",
    achievements: [
      "1st — Bangalore Elite Cup 2025",
      "MVP — Ravonixx Invitational 2026"
    ],
    socials: {
      youtube: "https://youtube.com",
      instagram: "https://instagram.com",
      discord: "sainath#5616"
    }
  },
  {
    id: "legend",
    ign: "RVX-LEGEND07",
    realName: "Legend",
    role: "IGL / SNIPER",
    location: "Bangalore",
    uid: "2137301165",
    photoUrl: "/character/rafael.jpeg",
    hudLayoutImageUrl: "/images/players/legend_hud.jpeg",
    loadout: {
      skills: [
        {
          name: "Morse",
          type: "ACTIVE",
          desc: "Stealth Bytes (Stealth & speed boost)",
          iconUrl: "/character/morse.jpeg"
        },
        {
          name: "Moco",
          type: "PASSIVE",
          desc: "Hacker's Eye (Tagged bullet tracing)",
          iconUrl: "/character/moco.jpeg"
        },
        {
          name: "Rafael",
          type: "PASSIVE",
          desc: "Dead Silent (Silenced sniper & fast bleedout)",
          iconUrl: "/character/rafael.jpeg"
        },
        {
          name: "Nikita",
          type: "PASSIVE",
          desc: "Firearms Expert (Fast reload & extra SMG damage)",
          iconUrl: "/character/nikita.jpeg"
        }
      ],
      weapons: ["M82B", "AWM"],
      weaponSkinNote: "M82B - Dragon Mobster",
      pet: "Falco (Skyline arrival & faster landing)"
    },
    settings: {
      generalSens: 190,
      redDotSens: 160,
      scope2xSens: 155,
      scope4xSens: 165,
      sniperScopeSens: 185,
      freeLookSens: 110,
      dpi: 440,
      controlLayout: "4-finger claw",
      hudCode: "#FFHUD0917hklwL105K7qP",
      gyroscope: true
    },
    device: "iPhone 15 Pro Max",
    achievements: [
      "Top Sniper — FF India Open Season 4",
      "Clutch King Award — EWC Qualifier"
    ],
    socials: {
      youtube: "https://youtube.com",
      instagram: "https://instagram.com",
      discord: "legend07#2137"
    }
  },
  {
    id: "jerry",
    ign: "RVX-JERRY",
    realName: "Jerry",
    role: "Secondary Rusher",
    location: "Bidar",
    uid: "2392560807",
    photoUrl: "/character/tatsuya.jpeg",
    hudLayoutImageUrl: "/images/players/jerry_hud.jpeg",
    loadout: {
      skills: [
        {
          name: "Tatsuya",
          type: "ACTIVE",
          desc: "Rebel Rush (Rapid dash sprint bursts)",
          iconUrl: "/character/tatsuya.jpeg"
        },
        {
          name: "Kelly",
          type: "PASSIVE",
          desc: "Dash (Permanent movement speed boost)",
          iconUrl: "/character/kelly.jpeg"
        },
        {
          name: "Maro",
          type: "PASSIVE",
          desc: "Falcon Fervor (Damage increases with distance)",
          iconUrl: "/character/maro.jpeg"
        },
        {
          name: "Hayato",
          type: "PASSIVE",
          desc: "Bushido (Armor penetration when low HP)",
          iconUrl: "/character/kassie.jpeg"
        }
      ],
      weapons: ["MP40", "M1887"],
      weaponSkinNote: "MP40 - Predatory Cobra (Level 7)",
      pet: "Beaston (Helping Hand throwable distance boost)"
    },
    settings: {
      generalSens: 200,
      redDotSens: 200,
      scope2xSens: 190,
      scope4xSens: 185,
      sniperScopeSens: 90,
      freeLookSens: 150,
      dpi: 520,
      controlLayout: "4-finger claw",
      hudCode: "#FFHUD3396pLkM782Vb11X",
      gyroscope: false
    },
    device: "RedMagic 9 Pro",
    achievements: [
      "Highest Frags — Pro League Phase 1",
      "Most Damage MVP — City Clash 2025"
    ],
    socials: {
      youtube: "https://youtube.com",
      instagram: "https://instagram.com",
      discord: "jerry#2392"
    }
  },
  {
    id: "satya",
    ign: "RVX-SATYA",
    realName: "Satya (Ayano)",
    role: "ENTRY FRAGGER",
    location: "Bangalore",
    uid: "1465958442",
    photoUrl: "/character/kassie.jpeg",
    hudLayoutImageUrl: "/images/players/satya:aayano_hud.jpeg",
    loadout: {
      skills: [
        {
          name: "Kassie",
          type: "ACTIVE",
          desc: "Electro-Recovery (Targeted healing tether)",
          iconUrl: "/character/kassie.jpeg"
        },
        {
          name: "Chrono",
          type: "ACTIVE",
          desc: "Time Turner (Spherical impenetrable shield)",
          iconUrl: "/character/chrono.jpeg"
        },
        {
          name: "Kelly",
          type: "PASSIVE",
          desc: "Dash (Permanent movement boost)",
          iconUrl: "/character/kelly.jpeg"
        },
        {
          name: "Moco",
          type: "PASSIVE",
          desc: "Hacker's Eye (Target tracking)",
          iconUrl: "/character/moco.jpeg"
        }
      ],
      weapons: ["Woodpecker", "MAG-7"],
      weaponSkinNote: "Woodpecker - Majestic Beast",
      pet: "Dreki (Dragon Glare reveals medkitting enemies)"
    },
    settings: {
      generalSens: 195,
      redDotSens: 190,
      scope2xSens: 180,
      scope4xSens: 175,
      sniperScopeSens: 110,
      freeLookSens: 120,
      dpi: 460,
      controlLayout: "4-finger claw",
      hudCode: "#FFHUD8712aNxY994Qz10C",
      gyroscope: true
    },
    device: "OnePlus 12",
    achievements: [
      "1st Place — South India Showdown 2025",
      "Clutch Play of the Tournament — FFWS Qualifiers"
    ],
    socials: {
      youtube: "https://youtube.com",
      instagram: "https://instagram.com",
      discord: "satya#1465"
    }
  },
  {
    id: "jethya",
    ign: "RVX-JETHYA",
    realName: "Jethya",
    role: "PRIMARY RUSHER",
    location: "Bidar",
    uid: "579303188",
    photoUrl: "/character/maro.jpeg",
    loadout: {
      skills: [
        {
          name: "Tatsuya",
          type: "ACTIVE",
          desc: "Rebel Rush (Sprint surge bursts)",
          iconUrl: "/character/tatsuya.jpeg"
        },
        {
          name: "Maro",
          type: "PASSIVE",
          desc: "Falcon Fervor (Ranged damage scale)",
          iconUrl: "/character/maro.jpeg"
        },
        {
          name: "Kelly",
          type: "PASSIVE",
          desc: "Dash (Speed boost)",
          iconUrl: "/character/kelly.jpeg"
        },
        {
          name: "Joseph",
          type: "PASSIVE",
          desc: "Nutty Movement (Sprint when receiving damage)",
          iconUrl: "/character/joseph.jpeg"
        }
      ],
      weapons: ["Trogon", "SVD"],
      weaponSkinNote: "Trogon - Violet Velocity",
      pet: "Ottero (Double Blubber EP restoration on Medkit)"
    },
    settings: {
      generalSens: 195,
      redDotSens: 185,
      scope2xSens: 175,
      scope4xSens: 180,
      sniperScopeSens: 100,
      freeLookSens: 130,
      dpi: 500,
      controlLayout: "4-finger claw",
      hudCode: "#FFHUD9945hQzP104Ml20B",
      gyroscope: true
    },
    device: "iQOO 12 Pro",
    achievements: [
      "Most Knockdowns — All-India Masters 2025",
      "Rush Specialist Trophy — Ravonixx Scrims"
    ],
    socials: {
      youtube: "https://youtube.com",
      instagram: "https://instagram.com",
      discord: "jethya#5793"
    }
  },
  {
    id: "arise",
    ign: "RVX-ARISE.04",
    realName: "AK(Arise)",
    role: "PRIMARY RUSHER / SECONDARY RUSHER",
    location: "India",
    uid: "2590977394",
    photoUrl: "/character/thiva.jpeg",
    loadout: {
      skills: [
        {
          name: "Kassie",
          type: "ACTIVE",
          desc: "Electro-Recovery (Targeted healing tether)",
          iconUrl: "/character/kassie.jpeg"
        },
        {
          name: "Thiva",
          type: "PASSIVE",
          desc: "Vital Vibe (Rapid squad rescue & HP burst on revive)",
          iconUrl: "/character/thiva.jpeg"
        },
        {
          name: "Nikita",
          type: "PASSIVE",
          desc: "Firearms Expert (Fast reload & bonus final-bullet SMG damage)",
          iconUrl: "/character/nikita.jpeg"
        }
      ],
      weapons: ["AC80", "Woodpecker", "M590"],
      weaponSkinNote: "AC80 & Woodpecker Tactical Setup",
      pet: "Beaston (Helping Hand throwable distance boost)"
    },
    settings: {
      generalSens: 65,
      redDotSens: 85,
      scope2xSens: 65,
      scope4xSens: 85,
      sniperScopeSens: 50,
      freeLookSens: 70,
      dpi: 480,
      controlLayout: "4-finger claw",
      hudCode: "#FFHUDT6O3jrYCvC1Po7eP",
      gyroscope: true
    },
    device: "iPhone / iPad Pro",
    achievements: [
      "Founder & Core Rusher — Ravonixx Esports",
      "TEC Student Ambassador & Tournament Director"
    ],
    socials: {
      youtube: "https://youtube.com",
      instagram: "https://instagram.com",
      discord: "mayur_bhai"
    }
  }
];
