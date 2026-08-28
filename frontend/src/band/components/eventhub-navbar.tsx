"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ChevronDown,
  Building2,
  Mic2,
  Music2,
  User,
  LogOut,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { loggedOut } from "@/store/slices/auth-slice";
import { ROUTES } from "@/constants";

export function EventHubNavbar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [exploreOpen, setExploreOpen] = useState(false);
  const [providerOpen, setProviderOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const handleLogout = () => {
    dispatch(loggedOut());
    router.push(ROUTES.LOGIN);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/85 backdrop-blur-md border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo matching uploaded reference */}
        <Link href="/band" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-pink-600/30 group-hover:scale-105 transition-transform">
            <span className="text-xl font-black leading-none">★</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
              EventHub
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-pink-400">
              Celebrate Every Moment
            </span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-300">
          {/* Explore Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setExploreOpen(!exploreOpen);
                setProviderOpen(false);
                setRegisterOpen(false);
              }}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <span>Explore</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {exploreOpen && (
              <div
                className="absolute top-full left-0 mt-3 w-56 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-white/10 shadow-2xl p-2 z-50 animate-fade-in-up"
                onMouseLeave={() => setExploreOpen(false)}
              >
                <Link
                  href="/band/search?kind=venues"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
                  onClick={() => setExploreOpen(false)}
                >
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <div>
                    <p className="text-xs font-bold">Venues</p>
                    <p className="text-[10px] text-slate-400">Banquet halls & resorts</p>
                  </div>
                </Link>
                <Link
                  href="/band/search?kind=artists"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
                  onClick={() => setExploreOpen(false)}
                >
                  <Mic2 className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="text-xs font-bold">Artists</p>
                    <p className="text-[10px] text-slate-400">Singers, DJs & performers</p>
                  </div>
                </Link>
                <Link
                  href="/band/search?kind=bands"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
                  onClick={() => setExploreOpen(false)}
                >
                  <Music2 className="w-4 h-4 text-blue-400" />
                  <div>
                    <p className="text-xs font-bold">Bands</p>
                    <p className="text-[10px] text-slate-400">Live bands & orchestras</p>
                  </div>
                </Link>
              </div>
            )}
          </div>

          <Link href="/band/search" className="hover:text-white transition-colors">
            How It Works
          </Link>

          {/* For Providers Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setProviderOpen(!providerOpen);
                setExploreOpen(false);
                setRegisterOpen(false);
              }}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <span>For Providers</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {providerOpen && (
              <div
                className="absolute top-full left-0 mt-3 w-60 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-white/10 shadow-2xl p-2 z-50 animate-fade-in-up"
                onMouseLeave={() => setProviderOpen(false)}
              >
                <Link
                  href="/band/provider/onboarding"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
                  onClick={() => setProviderOpen(false)}
                >
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <div>
                    <p className="text-xs font-bold">Join as Provider</p>
                    <p className="text-[10px] text-slate-400">List your band, artist or venue</p>
                  </div>
                </Link>
                <Link
                  href="/band/provider/dashboard"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
                  onClick={() => setProviderOpen(false)}
                >
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="text-xs font-bold">Provider Dashboard</p>
                    <p className="text-[10px] text-slate-400">Manage bookings & calendar</p>
                  </div>
                </Link>
              </div>
            )}
          </div>

          <Link href={ROUTES.SELECT_PRODUCT} className="hover:text-white transition-colors text-slate-400">
            Switch Product
          </Link>
        </nav>

        {/* Right Authentication Controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs"
              >
                <Link href="/band/dashboard">My Dashboard</Link>
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white text-xs gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-slate-200 hover:text-white text-sm font-semibold"
              >
                <Link href={ROUTES.LOGIN}>Login</Link>
              </Button>

              <div className="relative">
                <Button
                  onClick={() => {
                    setRegisterOpen(!registerOpen);
                    setExploreOpen(false);
                    setProviderOpen(false);
                  }}
                  size="sm"
                  className="h-10 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold shadow-lg shadow-pink-600/30 text-xs gap-1.5"
                >
                  <span>Register</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </Button>

                {registerOpen && (
                  <div
                    className="absolute top-full right-0 mt-3 w-64 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-white/10 shadow-2xl p-2.5 z-50 animate-fade-in-up"
                    onMouseLeave={() => setRegisterOpen(false)}
                  >
                    <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Join as
                    </p>
                    <Link
                      href={ROUTES.REGISTER}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
                      onClick={() => setRegisterOpen(false)}
                    >
                      <User className="w-4 h-4 text-pink-400" />
                      <div>
                        <p className="text-xs font-bold">User / Customer</p>
                        <p className="text-[10px] text-slate-400">Plan & book for your event</p>
                      </div>
                    </Link>
                    <Link
                      href="/band/provider/onboarding"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
                      onClick={() => setRegisterOpen(false)}
                    >
                      <Building2 className="w-4 h-4 text-amber-400" />
                      <div>
                        <p className="text-xs font-bold">Venue Owner</p>
                        <p className="text-[10px] text-slate-400">List venue & get bookings</p>
                      </div>
                    </Link>
                    <Link
                      href="/band/provider/onboarding"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
                      onClick={() => setRegisterOpen(false)}
                    >
                      <Mic2 className="w-4 h-4 text-purple-400" />
                      <div>
                        <p className="text-xs font-bold">Artist</p>
                        <p className="text-[10px] text-slate-400">Showcase your talent</p>
                      </div>
                    </Link>
                    <Link
                      href="/band/provider/onboarding"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
                      onClick={() => setRegisterOpen(false)}
                    >
                      <Music2 className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-xs font-bold">Band</p>
                        <p className="text-[10px] text-slate-400">Perform more live events</p>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
