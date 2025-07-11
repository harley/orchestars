declare module 'jsqr' {
  export interface Point {
    x: number;
    y: number;
  }

  export interface QRCode {
    binaryData: number[];
    data: string;
    location: {
      topRightCorner: Point;
      topLeftCorner: Point;
      bottomRightCorner: Point;
      bottomLeftCorner: Point;
      topRightFinderPattern: Point;
      topLeftFinderPattern: Point;
      bottomLeftFinderPattern: Point;
    };
    version: number;
  }

  export default function jsQR(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    options?: {
      inversionAttempts?: 'dontInvert' | 'onlyInvert' | 'attemptBoth';
    },
  ): QRCode | null;
} 