export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.08,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

export const clipReveal = {
  hidden: { clipPath: "inset(0 100% 0 0)" },
  visible: {
    clipPath: "inset(0 0% 0 0)",
    transition: {
      duration: 0.6,
      ease: [0.65, 0, 0.35, 1] as [number, number, number, number],
    },
  },
};

export const cardTilt = {
  tiltMaxAngleX: 8,
  tiltMaxAngleY: 8,
  glareEnable: false,
  scale: 1.02,
  transitionSpeed: 400,
};

export const countUp = {
  duration: 1.2,
  ease: "easeOut" as const,
};
