export interface MapData {
  id: string;
  name: string;
  src: string;
}

export const MAPS_DATABASE: Record<string, MapData> = {
  bermuda: {
    id: "bermuda",
    name: "Bermuda",
    src: "/images/maps/Free_Fire_Map_Bermuda_2023.png"
  },
  purgatory: {
    id: "purgatory",
    name: "Purgatory",
    src: "/images/maps/Map_FF_Purgatory_allmode.jpeg"
  },
  kalahari: {
    id: "kalahari",
    name: "Kalahari",
    src: "/images/maps/Map_FF_Kalahari_allmode.jpeg"
  },
  alpine: {
    id: "alpine",
    name: "Alpine",
    src: "/images/maps/Map_FF_Alpine_allmode.jpeg"
  },
  nexterra: {
    id: "nexterra",
    name: "Nexterra",
    src: "/images/maps/nextera.jpeg"
  },
  solara: {
    id: "solara",
    name: "Solara",
    src: "/images/maps/1200px-Map_FF_Solara_allmode.jpg"
  }
};
