"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { LeftSidebar } from "@/components/layout/left-sidebar";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { ShieldCheck, CheckCircle2, AlertTriangle, Compass, MapPin, HeartHandshake, RefreshCw, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RulesClientContainer() {
  const searchParams = useSearchParams();
  const isNewUser = searchParams?.get("welcome") === "true";

  const rules = [
    {
      id: 1,
      title: "1. Tapat at Subok na Ruta (Human Source of Truth)",
      tagline: "Ang tunay na biyahero ang pinagmumulan ng tama at totoong impormasyon.",
      description: "Bawat commute direction ay dapat nagmumula sa aktwal na karanasan ng kapwa commuter. Hindi nag-iimbento ng ruta ang aming platform o ang AI retreiver.",
      icon: CheckCircle2,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      id: 2,
      title: "2. Zero Route Fabrication & Misinformation",
      tagline: "Buhay, oras, at pera ng biyahero ang nakasalalay sa bawat sagot.",
      description: "Bawal ang hula-hula, pekeng sakayan, o maling pamasahe. Ang pagbibigay ng maling ruta ay maaaring magdulot ng peligro sa kapwa commuter sa unfamiliar na lugar.",
      icon: AlertTriangle,
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    },
    {
      id: 3,
      title: "3. Landmark & Terminal Based Navigation",
      tagline: "Gumamit ng malinaw na palatandaan na madaling makita ng commuters.",
      description: "Sa Pilipinas, ang commute ay batay sa landmarks ('baba sa tapat ng Jollibee sa kanto', 'sumakay sa UV terminal sa tabi ng mall'). Iwasan ang pagbibigay ng hindi malinaw na street numbers.",
      icon: MapPin,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      id: 4,
      title: "4. Bayanihan & Respectful Taglish Culture",
      tagline: "Magtulungan tayong lahat nang may paggalang sa bawat isa.",
      description: "Respetuhin ang kapwa commuters. Bawal ang pambabastos, panlalait sa baguhang biyahero, spamming, o pagpopost ng mga patalastas at online selling.",
      icon: HeartHandshake,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      id: 5,
      title: "5. Panatilihing Bago ang Impormasyon",
      tagline: "I-upvote ang updated na sakayan at i-report ang mga lumang ruta.",
      description: "Nag-iiba ang ruta ng jeep at pamasahe. I-upvote ang pinakabagong tamang sagot at i-flag ang mga nalipat na terminal para lagi tayong accurate.",
      icon: RefreshCw,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6 w-full flex-1">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <aside className="hidden lg:block lg:col-span-3 sticky top-22">
            <LeftSidebar />
          </aside>

          <main className="col-span-1 md:col-span-8 lg:col-span-6 space-y-4">
            {/* New User Welcome Notice Banner */}
            {isNewUser && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-blue-950 to-emerald-950 border border-emerald-500/40 text-white shadow-lg space-y-3 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <PartyPopper className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                      Maligayang Pagdating sa KOMYUT! 🎉
                    </h2>
                    <p className="text-xs text-emerald-300 font-medium">
                      Bago ka magsimula mag-post o sumagot sa ating komunidad, mangyaring basahin muna ang 5 pangunahing alituntunin sa ibaba.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Page Header Banner */}
            <div className="bg-card p-5 rounded-2xl border border-border/80 shadow-xs space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="font-extrabold text-lg sm:text-xl text-foreground tracking-tight">
                    KOMYUT Community Guidelines
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Mga Alituntunin at Gabay sa Ligtas at Tapat na Commute Knowledge Sharing
                  </p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed pt-2 border-t border-border/60">
                Ang KOMYUT ay binuo upang gawing accessible, permanent, at searchable ang commute knowledge sa buong Pilipinas. Sundin ang mga alituntuning ito upang manatiling ligtas at subok ang ating komunidad.
              </p>
            </div>

            {/* Rules Cards List */}
            <div className="space-y-3.5">
              {rules.map((rule) => {
                const IconComponent = rule.icon;
                return (
                  <div
                    key={rule.id}
                    className="bg-card p-4 rounded-2xl border border-border/80 shadow-xs space-y-2 hover:border-border transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl border shrink-0 ${rule.color}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-foreground">
                          {rule.title}
                        </h3>
                        <p className="text-[11px] font-semibold text-muted-foreground">
                          {rule.tagline}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed pl-12">
                      {rule.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Bottom Acknowledgement Callout */}
            <div className="bg-card p-5 rounded-2xl border border-border/80 shadow-xs text-center space-y-3">
              <h4 className="font-bold text-sm text-foreground">
                Sama-sama nating panatilihing ligtas at kapaki-pakinabang ang KOMYUT!
              </h4>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Sa bawat tamang sakayan na ibinabahagi mo, nakatutulong ka sa libu-libong kapwa Pilipinong biyahero araw-araw.
              </p>
              <Link href="/feed" className="inline-block">
                <Button size="sm" className="gap-2 font-bold rounded-full shadow-xs cursor-pointer">
                  <Compass className="w-4 h-4" />
                  <span>Naintindihan Ko, Bumalik sa Feed</span>
                </Button>
              </Link>
            </div>
          </main>

          <div className="hidden md:block md:col-span-4 lg:col-span-3 sticky top-22">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
