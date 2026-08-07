import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Compass, MapPinOff, ArrowLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground select-none">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6 bg-card p-8 rounded-3xl border border-border/80 shadow-md">
          {/* Animated 404 Badge & Icon */}
          <div className="relative inline-flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-inner">
              <MapPinOff className="w-12 h-12" />
            </div>
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-extrabold text-xs px-2.5 py-0.5 rounded-full shadow-xs">
              404
            </span>
          </div>

          {/* Title & Filipino Commuter Message */}
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              Ligaw na Ruta!
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Mukhang maling terminal o hindi umiiral na daan ang napuntahan mo. Walang commute route o pahina na nahanap sa address na ito.
            </p>
          </div>

          {/* Commute Tip Box */}
          <div className="p-3.5 bg-muted/40 border border-border/60 rounded-2xl text-left text-xs space-y-1">
            <span className="font-bold text-foreground block">
              💡 Tip sa Nawawalang Biyahero:
            </span>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Subukang bumalik sa pambansang feed homepage o magtanong sa komunidad para makakuha ng tamang sakayan.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            <Link href="/feed" className="w-full sm:w-auto">
              <Button size="default" className="w-full gap-2 font-bold rounded-xl shadow-xs cursor-pointer text-xs">
                <ArrowLeft className="w-4 h-4" />
                <span>Bumalik sa Feed</span>
              </Button>
            </Link>  
          </div>
        </div>
      </main>
    </div>
  );
}
