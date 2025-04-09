"use client";

import UserLogin from "@/frontend/components/user/userLogin/UserLogin";
import CustomImage from "../form/image/CustomImage";

export default function Header() {
  return (
    <div className="fixed justify-between items-center z-50 w-full h-16 flex pr-2 pl-4 bg-light-background-sidebar dark:bg-dark-background-sidebar border-b border-light-border dark:border-dark-border">
      <CustomImage
        src="/img/general/logo codecaull.png"
        alt="Foto do usuário"
        className="object-contain w-[256px] h-auto"
        unoptimized={process.env.NEXT_PUBLIC_UNOPTIMIZED}
      />
      <UserLogin />
    </div>
  );
}
