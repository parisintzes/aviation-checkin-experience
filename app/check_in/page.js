"use client";
import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, ArrowRight, Mail, User, QrCode, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

/*
  ============================================================
  OMMT AIRLINES — MOBILE ONLY APP PROTOTYPE + SUPABASE
  ============================================================

  ΤΙ ΕΙΝΑΙ ΑΥΤΟ ΤΟ ΑΡΧΕΙΟ
  ------------------------------------------------------------
  Αυτό είναι ένα single-file React / Next.js prototype για το
  mobile-only digital aviation check-in app.

  ΤΙ ΠΕΡΙΛΑΜΒΑΝΕΙ
  ------------------------------------------------------------
  1. Premium cinematic splash screen
  2. Onboarding slides
  3. Passenger registration form
  4. Supabase insert
  5. Premium generating/loading experience
  6. Generated boarding pass
  7. Final confirmation screen

  ΣΗΜΑΝΤΙΚΟ
  ------------------------------------------------------------
  Αυτός ο κώδικας θεωρεί ότι έχεις ήδη:
  - Next.js project
  - Tailwind CSS
  - framer-motion
  - lucide-react
  - @supabase/supabase-js

  Χρειάζεσαι επίσης στο .env.local:
  NEXT_PUBLIC_SUPABASE_URL=το_url_σου
  NEXT_PUBLIC_SUPABASE_ANON_KEY=το_anon_key_σου
*/

/*
  ============================================================
  SECTION 1 — SUPABASE CLIENT
  Αυτό συνδέει το app με το Supabase project σου.

  ΤΙ ΕΠΗΡΕΑΖΕΙ
  ------------------------------------------------------------
  - Αν τα στοιχεία του συμμετέχοντα αποθηκεύονται στη βάση.
  - Αν το app μπορεί να κάνει insert στον πίνακα participants.

  ΠΡΟΣΟΧΗ
  ------------------------------------------------------------
  Αν λείπει κάποιο environment variable, το Supabase δεν θα δουλέψει.
*/

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
/*
  ============================================================
  SECTION 2 — BRAND DATA
  Εδώ ελέγχουμε τα βασικά στοιχεία του brand/app.

  ΤΙ ΕΠΗΡΕΑΖΕΙ
  ------------------------------------------------------------
  - Το όνομα του brand.
  - Το slogan.
  - Το event title.
  - Τα κείμενα που εμφανίζονται στο app.
*/

const BRAND = {
  name: "OMMT",
  descriptor: "AIRLINES",
  slogan: "New Horizons",
  eventTitle: "Marketing Made in Greece — On Air",
};

/*
  ============================================================
  SECTION 3 — INSPIRATIONAL ROUTES
  Αυτές οι διαδρομές εμφανίζονται στο premium generating screen.

  ΤΙ ΕΠΗΡΕΑΖΕΙ
  ------------------------------------------------------------
  - Το loading experience.
  - Την αίσθηση international aviation.
  - Δεν είναι οι πραγματικοί προορισμοί του giveaway.
*/

const ROUTES = [
  { from: "SKG", fromCity: "Thessaloniki", to: "AMS", toCity: "Amsterdam" },
  { from: "DXB", fromCity: "Dubai", to: "SIN", toCity: "Singapore" },
  { from: "LHR", fromCity: "London", to: "JFK", toCity: "New York" },
];

/*
  ============================================================
  SECTION 4 — SMALL UTILITY FUNCTIONS
  Αυτές οι συναρτήσεις δημιουργούν τα στοιχεία του boarding pass.

  ΤΙ ΕΠΗΡΕΑΖΟΥΝ
  ------------------------------------------------------------
  - Τον μοναδικό κωδικό συμμετοχής.
  - Τη θέση.
  - Την πύλη.
  - Το terminal.
  - Το barcode/boarding id.
*/

function randomFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateTicketCode() {
  return "AV-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateBoardingData(fullName, email) {
  const seats = ["1A", "2F", "4C", "7A", "9F", "12A", "14C", "18F"];
  const gates = ["A2", "B4", "C1", "D7", "F3"];
  const terminals = ["T1", "T2", "T4"];
  const ticketCode = generateTicketCode();

  return {
    fullName,
    email,
    ticketCode,
    flight: "OM 1025",
    from: "SKG",
    fromCity: "Thessaloniki",
    to: "???",
    toCity: "Secret Destination",
    date: "Event Day",
    boardingTime: "TBA",
    departure: "Mystery Flight",
    seat: randomFromArray(seats),
    gate: randomFromArray(gates),
    terminal: randomFromArray(terminals),
    boardingId: ticketCode,
    barcode: ticketCode.replace("-", ""),
  };
}

/*
  ============================================================
  SECTION 5 — MAIN APP COMPONENT
  Εδώ ελέγχεται όλη η ροή της εφαρμογής.

  ΤΙ ΕΠΗΡΕΑΖΕΙ
  ------------------------------------------------------------
  - Σε ποια οθόνη βρίσκεται ο χρήστης.
  - Πότε εμφανίζεται το splash.
  - Πότε εμφανίζονται τα onboarding slides.
  - Πότε γίνεται submit στο Supabase.
  - Πότε εμφανίζεται το boarding pass.
*/

export default function CheckInPage() {
  const [stage, setStage] = useState("splash");
  const [slide, setSlide] = useState(0);
  const [formData, setFormData] = useState({ fullName: "", email: "" });
  const [boardingPass, setBoardingPass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onboardingSlides = useMemo(
    () => [
      {
        eyebrow: "DIGITAL AVIATION EXPERIENCE",
        title: BRAND.eventTitle,
        body:
          "Welcome to a cinematic mobile check-in experience designed exclusively for the event participants.",
        button: "Begin Boarding",
      },
      {
        eyebrow: "SECRET DESTINATION GIVEAWAY",
        title: "One Boarding Pass. One Mystery Flight.",
        body:
          "Generate your personal boarding pass to enter the giveaway for one flight ticket to a secret destination.",
        button: "Next",
      },
      {
        eyebrow: "EVENT ACCESS",
        title: "Your Boarding Pass Is Your Entry Point.",
        body:
          "Your boarding pass confirms your participation in the talk and will be sent to the email address you provide.",
        button: "Generate Boarding Pass",
      },
    ],
    []
  );

  function handleNextSlide() {
    if (slide < onboardingSlides.length - 1) {
      setSlide(slide + 1);
    } else {
      setStage("form");
    }
  }

  /*
    ============================================================
    SECTION 6 — FORM SUBMIT + SUPABASE INSERT
    Αυτό είναι το πιο κρίσιμο τεχνικό σημείο.

    ΤΙ ΚΑΝΕΙ
    ------------------------------------------------------------
    1. Σταματάει το default form submit.
    2. Δημιουργεί boarding pass data.
    3. Αποθηκεύει τα στοιχεία στο Supabase.
    4. Αν πετύχει, δείχνει premium loading.
    5. Μετά εμφανίζει το boarding pass.

    ΤΙ ΠΡΕΠΕΙ ΝΑ ΠΡΟΣΕΞΕΙΣ
    ------------------------------------------------------------
    Στον παλιό σου κώδικα δημιουργούσες ticketCode αλλά ΔΕΝ το
    αποθήκευες στο Supabase. Αυτό ήταν λάθος, γιατί μετά δεν θα
    μπορούσες να κάνεις αξιόπιστη live draw με βάση τον κωδικό.

    Εδώ αποθηκεύουμε και τον κωδικό και τα generated στοιχεία.
  */

  async function handleSubmit(event) {
  event.preventDefault();
  setErrorMessage("");

  const fullName = formData.fullName.trim();
  const email = formData.email.trim().toLowerCase();

  if (!fullName || !email) {
    setErrorMessage("Please complete both passenger name and email.");
    return;
  }

  if (!supabase) {
    setErrorMessage("Supabase is not configured. Please check your .env.local file.");
    return;
  }

  const generatedPass = generateBoardingData(fullName, email);

  setLoading(true);

  const { error } = await supabase.from("participants").insert([
    {
      full_name: generatedPass.fullName,
      email: generatedPass.email,
      ticket_code: generatedPass.ticketCode,
      flight: generatedPass.flight,
      seat: generatedPass.seat,
      gate: generatedPass.gate,
      terminal: generatedPass.terminal,
      status: "eligible",
    },
  ]);

  setLoading(false);

  if (error) {
    console.log("SUPABASE ERROR:", error);
    setErrorMessage(error?.message || "Check-in failed. Please try again.");
    return;
  }

  setBoardingPass(generatedPass);
  setStage("generating");

  setTimeout(() => {
    setStage("boarding-pass");
  }, 2400);
}

  return (
    <main className="min-h-screen w-full bg-[#020b18] text-white flex items-center justify-center overflow-hidden">
      <MobileShell>
        <AnimatePresence mode="wait">
          {stage === "splash" && <SplashScreen key="splash" onComplete={() => setStage("onboarding")} />}

          {stage === "onboarding" && (
            <OnboardingScreen
              key="onboarding"
              slide={onboardingSlides[slide]}
              slideNumber={slide}
              totalSlides={onboardingSlides.length}
              onNext={handleNextSlide}
            />
          )}

          {stage === "form" && (
            <PassengerForm
              key="form"
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              loading={loading}
              errorMessage={errorMessage}
            />
          )}

          {stage === "generating" && <GeneratingScreen key="generating" />}

          {stage === "boarding-pass" && boardingPass && (
            <BoardingPassScreen key="boarding-pass" pass={boardingPass} onFinish={() => setStage("confirmation")} />
          )}

          {stage === "confirmation" && boardingPass && (
            <ConfirmationScreen key="confirmation" email={boardingPass.email} />
          )}
        </AnimatePresence>
      </MobileShell>
    </main>
  );
}

/*
  ============================================================
  SECTION 7 — MOBILE SHELL
  Αυτό κρατάει το app σε mobile αναλογία.

  ΤΙ ΕΠΗΡΕΑΖΕΙ
  ------------------------------------------------------------
  - Το πλάτος του app.
  - Την αίσθηση ότι είναι mobile-first εμπειρία.
  - Το visual frame μέσα στο οποίο εμφανίζονται όλα.

  ΣΗΜΕΙΩΣΗ
  ------------------------------------------------------------
  Δεν κάνουμε desktop/tablet design. Απλώς το κλειδώνουμε σε
  mobile width, γιατί το project είναι αποκλειστικά mobile.
*/

function MobileShell({ children }) {
  return (
    <section className="relative h-screen w-full max-w-[430px] mx-auto bg-[#06152a] overflow-hidden shadow-2xl">
      {children}
    </section>
  );
}

/*
  ============================================================
  SECTION 8 — SHARED BACKGROUND
  Αυτό δίνει το cinematic aviation background σε όλες τις οθόνες.

  ΤΙ ΕΠΗΡΕΑΖΕΙ
  ------------------------------------------------------------
  - Το premium dark navy περιβάλλον.
  - Τη χρυσή λάμψη.
  - Την αίσθηση βάθους.
  - Τη λεπτή aircraft trajectory γραμμή.
*/

function AviationBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
       
        className="absolute inset-0 scale-[1.08] bg-[url('/textures/cloud-flight-bg.webp')] bg-cover bg-center"
        animate={{ scale: [1.08, 1.14, 1.08], x: [0, -10, 0], y: [0, 12, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-[#020713]/35 via-[#071a33]/25 to-[#02050c]/95" />



      <motion.div
        className="absolute right-[-25%] top-[18%] h-[460px] w-[460px] rounded-full bg-[#d7a247]/25 blur-3xl"
        animate={{ opacity: [0.35, 0.75, 0.35], scale: [1, 1.08, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.08)_46%,transparent_58%)]" />
      {/* Floating cinematic haze */}
<motion.div
  className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(255,255,255,0.10)_0%,transparent_34%)] opacity-45"
  animate={{
    opacity: [0.25, 0.45, 0.25],
    scale: [1, 1.06, 1],
  }}
  transition={{
    duration: 12,
    repeat: Infinity,
    ease: "easeInOut",
  }}
/>

{/* Subtle golden atmospheric particles */}
<motion.div
  className="absolute inset-0 opacity-25 mix-blend-screen"
  style={{
    backgroundImage:
      "radial-gradient(circle, rgba(247,210,122,0.55) 1px, transparent 1px)",
    backgroundSize: "46px 46px",
  }}
  animate={{
    x: [0, -18, 0],
    y: [0, 22, 0],
    opacity: [0.12, 0.25, 0.12],
  }}
  transition={{
    duration: 24,
    repeat: Infinity,
    ease: "easeInOut",
  }}
/>

{/* Soft aircraft-window reflection */}
<motion.div
  className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.08)_48%,transparent_58%)]"
  animate={{
    x: ["-18%", "18%", "-18%"],
    opacity: [0.18, 0.32, 0.18],
  }}
  transition={{
    duration: 16,
    repeat: Infinity,
    ease: "easeInOut",
  }}
/>

      <div className="absolute bottom-0 left-0 right-0 h-[52%] bg-gradient-to-t from-[#02050c] via-[#02050c]/88 to-transparent" />

      <motion.div
        className="absolute bottom-[14%] left-[-25%] h-28 w-[150%] rounded-[50%] border-t border-[#d7a247]/20"
        animate={{ x: [0, 14, 0], opacity: [0.16, 0.34, 0.16] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/*
  ============================================================
  SECTION 9 — LOGO COMPONENT
  Εδώ δημιουργείται προσωρινό OMMT logo με text.

  ΤΙ ΕΠΗΡΕΑΖΕΙ
  ------------------------------------------------------------
  - Το logo που εμφανίζεται σε splash, onboarding, form και pass.

  ΕΠΟΜΕΝΟ ΒΗΜΑ
  ------------------------------------------------------------
  Όταν έχεις το τελικό καθαρό PNG/SVG logo, θα το βάλουμε εδώ
  αντί για text logo για πιο professional αποτέλεσμα.
*/

function Logo({ compact = false }) {
  return (
    <motion.div
      className="relative flex justify-center"
      animate={{ scale: [1, 1.015, 1], y: [0, -2, 0] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="absolute inset-0 scale-125 rounded-full bg-[#d7a247]/10 blur-3xl" />

      <img
        src="/logos/ommt-logo-transparent.webp"
        alt="OMMT Airlines"
        className={`relative object-contain drop-shadow-[0_0_35px_rgba(215,162,71,0.22)] ${
          compact ? "w-[170px]" : "w-[285px]"
        }`}
      />
    </motion.div>
  );
}

/*
  ============================================================
  SECTION 10 — SPLASH SCREEN
  Η premium είσοδος του app.
  ============================================================
*/

function SplashScreen({ onComplete }) {
  React.useEffect(() => {
    const timer = setTimeout(onComplete, 6800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.section
      className="absolute inset-0 flex flex-col items-center justify-center px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
    >
      <AviationBackground />

      {/* Top institutional label */}
      <motion.div
        className="absolute top-12 z-10 text-center"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.9 }}
      >
        <p className="text-[9px] tracking-[0.42em] text-white/35">
          INTERNATIONAL HELLENIC UNIVERSITY
        </p>
      </motion.div>

      {/* Soft gold halo behind logo */}
      <motion.div
        className="absolute z-0 h-[260px] w-[260px] rounded-full bg-[#d7a247]/10 blur-3xl"
        initial={{ opacity: 0, scale: 0.75 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, duration: 1.4, ease: "easeOut" }}
      />

      {/* Logo reveal */}
      <motion.div
        className="relative z-10 -mt-12"
        initial={{ opacity: 0, scale: 0.9, filter: "blur(12px)" }}
        animate={{
          opacity: 1,
          scale: [1, 1.012, 1],
          filter: "blur(0px)",
        }}
        transition={{
          opacity: { delay: 0.85, duration: 1.2, ease: "easeOut" },
          filter: { delay: 0.85, duration: 1.2, ease: "easeOut" },
          scale: {
            delay: 1.3,
            duration: 4.2,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      >
        <Logo />
      </motion.div>

      {/* Cinematic golden trajectory */}
      <div className="absolute left-[12%] right-[12%] top-[58%] z-10 h-10 overflow-visible">
        {/* Soft atmospheric glow */}
        <motion.div
          className="absolute left-0 top-1/2 h-[6px] w-full -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-[#d7a247]/30 to-transparent blur-md"
          animate={{
            opacity: [0.25, 0.55, 0.25],
            scaleX: [0.96, 1, 0.96],
          }}
          transition={{
            delay: 2.1,
            duration: 4.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Main golden line reveal */}
        <motion.div
          className="absolute left-0 top-1/2 h-[1px] origin-left -translate-y-1/2 bg-gradient-to-r from-transparent via-[#f7d27a] to-transparent"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ delay: 2.1, duration: 2.8, ease: "easeInOut" }}
        />

        {/* Elegant shimmer passing through the line */}
        <motion.div
          className="absolute left-0 top-1/2 h-[1px] w-24 -translate-y-1/2 bg-gradient-to-r from-transparent via-white/80 to-transparent"
          initial={{ x: "-35%", opacity: 0 }}
          animate={{ x: "135%", opacity: [0, 0.8, 0] }}
          transition={{
            delay: 4.2,
            duration: 3.2,
            repeat: Infinity,
            repeatDelay: 1.4,
            ease: "easeInOut",
          }}
        />

        {/* Subtle golden particles */}
        <motion.div
          className="absolute left-0 top-1/2 h-[12px] w-full -translate-y-1/2 bg-[radial-gradient(circle,rgba(247,210,122,0.55)_1px,transparent_1px)] bg-[length:22px_12px] opacity-25"
          animate={{
            x: [0, 10, 0],
            opacity: [0.15, 0.28, 0.15],
          }}
          transition={{
            delay: 2.6,
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Bottom cinematic status system */}
      <motion.div
        className="absolute bottom-20 z-10 w-full px-10 text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.2, duration: 0.9 }}
      >
        <p className="text-[10px] tracking-[0.38em] text-[#d7a247]">
          AVIATION. TOURISM. INNOVATION.
        </p>

        <p className="mt-4 text-[8px] tracking-[0.34em] text-white/35">
          BOARDING NEW HORIZONS
        </p>

        <motion.div
          className="mx-auto mt-8 h-[1px] w-40 overflow-hidden rounded-full bg-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.6, duration: 0.6 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-transparent via-[#f7d27a] to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              delay: 3.8,
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        <motion.p
          className="mt-5 text-[8px] tracking-[0.28em] text-[#d7a247]/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.35, 1, 0.35] }}
          transition={{
            delay: 4.2,
            duration: 2.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          WHERE IDEAS TAKE FLIGHT
        </motion.p>
      </motion.div>
    </motion.section>
  );
}
/*
  ============================================================
  SECTION 11 — ONBOARDING SCREEN
  Premium aviation onboarding experience.
  Inspired by luxury airline calmness + Apple-style product clarity.
*/

function OnboardingScreen({ slide, slideNumber, totalSlides, onNext }) {
  return (
    <motion.section
  className="absolute inset-0 overflow-hidden"
  initial={{
    opacity: 0,
    scale: 1.035,
    filter: "blur(10px)",
  }}
  animate={{
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
  }}
  exit={{
    opacity: 0,
    scale: 0.985,
    filter: "blur(8px)",
  }}
  transition={{
    duration: 1.8,
    ease: [0.22, 1, 0.36, 1],
  }}
>
      <motion.img
        src={
          slideNumber === 0
            ? "/onboarding/onboarding-01.webp"
            : slideNumber === 1
            ? "/onboarding/onboarding-02.webp"
            : "/onboarding/onboarding-03.webp"
        }
        alt="Onboarding Background"
        className="absolute inset-0 h-full w-full object-cover"
        animate={{
  scale: [1.02, 1.055, 1.02],
  y: [0, -12, 0],
  x: [0, -4, 0],
}}
transition={{
  duration: 32,
  repeat: Infinity,
  ease: "easeInOut",
}}
      />

      {/* Premium cinematic overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#02050c]/98 via-[#02050c]/48 to-[#02050c]/16" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#02050c]/78 via-[#02050c]/18 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(215,162,71,0.20)_0%,transparent_34%)]" />

      {/* Top navigation system */}
      <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-7 pt-8">
        <motion.img
          src="/logos/ommt-orbit-mark.webp"
          alt="OMMTo Orbit Mark"
          className="h-16 w-auto object-contain opacity-95 drop-shadow-[0_0_18px_rgba(215,162,71,0.26)]"
          animate={{ y: [0, -2, 0], opacity: [0.88, 1, 0.88] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="flex items-center gap-3">
          <div className="h-[1px] w-10 bg-gradient-to-r from-transparent to-white/35" />
          <span className="text-[10px] tracking-[0.32em] text-white/48">
            0{slideNumber + 1}/0{totalSlides}
          </span>
        </div>
      </div>

      {/* Editorial content block */}
      <div className="absolute bottom-36 left-7 right-7 z-20">
       <motion.div
  initial={{
    opacity: 0,
    y: 26,
    filter: "blur(12px)",
  }}
  animate={{
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
  }}
          transition={{
  delay: 0.35,
  duration: 1.45,
  ease: [0.22, 1, 0.36, 1],
}}
        >
          <p className="mb-5 text-[9px] uppercase tracking-[0.42em] text-[#d7a247]/90">
            {slide.eyebrow}
          </p>

          <h1 className="max-w-[95%] text-[2.35rem] font-semibold leading-[0.95] tracking-[-0.055em] text-white drop-shadow-[0_10px_34px_rgba(0,0,0,0.55)]">
            {slide.title}
          </h1>

          <div className="mt-7 h-[1px] w-20 bg-gradient-to-r from-[#d7a247] via-[#d7a247]/60 to-transparent" />

          <p className="mt-6 max-w-[86%] text-[13.5px] leading-7 text-white/68">
            {slide.body}
          </p>
        </motion.div>
      </div>

     {/* Premium aviation control */}
<div className="absolute bottom-10 left-7 right-7 z-20">
  <button
    onClick={onNext}
    className="group relative flex w-full items-center justify-between overflow-hidden rounded-full border border-[#d7a247]/35 bg-[#02050c]/42 px-5 py-[15px] text-[#f7f1e6] shadow-[0_18px_70px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-[#d7a247]/12 via-white/7 to-transparent opacity-80" />

    <motion.div
      className="absolute inset-y-0 left-[-40%] w-32 rotate-12 bg-gradient-to-r from-transparent via-[#f7d27a]/28 to-transparent blur-xl"
      animate={{ left: ["-40%", "135%"] }}
      transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
    />

    <span className="relative z-10 text-[10px] font-medium uppercase tracking-[0.32em] text-[#f7f1e6]/88">
      {slide.button.toUpperCase()}
    </span>

    <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[#d7a247]/35 bg-[#d7a247]/10 text-[#f7d27a] transition-transform duration-300 group-hover:translate-x-1">
      <ArrowRight className="h-4 w-4" />
    </span>
  </button>
</div>
    </motion.section>
  );
}
/*
  ============================================================
  SECTION 12 — PASSENGER FORM
  Εδώ ο χρήστης δίνει όνομα και email.

  ΤΙ ΕΠΗΡΕΑΖΕΙ
  ------------------------------------------------------------
  - Το check-in interface.
  - Τα στοιχεία που στέλνονται στο Supabase.
  - Το πρώτο πραγματικό interaction του χρήστη.
*/

function PassengerForm({ formData, setFormData, onSubmit, loading, errorMessage }) {
  return (
    <motion.section
      className="absolute inset-0 px-7 py-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.55 }}
    >
      <AviationBackground />
      <div className="relative z-10 flex justify-center pt-4">
        <Logo compact />
      </div>

      <div className="relative z-10 mt-14">
        <p className="mb-3 text-[11px] tracking-[0.28em] text-[#d7a247]">PASSENGER CHECK-IN</p>
        <h1 className="text-4xl font-semibold leading-none tracking-[-0.04em]">Generate Your Boarding Pass</h1>
        <p className="mt-4 text-sm leading-6 text-white/65">
          Enter your details to create your personal boarding pass for the event and the secret destination giveaway.
        </p>
      </div>

      {errorMessage && (
        <div className="relative z-10 mt-5 flex items-start gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="relative z-10 mt-8 space-y-4">
        <label className="block rounded-3xl border border-white/10 bg-white/7 p-4 backdrop-blur-xl">
          <span className="mb-3 flex items-center gap-2 text-[10px] tracking-[0.25em] text-[#d7a247]">
            <User className="h-4 w-4" /> PASSENGER NAME
          </span>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full bg-transparent text-lg outline-none placeholder:text-white/30"
            placeholder="Your full name"
          />
        </label>

        <label className="block rounded-3xl border border-white/10 bg-white/7 p-4 backdrop-blur-xl">
          <span className="mb-3 flex items-center gap-2 text-[10px] tracking-[0.25em] text-[#d7a247]">
            <Mail className="h-4 w-4" /> EMAIL ADDRESS
          </span>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-transparent text-lg outline-none placeholder:text-white/30"
            placeholder="your@email.com"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-[#d7a247] px-6 py-4 text-sm font-bold tracking-[0.18em] text-[#061225] disabled:opacity-50"
        >
          {loading ? "PROCESSING CHECK-IN" : "GENERATE BOARDING PASS"}
        </button>
      </form>
    </motion.section>
  );
}

/*
  ============================================================
  SECTION 13 — GENERATING SCREEN
  Αυτό είναι το premium loading πριν εμφανιστεί το boarding pass.

  ΤΙ ΕΠΗΡΕΑΖΕΙ
  ------------------------------------------------------------
  - Τη στιγμή αναμονής.
  - Την αίσθηση ότι το app δημιουργεί κάτι προσωπικό.
  - Τη σύνδεση με το aviation visual system.
*/

function GeneratingScreen() {
  return (
    <motion.section
      className="absolute inset-0 px-7 py-8 flex flex-col justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AviationBackground />
      <div className="relative z-10 text-center">
        <Logo compact />
        <p className="mt-10 text-[11px] tracking-[0.3em] text-[#d7a247]">INITIALIZING FLIGHT SYSTEMS</p>

        <div className="mt-10 space-y-6">
          {ROUTES.map((route, index) => (
            <motion.div
              key={route.from}
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-white/10 pb-5"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.25 }}
            >
              <div className="text-left">
                <p className="text-3xl tracking-[0.12em]">{route.from}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#d7a247]">{route.fromCity}</p>
              </div>
              <ArrowRight className="h-6 w-6 text-[#d7a247]" />
              <div className="text-right">
                <p className="text-3xl tracking-[0.12em]">{route.to}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#d7a247]">{route.toCity}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div className="mx-auto mt-12 h-[2px] w-64 bg-white/10 overflow-hidden rounded-full">
          <motion.div
            className="h-full bg-[#d7a247]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.2, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </motion.section>
  );
}

/*
  ============================================================
  SECTION 14 — BOARDING PASS SCREEN
  Εδώ εμφανίζεται το τελικό boarding pass.

  ΤΙ ΕΠΗΡΕΑΖΕΙ
  ------------------------------------------------------------
  - Το τελικό digital ticket.
  - Τα στοιχεία που βλέπει ο συμμετέχων.
  - Το visual reward moment μετά το check-in.
*/

function BoardingPassScreen({ pass, onFinish }) {
  return (
    <motion.section
      className="absolute inset-0 px-5 py-6 overflow-y-auto"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
    >
      <AviationBackground />

      <div className="relative z-10 mb-5 flex justify-center">
        <Logo compact />
      </div>

      <motion.div
        className="relative z-10 rounded-[2.2rem] border border-white/15 bg-white/10 backdrop-blur-2xl overflow-hidden shadow-2xl"
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.7 }}
      >
        <div className="p-6 bg-gradient-to-br from-[#102b4d]/95 to-[#050b16]/95">
          <p className="text-[11px] tracking-[0.3em] text-[#d7a247]">BOARDING PASS</p>

          <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div>
              <p className="text-5xl font-semibold tracking-[0.08em]">{pass.from}</p>
              <p className="mt-2 text-[10px] tracking-[0.2em] text-white/55 uppercase">{pass.fromCity}</p>
            </div>
            <Plane className="h-7 w-7 text-[#d7a247] rotate-90" />
            <div className="text-right">
              <p className="text-5xl font-semibold tracking-[0.08em]">{pass.to}</p>
              <p className="mt-2 text-[10px] tracking-[0.2em] text-white/55 uppercase">{pass.toCity}</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 border-y border-white/10 py-5">
            <InfoBlock label="Passenger" value={pass.fullName} />
            <InfoBlock label="Flight" value={pass.flight} />
            <InfoBlock label="Terminal" value={pass.terminal} />
            <InfoBlock label="Gate" value={pass.gate} />
            <InfoBlock label="Seat" value={pass.seat} />
            <InfoBlock label="Boarding" value={pass.boardingTime} />
          </div>

          <p className="mt-8 text-2xl leading-snug tracking-[0.12em]">
            YOUR JOURNEY <br /> STARTS <span className="text-[#d7a247]">HERE.</span>
          </p>
        </div>

        <div className="p-6 bg-[#030914]">
          <div className="flex items-center justify-center gap-4">
            <FakeBarcode />
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-white/25 bg-white text-[#061225]">
              <QrCode className="h-16 w-16" />
            </div>
            <FakeBarcode />
          </div>

          <div className="mt-6 flex justify-between text-[10px] tracking-[0.2em] text-white/55">
            <span>SEQ 00025</span>
            <span>{pass.boardingId}</span>
          </div>
        </div>
      </motion.div>

      <button
        onClick={onFinish}
        className="relative z-10 mt-5 w-full rounded-full bg-white px-6 py-4 text-sm font-bold tracking-[0.16em] text-[#061225]"
      >
        COMPLETE CHECK-IN
      </button>
    </motion.section>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div>
      <p className="mb-1 text-[10px] uppercase tracking-[0.24em] text-[#d7a247]">{label}</p>
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-white">{value}</p>
    </div>
  );
}

function FakeBarcode() {
  return (
    <div className="flex h-20 w-20 items-end justify-center gap-[2px] opacity-80">
      {Array.from({ length: 18 }).map((_, index) => (
        <span
          key={index}
          className="bg-[#d7a247]"
          style={{ width: index % 3 === 0 ? 3 : 1, height: `${40 + ((index * 13) % 35)}px` }}
        />
      ))}
    </div>
  );
}

/*
  ============================================================
  SECTION 15 — CONFIRMATION SCREEN
  Τελική οθόνη επιβεβαίωσης.

  ΤΙ ΕΠΗΡΕΑΖΕΙ
  ------------------------------------------------------------
  - Το τελευταίο μήνυμα που βλέπει ο χρήστης.
  - Την αίσθηση ολοκλήρωσης.
  - Το expectation ότι θα λάβει boarding pass στο email.
*/

function ConfirmationScreen({ email }) {
  return (
    <motion.section
      className="absolute inset-0 px-7 py-8 flex flex-col justify-center text-center"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
    >
      <AviationBackground />
      <div className="relative z-10">
        <CheckCircle2 className="mx-auto h-16 w-16 text-[#d7a247]" />
        <h1 className="mt-8 text-4xl font-semibold leading-none tracking-[-0.04em]">Your Boarding Pass Is Ready</h1>
        <p className="mt-5 text-sm leading-6 text-white/65">
          Your digital boarding pass will be sent to:
        </p>
        <p className="mt-3 text-[#d7a247] tracking-[0.08em]">{email}</p>
        <p className="mt-10 text-[11px] tracking-[0.3em] text-white/50">BOARD. EXPLORE. BEYOND.</p>
      </div>
    </motion.section>
  );
}
