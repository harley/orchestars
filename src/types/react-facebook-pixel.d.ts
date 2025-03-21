declare module 'react-facebook-pixel' {
    const ReactPixel: {
      init: (pixelId: string, options?: Record<string, any>) => void;
      pageView: () => void;
      track: (event: string, data?: Record<string, any>) => void;
      trackCustom: (event: string, data?: Record<string, any>) => void;
    };
  
    export default ReactPixel;
  }
