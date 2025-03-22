"use client";
import React, { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

 const PixelTracker: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    import("react-facebook-pixel")
      .then((x) => x.default)
      .then((ReactPixel) => {
        ReactPixel.init("986764633204777"); 
        ReactPixel.pageView();
      });
  }, [pathname, searchParams]);

  return null;
};
export default PixelTracker