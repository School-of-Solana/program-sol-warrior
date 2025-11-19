"use client";
import { useContext } from "react";
import { BalanceContext } from "../../context/BalContext";

export const SOLBalance = () => {
  const context = useContext(BalanceContext);
  const { walletBalance } = context;

  return (
    <div>
      {
        <p className="font-semibold text-white text-base flex items-center justify-center ">
          <span
            className="px-1 pl-3 animate-fadeInUp  transition-all  duration-500"
            style={{
              display: "inline-block",
              animation: "fadeInUp 0.6s",
            }}
          >
            {Number(walletBalance)}
          </span>
          <style jsx>{`
            @keyframes fadeInUp {
              0% {
                opacity: 0;
                transform: translateY(8px);
              }
              100% {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>

          <span className="text-base hidden sm:block"> SOL </span>
        </p>
      }
    </div>
  );
};
