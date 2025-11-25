import React from "react";
import ConnectWallet from "./WalletConnect";
import Link from "next/link";
import Image from "next/image";
import tiplogo from "@/src/images/tiplogo.png";

const Navbar = () => {
  return (
    <div className="flex  items-center justify-between w-full">
      <Link href={"/"}>
        {/* <h1 className="text-2xl font-semibold text-[#000000ba]">Tipping</h1> */}

        <div className="flex items-center justify-center w-10 ">
          <Image alt="tip logo" src={tiplogo} width={60} />
        </div>
      </Link>
      <ConnectWallet />
    </div>
  );
};

export default Navbar;
