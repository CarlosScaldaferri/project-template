import React from "react";
import CustomImage from "../form/image/CustomImage";

const Logo = () => {
  return (
    <div className="logo-container grid place-items-center">
      <CustomImage src="/img/general/logo.png" className="h-16 w-auto" />
      <h className="absolute text-center font-bold">
        CODE <br /> CADU
      </h>
    </div>
  );
};

export default Logo;
