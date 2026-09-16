export const GRID_SIZE = 15;

export const PLAYER_ORDER = ['red', 'green', 'yellow', 'blue'];

export const PLAYER_CONFIG = {
  red: {
    id: 'red',
    name: 'Red',
    startIndex: 0,
    homeTurnIndex: 50,
    baseCoords: [
      { r: 2, c: 2 },
      { r: 2, c: 3 },
      { r: 3, c: 2 },
      { r: 3, c: 3 },
    ],
    homePath: [
      { r: 7, c: 1 },
      { r: 7, c: 2 },
      { r: 7, c: 3 },
      { r: 7, c: 4 },
      { r: 7, c: 5 },
    ],
  },
  green: {
    id: 'green',
    name: 'Green',
    startIndex: 13,
    homeTurnIndex: 11,
    baseCoords: [
      { r: 2, c: 11 },
      { r: 2, c: 12 },
      { r: 3, c: 11 },
      { r: 3, c: 12 },
    ],
    homePath: [
      { r: 1, c: 7 },
      { r: 2, c: 7 },
      { r: 3, c: 7 },
      { r: 4, c: 7 },
      { r: 5, c: 7 },
    ],
  },
  yellow: {
    id: 'yellow',
    name: 'Yellow',
    startIndex: 26,
    homeTurnIndex: 24,
    baseCoords: [
      { r: 11, c: 11 },
      { r: 11, c: 12 },
      { r: 12, c: 11 },
      { r: 12, c: 12 },
    ],
    homePath: [
      { r: 7, c: 13 },
      { r: 7, c: 12 },
      { r: 7, c: 11 },
      { r: 7, c: 10 },
      { r: 7, c: 9 },
    ],
  },
  blue: {
    id: 'blue',
    name: 'Blue',
    startIndex: 39,
    homeTurnIndex: 37,
    baseCoords: [
      { r: 11, c: 2 },
      { r: 11, c: 3 },
      { r: 12, c: 2 },
      { r: 12, c: 3 },
    ],
    homePath: [
      { r: 13, c: 7 },
      { r: 12, c: 7 },
      { r: 11, c: 7 },
      { r: 10, c: 7 },
      { r: 9, c: 7 },
    ],
  },
};

// 52 common track squares around the perimeter of the cross
export const TRACK_COORDS = [
  { r: 6, c: 1 }, // 0 (Red start) [Star]
  { r: 6, c: 2 }, // 1
  { r: 6, c: 3 }, // 2
  { r: 6, c: 4 }, // 3
  { r: 6, c: 5 }, // 4
  { r: 5, c: 6 }, // 5
  { r: 4, c: 6 }, // 6
  { r: 3, c: 6 }, // 7
  { r: 2, c: 6 }, // 8 [Star]
  { r: 1, c: 6 }, // 9
  { r: 0, c: 6 }, // 10
  { r: 0, c: 7 }, // 11
  { r: 0, c: 8 }, // 12
  { r: 1, c: 8 }, // 13 (Green start) [Star]
  { r: 2, c: 8 }, // 14
  { r: 3, c: 8 }, // 15
  { r: 4, c: 8 }, // 16
  { r: 5, c: 8 }, // 17
  { r: 6, c: 9 }, // 18
  { r: 6, c: 10 }, // 19
  { r: 6, c: 11 }, // 20
  { r: 6, c: 12 }, // 21 [Star]
  { r: 6, c: 13 }, // 22
  { r: 6, c: 14 }, // 23
  { r: 7, c: 14 }, // 24
  { r: 8, c: 14 }, // 25
  { r: 8, c: 13 }, // 26 (Yellow start) [Star]
  { r: 8, c: 12 }, // 27
  { r: 8, c: 11 }, // 28
  { r: 8, c: 10 }, // 29
  { r: 8, c: 9 }, // 30
  { r: 9, c: 8 }, // 31
  { r: 10, c: 8 }, // 32
  { r: 11, c: 8 }, // 33
  { r: 12, c: 8 }, // 34 [Star]
  { r: 13, c: 8 }, // 35
  { r: 14, c: 8 }, // 36
  { r: 14, c: 7 }, // 37
  { r: 14, c: 6 }, // 38
  { r: 13, c: 6 }, // 39 (Blue start) [Star]
  { r: 12, c: 6 }, // 40
  { r: 11, c: 6 }, // 41
  { r: 10, c: 6 }, // 42
  { r: 9, c: 6 }, // 43
  { r: 8, c: 5 }, // 44
  { r: 8, c: 4 }, // 45
  { r: 8, c: 3 }, // 46
  { r: 8, c: 2 }, // 47 [Star]
  { r: 8, c: 1 }, // 48
  { r: 8, c: 0 }, // 49
  { r: 7, c: 0 }, // 50
  { r: 6, c: 0 }, // 51
];

// Star safe squares indices on TRACK_COORDS
export const SAFE_INDICES = [0, 8, 13, 21, 26, 34, 39, 47];

export const TOTAL_STEPS = 56; // 0=start, 50=last track step, 51..55=home corridor, 56=home
export const HOME_STEP = 56;
