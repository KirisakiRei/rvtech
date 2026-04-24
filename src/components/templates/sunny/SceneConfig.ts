export type Keyframe = {
  progress: number;
  x: number;
  y: number;
  scale: number;
  rotate: number;
  opacity: number;
};

export type SceneElement = {
  speed: number;
  keyframes: Keyframe[];
};

export type Scene = {
  smoothingFactor?: number;
  [elementId: string]: SceneElement | number | undefined;
};

export const scenes: Scene[] = [
                  {
                    smoothingFactor: 0.015,
                    coverOverlay: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 0,
                          y: 0,
                          scale: 1,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 0.8,
                          x: 0,
                          y: 0,
                          scale: 1,
                          rotate: 0,
                          opacity: 0,
                        },
                      ],
                    },
                    coverImage: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 0,
                          y: 0,
                          scale: 1,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 0.5,
                          x: 0,
                          y: 0,
                          scale: 1,
                          rotate: 0,
                          opacity: 0,
                        },
                      ],
                    },
                    coverText: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 0,
                          y: 0,
                          scale: 1,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 0.6,
                          x: 0,
                          y: 80,
                          scale: 0.5,
                          rotate: 0,
                          opacity: 0,
                        },
                      ],
                    },
                    guest: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 0,
                          y: 0,
                          scale: 1,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 0.6,
                          x: 0,
                          y: 400,
                          scale: 0.5,
                          rotate: 0,
                          opacity: 0,
                        },
                      ],
                    },
                    verse: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 0,
                          y: 50,
                          scale: 0.5,
                          rotate: 0,
                          opacity: 0,
                        },
                        {
                          progress: 0.5,
                          x: 0,
                          y: -60,
                          scale: 0.5,
                          rotate: 0,
                          opacity: 0,
                        },
                        {
                          progress: 1,
                          x: 0,
                          y: -80,
                          scale: 1,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                    scrollIndicator: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 0,
                          y: 0,
                          scale: 1,
                          rotate: 0,
                          opacity: 0,
                        },
                        {
                          progress: 1,
                          x: 0,
                          y: 0,
                          scale: 1,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                    bg: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 0,
                          y: 0,
                          scale: 1,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 1,
                          x: 0,
                          y: 0,
                          scale: 1.1,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                    flower3: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 0,
                          y: -5,
                          scale: 1.25,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 1,
                          x: 0,
                          y: 10,
                          scale: 1.38,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                    couple: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 0,
                          y: 70,
                          scale: 0.55,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 1,
                          x: 0,
                          y: 70,
                          scale: 0.68,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                    flower2: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 217,
                          y: -10,
                          scale: 1.55,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 1,
                          x: 271,
                          y: 0,
                          scale: 1.95,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                    flower1: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 151,
                          y: -5,
                          scale: 1.5,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 1,
                          x: 215,
                          y: 10,
                          scale: 2.15,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                  },
                  {
                    verse: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 0,
                          y: -80,
                          scale: 1,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 0.5,
                          x: 0,
                          y: -100,
                          scale: 1.5,
                          rotate: 0,
                          opacity: 0,
                        },
                      ],
                    },
                    couple: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 0,
                          y: 70,
                          scale: 0.68,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 0.7,
                          x: 0,
                          y: 70,
                          scale: 1.2,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 1,
                          x: -100,
                          y: 70,
                          scale: 1.4,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                    groom: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 0,
                          y: 0,
                          scale: 1,
                          rotate: 0,
                          opacity: 0,
                        },
                        {
                          progress: 0.8,
                          x: 0,
                          y: 50,
                          scale: 0.8,
                          rotate: 0,
                          opacity: 0,
                        },
                        {
                          progress: 1,
                          x: 0,
                          y: 0,
                          scale: 1,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                    bottomGradient: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 0,
                          y: 0,
                          scale: 1,
                          rotate: 0,
                          opacity: 0,
                        },
                        {
                          progress: 0.8,
                          x: 0,
                          y: 0,
                          scale: 1,
                          rotate: 0,
                          opacity: 0,
                        },
                        {
                          progress: 1,
                          x: 0,
                          y: 0,
                          scale: 1,
                          rotate: 0,
                          opacity: 0.8,
                        },
                      ],
                    },
                    flower1: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 215,
                          y: 10,
                          scale: 2.15,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 0.7,
                          x: 598,
                          y: 140,
                          scale: 5.5,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 1,
                          x: 550,
                          y: 140,
                          scale: 5.8,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                    flower2: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 271,
                          y: 0,
                          scale: 1.95,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 0.7,
                          x: 535,
                          y: 110,
                          scale: 3.8,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 1,
                          x: 465,
                          y: 115,
                          scale: 4.1,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                    flower3: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 0,
                          y: 10,
                          scale: 1.38,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 0.7,
                          x: 0,
                          y: 60,
                          scale: 1.88,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 1,
                          x: -75,
                          y: 65,
                          scale: 1.95,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                    bg: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 0,
                          y: 0,
                          scale: 1.1,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 0.7,
                          x: 0,
                          y: -5,
                          scale: 1.2,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 1,
                          x: -20,
                          y: -5,
                          scale: 1.2,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                  },
                  {
                    couple: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: -100,
                          y: 70,
                          scale: 1.4,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 1,
                          x: 100,
                          y: 70,
                          scale: 1.4,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                    flower1: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 550,
                          y: 140,
                          scale: 5.8,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 1,
                          x: 1000,
                          y: 140,
                          scale: 5.8,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                    flower2: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 465,
                          y: 115,
                          scale: 4.1,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 1,
                          x: 720,
                          y: 115,
                          scale: 4.1,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                    bg: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: -20,
                          y: -5,
                          scale: 1.2,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 1,
                          x: 20,
                          y: -5,
                          scale: 1.2,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                    flower3: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: -75,
                          y: 65,
                          scale: 1.95,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 1,
                          x: 100,
                          y: 65,
                          scale: 1.95,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                    groom: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 0,
                          y: 0,
                          scale: 1,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 0.5,
                          x: 250,
                          y: 0,
                          scale: 1,
                          rotate: 0,
                          opacity: 0,
                        },
                      ],
                    },
                    bride: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: -250,
                          y: 0,
                          scale: 1,
                          rotate: 0,
                          opacity: 0,
                        },
                        {
                          progress: 0.4,
                          x: -250,
                          y: 0,
                          scale: 1,
                          rotate: 0,
                          opacity: 0,
                        },
                        {
                          progress: 1,
                          x: 0,
                          y: 0,
                          scale: 1,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                  },
                  {
                    bottomGradient: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 0,
                          y: 0,
                          scale: 1,
                          rotate: 0,
                          opacity: 0.8,
                        },
                        {
                          progress: 0.5,
                          x: 0,
                          y: 0,
                          scale: 1,
                          rotate: 0,
                          opacity: 0,
                        },
                      ],
                    },
                    bride: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 0,
                          y: 0,
                          scale: 1,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 0.5,
                          x: 0,
                          y: 50,
                          scale: 0.8,
                          rotate: 0,
                          opacity: 0,
                        },
                      ],
                    },
                    couple: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 100,
                          y: 70,
                          scale: 1.4,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 1,
                          x: -400,
                          y: 50,
                          scale: 1,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                    flower3: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 100,
                          y: 65,
                          scale: 1.95,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 1,
                          x: -260,
                          y: 55,
                          scale: 1.85,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                    flower2: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 720,
                          y: 115,
                          scale: 4.1,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 1,
                          x: 140,
                          y: 80,
                          scale: 3.8,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                    flower1: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 1000,
                          y: 140,
                          scale: 5.8,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 1,
                          x: -154,
                          y: 145,
                          scale: 4.8,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                    events: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 0,
                          y: 0,
                          scale: 1,
                          rotate: 0,
                          opacity: 0,
                        },
                        {
                          progress: 0.6,
                          x: 500,
                          y: 0,
                          scale: 0.5,
                          rotate: 0,
                          opacity: 0,
                        },
                        {
                          progress: 1,
                          x: 0,
                          y: -20,
                          scale: 1,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                    bg: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 20,
                          y: -5,
                          scale: 1.2,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 1,
                          x: -50,
                          y: -5,
                          scale: 1.2,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                  },
                  //dc-begin
                  {
                    events: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 0,
                          y: -20,
                          scale: 1,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 1,
                          x: 0,
                          y: -20,
                          scale: 1,
                          rotate: 0,
                          opacity: 0,
                        },
                      ],
                    },
                    dresscode: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 0,
                          y: 0,
                          scale: 1,
                          rotate: 0,
                          opacity: 0,
                        },
                        {
                          progress: 1,
                          x: 0,
                          y: 0,
                          scale: 1,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                  },
                  {
                    bg: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: -50,
                          y: -5,
                          scale: 1.2,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 1,
                          x: 0,
                          y: 0,
                          scale: 1.1,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                    flower3: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: -260,
                          y: 55,
                          scale: 1.85,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 1,
                          x: 0,
                          y: 10,
                          scale: 1.38,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                    couple: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: -400,
                          y: 50,
                          scale: 1,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 1,
                          x: 0,
                          y: 70,
                          scale: 0.68,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                    flower2: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 140,
                          y: 80,
                          scale: 3.8,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 1,
                          x: 271,
                          y: 0,
                          scale: 1.95,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                    flower1: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: -154,
                          y: 145,
                          scale: 4.8,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 1,
                          x: 215,
                          y: 10,
                          scale: 2.15,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                    dresscode: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 0,
                          y: 0,
                          scale: 1,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 0.5,
                          x: 200,
                          y: 0,
                          scale: 0.8,
                          rotate: 0,
                          opacity: 0,
                        },
                      ],
                    },
                    quotes: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 0,
                          y: 0,
                          scale: 1,
                          rotate: 0,
                          opacity: 0,
                        },
                        {
                          progress: 0.8,
                          x: 0,
                          y: -100,
                          scale: 0.8,
                          rotate: 0,
                          opacity: 0,
                        },
                        {
                          progress: 1,
                          x: 0,
                          y: -80,
                          scale: 1,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                  },
                  //dc-end
                  //ndc-begin
                  // {
                  //     "bg": {
                  //         "speed": 1,
                  //         "keyframes": [
                  //             {
                  //                 "progress": 0,
                  //                 "x": -50,
                  //                 "y": -5,
                  //                 "scale": 1.2,
                  //                 "rotate": 0,
                  //                 "opacity": 1
                  //             },
                  //             {
                  //                 "progress": 1,
                  //                 "x": 0,
                  //                 "y": 0,
                  //                 "scale": 1.1,
                  //                 "rotate": 0,
                  //                 "opacity": 1
                  //             }
                  //         ]
                  //     },
                  //     "flower3": {
                  //         "speed": 1,
                  //         "keyframes": [
                  //             {
                  //                 "progress": 0,
                  //                 "x": -260,
                  //                 "y": 55,
                  //                 "scale": 1.85,
                  //                 "rotate": 0,
                  //                 "opacity": 1
                  //             },
                  //             {
                  //                 "progress": 1,
                  //                 "x": 0,
                  //                 "y": 10,
                  //                 "scale": 1.38,
                  //                 "rotate": 0,
                  //                 "opacity": 1
                  //             }
                  //         ]
                  //     },
                  //     "couple": {
                  //         "speed": 1,
                  //         "keyframes": [
                  //             {
                  //                 "progress": 0,
                  //                 "x": -400,
                  //                 "y": 50,
                  //                 "scale": 1,
                  //                 "rotate": 0,
                  //                 "opacity": 1
                  //             },
                  //             {
                  //                 "progress": 1,
                  //                 "x": 0,
                  //                 "y": 70,
                  //                 "scale": 0.68,
                  //                 "rotate": 0,
                  //                 "opacity": 1
                  //             }
                  //         ]
                  //     },
                  //     "flower2": {
                  //         "speed": 1,
                  //         "keyframes": [
                  //             {
                  //                 "progress": 0,
                  //                 "x": 140,
                  //                 "y": 80,
                  //                 "scale": 3.8,
                  //                 "rotate": 0,
                  //                 "opacity": 1
                  //             },
                  //             {
                  //                 "progress": 1,
                  //                 "x": 271,
                  //                 "y": 0,
                  //                 "scale": 1.95,
                  //                 "rotate": 0,
                  //                 "opacity": 1
                  //             }
                  //         ]
                  //     },
                  //     "flower1": {
                  //         "speed": 1,
                  //         "keyframes": [
                  //             {
                  //                 "progress": 0,
                  //                 "x": -154,
                  //                 "y": 145,
                  //                 "scale": 4.8,
                  //                 "rotate": 0,
                  //                 "opacity": 1
                  //             },
                  //             {
                  //                 "progress": 1,
                  //                 "x": 215,
                  //                 "y": 10,
                  //                 "scale": 2.15,
                  //                 "rotate": 0,
                  //                 "opacity": 1
                  //             }
                  //         ]
                  //     },
                  //     "events": {
                  //         "speed": 1,
                  //         "keyframes": [
                  //             {
                  //                 "progress": 0,
                  //                 "x": 0,
                  //                 "y": -20,
                  //                 "scale": 1,
                  //                 "rotate": 0,
                  //                 "opacity": 1
                  //             },
                  //             {
                  //                 "progress": 0.5,
                  //                 "x": 200,
                  //                 "y": 0,
                  //                 "scale": 0.8,
                  //                 "rotate": 0,
                  //                 "opacity": 0
                  //             }
                  //         ]
                  //     },
                  //     "quotes": {
                  //         "speed": 1,
                  //         "keyframes": [
                  //             {
                  //                 "progress": 0,
                  //                 "x": 0,
                  //                 "y": 0,
                  //                 "scale": 1,
                  //                 "rotate": 0,
                  //                 "opacity": 0
                  //             },
                  //             {
                  //                 "progress": 0.8,
                  //                 "x": 0,
                  //                 "y": -100,
                  //                 "scale": 0.8,
                  //                 "rotate": 0,
                  //                 "opacity": 0
                  //             },
                  //             {
                  //                 "progress": 1,
                  //                 "x": 0,
                  //                 "y": -80,
                  //                 "scale": 1,
                  //                 "rotate": 0,
                  //                 "opacity": 1
                  //             }
                  //         ]
                  //     }
                  // },
                  //ndc-end
                  {
                    quotes: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 0,
                          y: -80,
                          scale: 1,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 0.5,
                          x: 0,
                          y: -80,
                          scale: 1.2,
                          rotate: 0,
                          opacity: 0,
                        },
                      ],
                    },
                    couple: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 0,
                          y: 70,
                          scale: 0.68,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 1,
                          x: 0,
                          y: 70,
                          scale: 0.75,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                    flower3: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 0,
                          y: 10,
                          scale: 1.38,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 1,
                          x: 0,
                          y: 15,
                          scale: 1.45,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                    flower2: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 271,
                          y: 0,
                          scale: 1.95,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 1,
                          x: 303,
                          y: 0,
                          scale: 2.2,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                    flower1: {
                      speed: 1,
                      keyframes: [
                        {
                          progress: 0,
                          x: 215,
                          y: 10,
                          scale: 2.15,
                          rotate: 0,
                          opacity: 1,
                        },
                        {
                          progress: 1,
                          x: 257,
                          y: 10,
                          scale: 2.5,
                          rotate: 0,
                          opacity: 1,
                        },
                      ],
                    },
                  },
                ];
