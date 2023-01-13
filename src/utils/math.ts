export const PiDivBy2 = Math.PI / 2;
export const PiDivBy180 = Math.PI / 180;

export const degree2Radian = (degree: number) => degree * PiDivBy180;

export const degreeWithin0to360 = (degree: number) => {
  degree = degree % 360;
  return Math.sign(degree) < 0 ? degree + 360 : degree;
};

export const sinByDegree = (degree: number) => {
  switch (degree) {
    case 0:
    case 180:
      return 0;
    case 90:
      return 1;
    case 270:
      return -1;
    default:
      return Math.sin(degree2Radian(degree));
  }
};

export const cosByDegree = (degree: number) => {
  switch (degree) {
    case 0:
      return 1;
    case 180:
      return -1;
    case 90:
    case 270:
      return 0;
    default:
      return Math.cos(degree2Radian(degree));
  }
};
