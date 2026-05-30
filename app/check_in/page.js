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
*/

export default function CheckInPage() {
  const [stage, setStage] = useState("splash");
  const [slide, setSlide] = useState(0);
  const [formData, setFormData] = useState({ fullName: "", email: "" });
  const [boardingPass, setBoardingPass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const onboardingSlides = useMemo(
  () => [
    {
      eyebrow: "WELCOME ABOARD",
      title: "Marketing Made in Greece - On Air",
      body:
        "Καλωσορίσατε σε μία experiential προσέγγιση του αεροπορικού και τουριστικού marketing, όπου η τεχνολογία, η εμπειρία και η αλληλεπίδραση συνδέονται σε ένα ενιαίο digital ταξίδι.\n\nΗ Philoxenia 2026 — Marketing Made in Greece | On Air μετατρέπει την άφιξη σας σε μέρος της εμπειρίας.",
      button: "Begin Boarding",
    },
      {
        eyebrow: "SECRET DESTINATION GIVEAWAY",
        title: "One Boarding Pass. One Mystery Flight.",
        body:
          "Η προσωπική σας κάρτα επιβίβασης ενεργοποιεί τη συμμετοχή σας στο Secret Destination Giveaway Experience.\n\nΈνας προορισμός. Μία πτήση. Μία εμπειρία που θα αποκαλυφθεί μετά την απογείωση.",
        button: "Next",
      },
      {
        eyebrow: "EVENT ACCESS",
        title: "Your Boarding Pass Is Your Entry Point.",
        body:
          "Η προσωπική σας κάρτα επιβίβασης επιβεβαιώνει τη συμμετοχή σας στην εμπειρία της Philoxenia 2026 — Marketing Made in Greece | On Air.\n\nΤο boarding pass θα αποσταλεί αυτόματα στη διεύθυνση email που θα δηλώσετε κατά τη διαδικασία check-in.",
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
  ============================================================
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
        email_sent: false,
        email_error: null,
      },
    ]);

    if (error) {
  console.log("SUPABASE ERROR:", error);
  setLoading(false);
  setErrorMessage(error?.message || "Check-in failed. Please try again.");
  return;
}

/*
============================================================
SEND BOARDING PASS EMAIL
============================================================
*/

const emailResponse = await fetch("/api/send-boarding-pass", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    fullName: generatedPass.fullName,
    email: generatedPass.email,
    flight: generatedPass.flight,
    from: generatedPass.from,
    to: generatedPass.to,
    seat: generatedPass.seat,
    gate: generatedPass.gate,
    terminal: generatedPass.terminal,
    boardingId: generatedPass.boardingId,
  }),
});

const emailResult = await emailResponse.json();

if (!emailResult.success) {
  console.log("EMAIL ERROR:", emailResult.error);
}

/*
============================================================
CONTINUE EXPERIENCE
============================================================
*/

setLoading(false);
setBoardingPass(generatedPass);
setStage("generating");

    setTimeout(() => {
      setStage("boarding-pass");
    }, 2400);
  }

  return (
  <main className="fixed inset-0 h-[100dvh] w-screen bg-[#02050c] text-white overflow-hidden">
    <MobileShell>

      {showPrivacyModal && (
        <PrivacyModal onClose={() => setShowPrivacyModal(false)} />
      )}

      <AnimatePresence mode="wait">
        {stage === "splash" && (
          <SplashScreen key="splash" onComplete={() => setStage("onboarding")} />
        )}

        {stage === "onboarding" && (
          <OnboardingScreen
            key={`onboarding-${slide}`}
            slide={onboardingSlides[slide]}
            slideNumber={slide}
            totalSlides={onboardingSlides.length}
            onNext={handleNextSlide}
          />
        )}

        {stage === "form" && (
          <PassengerForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            loading={loading}
            errorMessage={errorMessage}
            setShowPrivacyModal={setShowPrivacyModal}
          />
        )}

        {stage === "generating" && <GeneratingScreen key="generating" />}

        {stage === "boarding-pass" && boardingPass && (
          <BoardingPassScreen
            key="boarding-pass"
            pass={boardingPass}
            onFinish={() => setStage("confirmation")}
          />
        )}

        {stage === "confirmation" && boardingPass && (
          <ConfirmationScreen
            key="confirmation"
            email={boardingPass.email}
          />
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
    <section className="relative h-[100dvh] w-screen max-w-none bg-[#02050c] overflow-hidden">
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
    <div className="relative flex justify-center">
      <div className="absolute inset-0 scale-125 rounded-full bg-[#d7a247]/10 blur-3xl" />

      <img
        src="/logos/ommt-logo-transparent.webp"
        alt="OMMT Airlines"
        className={`relative object-contain drop-shadow-[0_0_35px_rgba(215,162,71,0.22)] ${
          compact ? "w-[170px]" : "w-[285px]"
        }`}
      />
    </div>
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
  Smooth cinematic choreography for the three slides.
*/

function OnboardingScreen({ slide, slideNumber, totalSlides, onNext }) {
  return (
    <motion.section
      className="absolute inset-0 overflow-hidden"
      initial={{
        opacity: 0,
        scale: 1.015,
        y: 18,
        filter: "blur(10px)",
      }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        filter: "blur(0px)",
      }}
      exit={{
        opacity: 0,
        scale: 1.01,
        y: -12,
        filter: "blur(6px)",
      }}
      transition={{
  duration: slideNumber === 0 ? 2.2 : 1.35,
  ease: [0.16, 1, 0.3, 1],
}}
    >
      {/* Cinematic background image */}
      <motion.img
        src={
          slideNumber === 0
            ? "/onboarding/onboarding-01.webp"
            : slideNumber === 1
            ? "/onboarding/onboarding-02.webp"
            : "/onboarding/onboarding-03.webp"
        }
        alt="Onboarding Background"
       className="absolute inset-0 h-[100dvh] w-screen scale-[1.3] object-cover object-center"
        initial={{ scale: 1.04, opacity: 0.92 }}
       animate={{
  scale: [1.3, 1.36],
  y: [0, -18],
  opacity: 1,
}}
        transition={{
  duration: 24,
  ease: "easeOut",
}}
      />

      {/* Premium cinematic overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#02050c]/98 via-[#02050c]/50 to-[#02050c]/16" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#02050c]/82 via-[#02050c]/24 to-transparent" />

      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(215,162,71,0.22)_0%,transparent_35%)]"
        animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.04, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Top navigation system */}
      <motion.div
        className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-7 pt-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      >
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
      </motion.div>

      {/* Editorial content block */}
      <div className="absolute bottom-32 left-6 right-6 z-20 max-h-[58vh] overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            delay: 0.45,
            duration: 1.55,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <p className="mb-5 text-[9px] uppercase tracking-[0.42em] text-[#d7a247]/90">
            {slide.eyebrow}
          </p>

          <h1 className="max-w-[96%] text-[clamp(2rem,8vw,2.35rem)] font-semibold leading-[0.95] tracking-[-0.055em] text-white drop-shadow-[0_10px_34px_rgba(0,0,0,0.55)]">
            {slide.title}
          </h1>

          <motion.div
            className="mt-7 h-[1px] w-20 origin-left bg-gradient-to-r from-[#d7a247] via-[#d7a247]/60 to-transparent"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.9, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          />

         <div className="mt-5 max-w-[92%] space-y-4">
  {slide.body.split("\n\n").map((paragraph, index) => (
    <p
      key={index}
      className={`text-[13px] leading-[1.95] tracking-[0.01em] ${
        index === 0
          ? "text-white/78"
          : "text-white/56"
      }`}
    >
      {paragraph}
    </p>
  ))}
</div>
        </motion.div>
      </div>

      {/* Premium aviation control */}
      <motion.div
        className="absolute bottom-10 left-7 right-7 z-20"
        initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.75, duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <button
          onClick={onNext}
          className="group relative flex w-full items-center justify-between overflow-hidden rounded-full border border-[#d7a247]/35 bg-[#02050c]/42 px-5 py-[15px] text-[#f7f1e6] shadow-[0_18px_70px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#d7a247]/12 via-white/7 to-transparent opacity-80" />

          <motion.div
            className="absolute inset-y-0 left-[-40%] w-32 rotate-12 bg-gradient-to-r from-transparent via-[#f7d27a]/28 to-transparent blur-xl"
            animate={{ left: ["-40%", "135%"] }}
            transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }}
          />

          <span className="relative z-10 text-[10px] font-medium uppercase tracking-[0.32em] text-[#f7f1e6]/88">
            {slide.button.toUpperCase()}
          </span>

          <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[#d7a247]/35 bg-[#d7a247]/10 text-[#f7d27a] transition-transform duration-300 group-hover:translate-x-1">
            <ArrowRight className="h-4 w-4" />
          </span>
        </button>
      </motion.div>
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

function PassengerForm({
  formData,
  setFormData,
  onSubmit,
  loading,
  errorMessage,
  setShowPrivacyModal,
}) {
  return (
    <motion.section
      className="absolute inset-0 overflow-y-auto px-6 py-7"
      initial={{ opacity: 0, scale: 1.015, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.99, filter: "blur(6px)" }}
      transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <AviationBackground />

      <div className="relative z-10 flex justify-center pt-5">
        <Logo compact />
      </div>

      <div className="relative z-10 mt-16">
        <p className="mb-4 text-[9px] uppercase tracking-[0.42em] text-[#d7a247]/90">
          PRIVATE PASSENGER CHECK-IN
        </p>

        <h1 className="max-w-[92%] text-[2.55rem] font-semibold leading-[0.95] tracking-[-0.055em] text-white">
          Generate Your Boarding Pass
        </h1>

        <div className="mt-7 h-[1px] w-20 bg-gradient-to-r from-[#d7a247] to-transparent" />

        <p className="mt-6 max-w-[90%] text-[14px] leading-7 text-white/68">
          Συμπληρώστε τα στοιχεία σας για να ενεργοποιήσετε την προσωπική σας κάρτα επιβίβασης.
        </p>
      </div>

      {errorMessage && (
        <div className="relative z-10 mt-6 rounded-3xl border border-red-400/25 bg-red-500/10 p-4 text-sm text-red-100 backdrop-blur-xl">
          {errorMessage}
        </div>
      )}

      <form onSubmit={onSubmit} className="relative z-10 mt-7 space-y-4 pb-8">
        <label className="block rounded-[2rem] border border-white/12 bg-[#02050c]/38 p-5 backdrop-blur-2xl">
          <span className="mb-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-[#d7a247]/90">
            <User className="h-4 w-4" /> Passenger Name
          </span>

          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full bg-transparent text-[18px] text-white outline-none placeholder:text-white/28"
            placeholder="Full name"
          />
        </label>

        <label className="block rounded-[2rem] border border-white/12 bg-[#02050c]/38 p-5 backdrop-blur-2xl">
          <span className="mb-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-[#d7a247]/90">
            <Mail className="h-4 w-4" /> Contact Email
          </span>

          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-transparent text-[18px] text-white outline-none placeholder:text-white/28"
            placeholder="your@email.com"
          />
        </label>

<div className="px-2 -mt-1">
  <button
    type="button"
    onClick={() => setShowPrivacyModal(true)}
    className="relative z-10 w-full text-center text-[9px] uppercase tracking-[0.24em] text-white/32 transition-all duration-300 hover:text-[#d7a247]"
  >
    Passenger Information & Privacy Protocol
  </button>
</div>

<button
          type="submit"
          disabled={loading}
          className="group relative mt-7 flex w-full items-center justify-between overflow-hidden rounded-full border border-[#d7a247]/35 bg-[#02050c]/46 px-5 py-[16px] text-[#f7f1e6] shadow-[0_18px_70px_rgba(0,0,0,0.45)] backdrop-blur-2xl disabled:opacity-50"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#d7a247]/14 via-white/7 to-transparent" />

          <span className="relative z-10 text-[10px] font-medium uppercase tracking-[0.32em]">
            {loading ? "Processing Check-In" : "Generate Boarding Pass"}
          </span>

          <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[#d7a247]/35 bg-[#d7a247]/10 text-[#f7d27a]">
            <ArrowRight className="h-4 w-4" />
          </span>
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
  Premium boarding pass reveal.
*/

function BoardingPassScreen({ pass, onFinish }) {
  return (
    <motion.section
      className="absolute inset-0 overflow-y-auto px-5 py-6"
      initial={{ opacity: 0, scale: 1.015, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.99, filter: "blur(6px)" }}
      transition={{ duration: 1.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <AviationBackground />

      <div className="relative z-10 mb-6 flex justify-center pt-2">
        <Logo compact />
      </div>

      <motion.div
        className="relative z-10 overflow-hidden rounded-[2.35rem] border border-[#d7a247]/22 bg-[#02050c]/48 shadow-[0_28px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.25, duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#d7a247]/10 via-white/5 to-transparent" />
        <div className="absolute right-[-25%] top-[-18%] h-56 w-56 rounded-full bg-[#d7a247]/14 blur-3xl" />

        <div className="relative p-7">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.42em] text-[#d7a247]/90">
              Boarding Pass
            </p>

            <p className="text-[9px] uppercase tracking-[0.28em] text-white/38">
              OMMT / 1025
            </p>
          </div>

          <div className="mt-10 grid grid-cols-[0.9fr_72px_0.9fr] items-center gap-3">
            <div>
              <p className="text-[3.15rem] font-semibold leading-none tracking-[0.08em] text-white">
                {pass.from}
              </p>
              <p className="mt-3 text-[10px] uppercase tracking-[0.24em] text-white/48">
                {pass.fromCity}
              </p>
            </div>

           <div className="flex items-center justify-center">
  <div className="h-[1px] w-12 bg-[#d7a247]/80" />
  <ArrowRight className="-ml-2 h-4 w-4 text-[#d7a247]" />
</div>

            <div className="min-w-0 text-right">
              <p className="text-[2.75rem] font-semibold leading-none tracking-[0.04em] text-white">
                {pass.to}
              </p>
              <p className="mt-3 text-[10px] uppercase tracking-[0.24em] text-white/48">
                {pass.toCity}
              </p>
            </div>
          </div>

          <div className="mt-9 h-[1px] w-full bg-gradient-to-r from-transparent via-white/16 to-transparent" />

          <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-6">
            <InfoBlock label="Passenger" value={pass.fullName} />
            <InfoBlock label="Flight" value={pass.flight} />
            <InfoBlock label="Terminal" value={pass.terminal} />
            <InfoBlock label="Gate" value={pass.gate} />
            <InfoBlock label="Seat" value={pass.seat} />
            <InfoBlock label="Boarding" value={pass.boardingTime} />
          </div>

          <div className="mt-9 h-[1px] w-full bg-gradient-to-r from-transparent via-white/16 to-transparent" />

          <p className="mt-8 text-[1.75rem] font-light leading-snug tracking-[0.16em] text-white/92">
            YOUR JOURNEY <br />
            STARTS <span className="text-[#d7a247]">HERE.</span>
          </p>
        </div>

        <div className="relative border-t border-[#d7a247]/14 bg-[#01040b]/76 px-7 py-7">
          <div className="mb-5 flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-[0.34em] text-[#d7a247]/70">
              Digital Boarding ID
            </span>

            <span className="text-[9px] uppercase tracking-[0.28em] text-white/38">
              {pass.boardingId}
            </span>
          </div>

         <div className="flex h-28 w-full items-stretch justify-center gap-[2px] overflow-hidden rounded-xl bg-white px-4 py-4">
  {Array.from({ length: 64 }).map((_, index) => (
    <span
      key={index}
      className="bg-black"
      style={{
        width:
          index % 11 === 0
            ? 5
            : index % 7 === 0
            ? 4
            : index % 3 === 0
            ? 2
            : 1,
        opacity: index % 9 === 0 ? 0.55 : 1,
      }}
    />
  ))}
</div>

          <div className="mt-5 flex justify-between text-[9px] uppercase tracking-[0.28em] text-white/38">
            <span>SEQ 00025</span>
            <span>OMMT SECURE PASS</span>
          </div>
        </div>
      </motion.div>

      <motion.button
        onClick={onFinish}
        className="group relative z-10 mt-5 flex w-full items-center justify-between overflow-hidden rounded-full border border-[#d7a247]/35 bg-[#02050c]/46 px-5 py-[16px] text-[#f7f1e6] shadow-[0_18px_70px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
        initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.55, duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#d7a247]/14 via-white/7 to-transparent" />

        <span className="relative z-10 text-[10px] font-medium uppercase tracking-[0.32em]">
          Complete Check-In
        </span>

        <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[#d7a247]/35 bg-[#d7a247]/10 text-[#f7d27a]">
          <ArrowRight className="h-4 w-4" />
        </span>
      </motion.button>
    </motion.section>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div>
      <p className="mb-2 text-[9px] uppercase tracking-[0.32em] text-[#d7a247]/85">
        {label}
      </p>

      <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/92">
        {value}
      </p>
    </div>
  );
}
/*
  ============================================================
  SECTION 15 — CONFIRMATION SCREEN
  Premium final confirmation screen.
  ============================================================
*/

function ConfirmationScreen({ email }) {
  return (
    <motion.section
      className="absolute inset-0 flex flex-col justify-center px-7 py-8 text-center"
      initial={{ opacity: 0, scale: 1.015, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.99, filter: "blur(6px)" }}
      transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <AviationBackground />

      <div className="relative z-10">
        <motion.div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#d7a247]/35 bg-[#d7a247]/10 text-[#f7d27a]">
          <CheckCircle2 className="h-10 w-10" />
        </motion.div>

        <p className="mt-10 text-[9px] uppercase tracking-[0.42em] text-[#d7a247]/90">
          Boarding Confirmed
        </p>

        <h1 className="mx-auto mt-5 max-w-[92%] text-[2.55rem] font-semibold leading-[0.95] tracking-[-0.055em] text-white">
          Your Boarding Pass is Ready
        </h1>

        <div className="mx-auto mt-7 h-[1px] w-20 bg-gradient-to-r from-transparent via-[#d7a247] to-transparent" />

        <p className="mx-auto mt-7 max-w-[88%] text-[14px] leading-7 text-white/66">
          Your digital boarding pass will be sent to:
        </p>

        <p className="mt-4 text-[15px] tracking-[0.12em] text-[#d7a247]">
          {email}
        </p>

        <p className="mt-12 text-[10px] uppercase tracking-[0.36em] text-white/42">
          Board. Explore. Beyond.
        </p>
      </div>
    </motion.section>
  );
}

/*
  ============================================================
  SECTION 16 — PRIVACY MODAL
  Passenger Information & Data Protection Notice
  ============================================================
*/

function PrivacyModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-6 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="max-h-[82vh] w-full max-w-[390px] overflow-y-auto rounded-[2rem] border border-[#d7a247]/30 bg-[#06152a]/95 p-6 text-white shadow-[0_25px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
      >
        <p className="text-[9px] uppercase tracking-[0.38em] text-[#d7a247]">
          Passenger Information & Privacy Protocol
        </p>

        <h2 className="mt-4 text-[2rem] font-semibold leading-[1] tracking-[-0.04em] text-white">
          Προστασία Προσωπικών Δεδομένων
        </h2>

        <div className="mt-5 h-[1px] w-16 bg-gradient-to-r from-[#d7a247] to-transparent" />

        <div className="mt-7 space-y-7 text-[13px] leading-7 text-white/72">
          <div>
            <h3 className="mb-2 text-[10px] uppercase tracking-[0.28em] text-[#d7a247]">
              Purpose of the Platform
            </h3>
            <p>
              Η παρούσα ψηφιακή πλατφόρμα check-in δημιουργήθηκε στο πλαίσιο της εμπειρίας Philoxenia 2026 – Marketing Made in Greece | On Air, με στόχο τη διαχείριση της συμμετοχής των επισκεπτών, την προσωποποιημένη έκδοση boarding pass και τη συνολική υποστήριξη της διαδραστικής εμπειρίας της εκδήλωσης.
            </p>
          </div>

          <div>
            <h3 className="mb-2 text-[10px] uppercase tracking-[0.28em] text-[#d7a247]">
              Data Collection
            </h3>
            <p>
              Τα προσωπικά δεδομένα που καταχωρούνται μέσω της εφαρμογής, όπως ονοματεπώνυμο, στοιχεία επικοινωνίας και πληροφορίες συμμετοχής, συλλέγονται και υποβάλλονται σε επεξεργασία αποκλειστικά για λειτουργικούς, οργανωτικούς και επικοινωνιακούς σκοπούς που σχετίζονται με τη συμμετοχή σας στην εκδήλωση και στο Secret Destination Giveaway Experience.
            </p>
          </div>

          <div>
            <h3 className="mb-2 text-[10px] uppercase tracking-[0.28em] text-[#d7a247]">
              GDPR Compliance
            </h3>
            <p>
              Η επεξεργασία των δεδομένων πραγματοποιείται σύμφωνα με τον Ευρωπαϊκό Κανονισμό Προστασίας Δεδομένων GDPR – EU 2016/679, με σεβασμό στις αρχές της διαφάνειας, της ασφάλειας και της περιορισμένης χρήσης των πληροφοριών που παρέχονται από τους συμμετέχοντες.
            </p>
          </div>

          <div>
            <h3 className="mb-2 text-[10px] uppercase tracking-[0.28em] text-[#d7a247]">
              Data Usage Policy
            </h3>
            <p>
              Τα δεδομένα δεν διαμοιράζονται, δεν πωλούνται και δεν χρησιμοποιούνται για μη εξουσιοδοτημένες εμπορικές ενέργειες ή δραστηριότητες εκτός του πλαισίου της συγκεκριμένης διοργάνωσης.
            </p>
          </div>

          <div>
            <h3 className="mb-2 text-[10px] uppercase tracking-[0.28em] text-[#d7a247]">
              Participation Consent
            </h3>
            <p>
              Με την ολοκλήρωση της διαδικασίας check-in, οι συμμετέχοντες αποδέχονται τη χρήση των στοιχείων τους αποκλειστικά για τις ανάγκες λειτουργίας της εμπειρίας, της επικοινωνίας σχετικά με την εκδήλωση και της διαδικασίας ταυτοποίησης κατά την είσοδο.
            </p>
          </div>

          <div>
            <h3 className="mb-2 text-[10px] uppercase tracking-[0.28em] text-[#d7a247]">
              Academic Use
            </h3>
            <p>
              Η πλατφόρμα λειτουργεί αποκλειστικά για ακαδημαϊκούς και εκπαιδευτικούς σκοπούς στο πλαίσιο της διοργάνωσης του Department of Organisation Management, Marketing and Tourism του International Hellenic University.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="group relative mt-9 flex w-full items-center justify-center overflow-hidden rounded-full border border-[#d7a247]/35 bg-[#d7a247]/10 px-5 py-[14px] text-[#f7f1e6] backdrop-blur-2xl transition-all duration-300 hover:bg-[#d7a247]/16"
        >
          <span className="relative z-10 text-[10px] font-medium uppercase tracking-[0.32em] text-[#f7d27a]">
            Continue to Check-In
          </span>
        </button>
      </motion.div>
    </div>
  );
}

