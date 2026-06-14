"use client";

/*
  ============================================================
  SECTION 1 — IMPORTS
  ============================================================
*/

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";
import { supabase } from "@/lib/supabaseClient";

/*
  ============================================================
  SECTION 2 — CONFIGURATION
  ============================================================
*/

const QA_SUBMISSION_URL = "https://www.ommtairlines.site/qa";

/*
  ============================================================
  SECTION 3 — MAIN LIVE Q&A PAGE
  ============================================================
*/

export default function LiveQAPage() {
  const [showLive, setShowLive] = useState(false);
  const [currentTransmission, setCurrentTransmission] = useState(null);

  /*
    ============================================================
    SECTION 4 — SUPABASE REALTIME CONNECTION
    ============================================================
  */

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
  <main className="min-h-screen overflow-x-hidden overflow-y-auto bg-[#02050c] text-white">
    <div className="relative flex min-h-screen items-center justify-center px-10 py-24">
      <AtmosphericBackground />
      <TopSystemBar />

      <AnimatePresence mode="wait">
        {!showLive ? (
          <QRBoardingScreen key="qr-screen" onBegin={() => setShowLive(true)} />
        ) : (
          <LiveDiscussionScreen
            key="live-screen"
            currentTransmission={currentTransmission}
          />
        )}
      </AnimatePresence>
    </div>
  </main>
);

/*
  ============================================================
  SECTION 6 — TOP SYSTEM BAR
  ============================================================
*/

function TopSystemBar() {
  return (
    <div className="absolute left-10 right-10 top-8 z-20 flex items-center justify-between">
      <p className="text-[11px] uppercase tracking-[0.5em] text-[#d7a247]/90">
        OMMT AIRLINES
      </p>

      <p className="text-[10px] uppercase tracking-[0.4em] text-white/36">
        Live Q&amp;A Communication System
      </p>
    </div>
  );
}

/*
  ============================================================
  SECTION 7 — QR BOARDING SCREEN
  Εδώ εμφανίζεται το QR πριν ξεκινήσει το live περιβάλλον.
  ============================================================
*/

function QRBoardingScreen({ onBegin }) {
  return (
    <motion.section
      className="relative z-10 w-full max-w-6xl text-center"
      initial={{ opacity: 0, y: 28, filter: "blur(12px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -24, filter: "blur(10px)" }}
      transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="mb-7 text-[12px] uppercase tracking-[0.55em] text-[#d7a247]/90">
        Audience Communication Channel
      </p>

      <h1 className="mx-auto max-w-5xl text-[5.2rem] font-semibold leading-[0.9] tracking-[-0.065em] text-white">
        Scan to transmit your question.
      </h1>

      <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-white/52">
        Καλωσορίσατε στο αποκλειστικό κανάλι επικοινωνίας της OMMT Airlines.
        <br />
        <br />
        Σαρώστε το QR code για να μεταδώσετε την ερώτηση σας προς το πάνελ των
        προσκεκλημένων ομιλητών.
      </p>

      <motion.div
        className="mx-auto mt-14 max-w-[470px] overflow-hidden rounded-[2.8rem] border border-[#d7a247]/24 bg-white/[0.045] p-7 shadow-[0_34px_100px_rgba(0,0,0,0.58)] backdrop-blur-2xl"
        initial={{ opacity: 0, scale: 0.94, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="rounded-[2rem] border border-[#d7a247]/18 bg-[#02050c]/72 p-5">
          <div className="flex items-center justify-center rounded-[1.5rem] bg-[#f7f1e6] p-7">
            <QRCode
              value={QA_SUBMISSION_URL}
              size={240}
              bgColor="#f7f1e6"
              fgColor="#02050c"
              level="H"
              className="h-[240px] w-[240px]"
            />
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-8">
          <p className="text-[10px] uppercase tracking-[0.36em] text-[#d7a247]/85">

          Ground Crew Review Required

          </p>

          <p className="mt-3 text-[11px] uppercase tracking-[0.32em] text-white/36">
            ommtairlines.site/qa
          </p>
        </div>
      </motion.div>

      <button
        onClick={onBegin}
        className="mt-12 rounded-full border border-[#d7a247]/35 bg-[#02050c]/46 px-9 py-5 text-[11px] uppercase tracking-[0.34em] text-[#f7d27a] shadow-[0_18px_70px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition duration-300 hover:border-[#d7a247]/60 hover:bg-[#d7a247]/10"
      >
        Enter Live Discussion
      </button>

      <BrandSignature />
    </motion.section>
  );
}

/*
  ============================================================
  SECTION 8 — LIVE DISCUSSION SCREEN
  Εδώ εμφανίζεται η live approved ερώτηση.
  ============================================================
*/

function LiveDiscussionScreen({ currentTransmission }) {
  return (
    <motion.section
      className="relative z-10 w-full max-w-6xl"
      initial={{ opacity: 0, y: 28, filter: "blur(12px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -24, filter: "blur(10px)" }}
      transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="text-center">
        <p className="mb-7 text-[12px] uppercase tracking-[0.55em] text-[#d7a247]/90">
          Live Discussion Channel
        </p>

        <h1 className="mx-auto max-w-5xl text-[5.4rem] font-semibold leading-[0.9] tracking-[-0.065em] text-white">
          Now receiving audience transmissions.
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
                  Audience Transmission
                </p>

                <p className="mt-3 text-[10px] uppercase tracking-[0.34em] text-white/38">
                  Live Speaker Channel
                </p>
              </div>

              <div className="rounded-full border border-[#d7a247]/30 bg-[#d7a247]/10 px-5 py-3">
                <p className="text-[10px] uppercase tracking-[0.34em] text-[#f7d27a]">
                  {currentTransmission ? "Live Discussion" : "Awaiting Review"}
                </p>
              </div>
            </div>

            <div className="relative mt-12">
              <p className="text-[4rem] font-light leading-[1.08] tracking-[-0.055em] text-white">
                {currentTransmission?.question || "Awaiting review."}
              </p>
            </div>

            <div className="mt-14 flex items-center justify-between border-t border-white/10 pt-8">
              <p className="text-[10px] uppercase tracking-[0.36em] text-white/32">
                Cleared for Discussion
              </p>

              <BrandSignature small />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <p className="mt-12 text-center text-[11px] uppercase tracking-[0.45em] text-white/30">
        Approved transmissions appear in the live discussion.
      </p>
    </motion.section>
  );
}

/*
  ============================================================
  SECTION 9 — BRAND SIGNATURE
  Κρατάει πάντα το μικρό "o" στο OMMTo.
  ============================================================
*/

function BrandSignature({ small = false }) {
  return (
    <p
      className={`${
        small
          ? "text-[10px] tracking-[0.36em] text-white/32"
          : "mt-10 text-[10px] tracking-[0.45em] text-white/30"
      }`}
    >
      OMMT<span className="lowercase">o</span>...New Horizons
    </p>
  );
}

/*
  ============================================================
  SECTION 10 — ATMOSPHERIC BACKGROUND SYSTEM
  Premium aviation atmosphere για όλη τη live εμπειρία.
  ============================================================
*/

function AtmosphericBackground() {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(215,162,71,0.20),transparent_38%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#071a33]/60 via-[#02050c] to-[#010309]" />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.06)_46%,transparent_58%)] opacity-40" />

      <motion.div
        className="absolute right-[-12%] top-[12%] h-[520px] w-[520px] rounded-full bg-[#d7a247]/10 blur-3xl"
        animate={{ opacity: [0.18, 0.38, 0.18], scale: [1, 1.08, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute left-[-18%] bottom-[-18%] h-[520px] w-[520px] rounded-full bg-[#0b3a63]/24 blur-3xl"
        animate={{ opacity: [0.18, 0.34, 0.18], scale: [1, 1.06, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}
