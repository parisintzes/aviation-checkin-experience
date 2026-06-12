"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

export default function LiveQAPage() {
  const [currentTransmission, setCurrentTransmission] = useState(null);

  async function fetchCurrentTransmission() {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("status", "approved")
      .eq("is_current", true)
      .order("approved_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error) {
      setCurrentTransmission(data);
    }
  }

  useEffect(() => {
    fetchCurrentTransmission();

    const channel = supabase
      .channel("live-qa-screen")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "questions" },
        fetchCurrentTransmission
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#02050c] text-white">
      <div className="relative flex min-h-screen items-center justify-center px-10 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(215,162,71,0.20),transparent_38%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#071a33]/60 via-[#02050c] to-[#010309]" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.06)_46%,transparent_58%)] opacity-40" />

        <div className="absolute left-10 right-10 top-8 z-10 flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.5em] text-[#d7a247]/90">
            OMMT AIRLINES
          </p>

          <p className="text-[10px] uppercase tracking-[0.4em] text-white/36">
            Live Q&amp;A System
          </p>
        </div>

        <motion.section
          className="relative z-10 w-full max-w-6xl"
          initial={{ opacity: 0, y: 28, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="text-center">
            <p className="mb-7 text-[12px] uppercase tracking-[0.55em] text-[#d7a247]/90">
              Captain&apos;s Communication
            </p>

            <h1 className="mx-auto max-w-5xl text-[5.4rem] font-semibold leading-[0.9] tracking-[-0.065em] text-white">
              Now receiving passenger transmissions.
            </h1>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentTransmission?.id || "waiting"}
              className="mx-auto mt-16 max-w-5xl overflow-hidden rounded-[2.8rem] border border-[#d7a247]/22 bg-white/[0.045] shadow-[0_34px_100px_rgba(0,0,0,0.58)] backdrop-blur-2xl"
              initial={{ opacity: 0, scale: 0.96, y: 32, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.98, y: -20, filter: "blur(8px)" }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative p-14">
                <div className="absolute right-[-12%] top-[-20%] h-72 w-72 rounded-full bg-[#d7a247]/12 blur-3xl" />

                <div className="relative flex items-center justify-between border-b border-white/10 pb-8">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.42em] text-[#d7a247]/85">
                      Passenger Transmission
                    </p>
                    <p className="mt-3 text-[10px] uppercase tracking-[0.34em] text-white/38">
                      CABIN CHANNEL LIVE
                    </p>
                  </div>

                  <div className="rounded-full border border-[#d7a247]/30 bg-[#d7a247]/10 px-5 py-3">
                    <p className="text-[10px] uppercase tracking-[0.34em] text-[#f7d27a]">
                      {currentTransmission ? "Now On Air" : "Awaiting Clearance"}
                    </p>
                  </div>
                </div>

                <div className="relative mt-12">
                  <p className="text-[4rem] font-light leading-[1.08] tracking-[-0.055em] text-white">
                    {currentTransmission?.question || "Awaiting captain clearance."}
                  </p>
                </div>

                <div className="mt-14 flex items-center justify-between border-t border-white/10 pt-8">
                  <p className="text-[10px] uppercase tracking-[0.36em] text-white/32">
                    Approved by admin
                  </p>

                  <p className="text-[10px] uppercase tracking-[0.36em] text-white/32">
                    OMMTo...New Horizons
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <p className="mt-12 text-center text-[11px] uppercase tracking-[0.45em] text-white/30">
            Questions appear after captain clearance
          </p>
        </motion.section>
      </div>
    </main>
  );
}
