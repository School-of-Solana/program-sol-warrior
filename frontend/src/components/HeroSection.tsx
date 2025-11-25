"use client";

import {
  ArrowRight,
  Users,
  Coins,
  Sparkles,
  CoinsIcon,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import solanaImg from "@/src/images/solana.png";
import Image from "next/image";

export function HeroSection({
  isWalletConnected,
}: {
  isWalletConnected: boolean;
}) {
  return (
    <section className="text-center py-20 md:py-32 max-w-5xl mx-auto">
      <div className="space-y-8 relative">
        <div className=" inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-primary/40 mb-6">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            <span className="inline-flex items-center gap-2">
              Powered by
              <Image
                src={solanaImg}
                alt="Solana"
                className="inline-block w-4 h-4 align-middle"
              />
            </span>
          </span>
        </div>

        <h1 className="text-6xl md:text-8xl font-bold text-balance leading-[1.1] tracking-tight">
          {"Support the "}
          <span className="bg-linear-to-r from-primary  to-secondary bg-clip-text text-transparent inline-block">
            {"builders"}
          </span>
          <br />
          {"you love"}
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground/90 max-w-2xl mx-auto text-balance leading-relaxed">
          {
            "Empower builders with instant on-chain tips. Fast, transparent, and decentralized."
          }
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-12">
          <Button
            disabled={isWalletConnected}
            size="lg"
            className="w-full  sm:w-auto group cursor-pointer  bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base px-10 py-6 rounded-2xl neon-glow-purple transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-primary/50"
          >
            <Link
              href={"/builder"}
              className="flex items-center justify-center"
            >
              <Users className="w-5 h-5 mr-2 group-hover:rotate-6 transition-transform" />
              {"I'm a Builder"}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>

          <Button
            disabled={isWalletConnected}
            size="lg"
            className="w-full  sm:w-auto group cursor-pointer  bg-secondary hover:bg-secondary/90 text-primary-foreground font-semibold text-base px-10 py-6 rounded-2xl neon-glow-green transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-secondary/50"
          >
            <Link href={"/tipper"} className="flex items-center justify-center">
              <Coins className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              {"I want to Tip"}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
