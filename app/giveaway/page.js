"use client";

// ============================================================================
// SECTION 1 — IMPORTS
// ============================================================================

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { AnimatePresence, motion } from "framer-motion";
import {
  Instrument_Sans,
  IBM_Plex_Mono,
} from "next/font/google";

import { supabase } from "@/lib/supabaseClient";


// ============================================================================
// SECTION 2 — CONFIGURATION
// ============================================================================

const EXPERIENCE_ID = "main";
const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-sans",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
  variable: "--font-ibm-plex-mono",
});

const STAGES = {
  INITIAL: "initial",
  MANIFEST_LOADING: "manifest_loading",
  MANIFEST_READY: "manifest_ready",
  FINAL_BOARDING: "final_boarding",
  VERIFYING: "verifying",
  VERIFIED: "verified",
  CLEARANCE: "clearance",
  DESTINATION_LOCKED: "destination_locked",
  SELECTING: "selecting",
  PASSENGER_SELECTED: "passenger_selected",
  WINNER_REVEALED: "winner_revealed",
  CLOSING: "closing",
};

const STAGE_ORDER = [
  STAGES.INITIAL,
  STAGES.MANIFEST_LOADING,
  STAGES.MANIFEST_READY,
  STAGES.FINAL_BOARDING,
  STAGES.VERIFYING,
  STAGES.VERIFIED,
  STAGES.CLEARANCE,
  STAGES.DESTINATION_LOCKED,
  STAGES.SELECTING,
  STAGES.PASSENGER_SELECTED,
  STAGES.WINNER_REVEALED,
  STAGES.CLOSING,
];

const STAGE_CONTENT = {
  [STAGES.INITIAL]: {
    chapter: "ACT III",
    eyebrow: "Secret Destination Experience",
    primary: "Final Boarding",
    secondary: "Procedure",
    description:
      "The final chapter of today’s journey is ready to begin.",
    systemStatus: "Awaiting Ground Operations",
    progress: 0,
    atmosphere: "idle",
  },

  [STAGES.MANIFEST_LOADING]: {
    chapter: "PROCEDURE 01",
    eyebrow: "Passenger Manifest",
    primary: "Manifest",
    secondary: "Loading",
    description:
      "Retrieving eligible passengers from the secured check-in records.",
    systemStatus: "Secure Data Transfer",
    progress: 12,
    atmosphere: "data",
  },

  [STAGES.MANIFEST_READY]: {
    chapter: "PROCEDURE 02",
    eyebrow: "Passenger Manifest",
    primary: "Manifest",
    secondary: "Received",
    description:
      "Passenger records have been transferred to Ground Operations.",
    systemStatus: "Manifest Available",
    progress: 24,
    atmosphere: "data",
  },

  [STAGES.FINAL_BOARDING]: {
    chapter: "PROCEDURE 03",
    eyebrow: "Final Boarding Procedure",
    primary: "Final",
    secondary: "Boarding",
    description:
      "Eligible passengers are entering the final departure sequence.",
    systemStatus: "Boarding in Progress",
    progress: 36,
    atmosphere: "boarding",
  },

  [STAGES.VERIFYING]: {
    chapter: "PROCEDURE 04",
    eyebrow: "Eligibility Verification",
    primary: "Manifest",
    secondary: "Verification",
    description:
      "Check-in credentials and giveaway eligibility are being confirmed.",
    systemStatus: "Verification in Progress",
    progress: 48,
    atmosphere: "scan",
  },

  [STAGES.VERIFIED]: {
    chapter: "PROCEDURE 05",
    eyebrow: "Eligibility Verification",
    primary: "Manifest",
    secondary: "Verified",
    description:
      "All passenger records have passed the final eligibility procedure.",
    systemStatus: "Verification Complete",
    progress: 58,
    atmosphere: "verified",
  },

  [STAGES.CLEARANCE]: {
    chapter: "PROCEDURE 06",
    eyebrow: "Ground Operations Clearance",
    primary: "Departure",
    secondary: "Clearance",
    description:
      "Ground Operations has authorised the Secret Destination procedure.",
    systemStatus: "Clearance Confirmed",
    progress: 68,
    atmosphere: "clearance",
  },

  [STAGES.DESTINATION_LOCKED]: {
    chapter: "PROCEDURE 07",
    eyebrow: "Secret Destination",
    primary: "Destination",
    secondary: "Locked",
    description:
      "The destination has been secured. Passenger selection may now begin.",
    systemStatus: "Destination Confidential",
    progress: 78,
    atmosphere: "locked",
  },

  [STAGES.SELECTING]: {
    chapter: "PROCEDURE 08",
    eyebrow: "Passenger Selection Sequence",
    primary: "Selection",
    secondary: "In Progress",
    description:
      "The verified manifest is being processed through the final selection sequence.",
    systemStatus: "Secure Selection Active",
    progress: 88,
    atmosphere: "selection",
  },

  [STAGES.PASSENGER_SELECTED]: {
    chapter: "FINAL CLEARANCE",
    eyebrow: "Passenger Selection Sequence",
    primary: "Passenger",
    secondary: "Selected",
    description:
      "Identity secured. Awaiting public announcement clearance.",
    systemStatus: "Identity Secured",
    progress: 94,
    atmosphere: "silence",
  },

  [STAGES.WINNER_REVEALED]: {
    chapter: "SECRET DESTINATION CLEARANCE",
    eyebrow: "Passenger Cleared",
    primary: "Your Next Journey",
    secondary: "Begins Now",
    description:
      "One passenger has received clearance for the Secret Destination Experience.",
    systemStatus: "Passenger Cleared",
    progress: 100,
    atmosphere: "reveal",
  },

  [STAGES.CLOSING]: {
    chapter: "NEW HORIZONS",
    eyebrow: "OMMTo Airlines",
    primary: "One Journey Ends.",
    secondary: "Another Begins.",
    description:
      "Thank you for travelling with us through New Horizons.",
    systemStatus: "Experience Complete",
    progress: 100,
    atmosphere: "closing",
  },
};

const MOTION = {
  screen: {
    initial: {
      opacity: 0,
      filter: "blur(18px)",
      scale: 0.985,
    },

    animate: {
      opacity: 1,
      filter: "blur(0px)",
      scale: 1,
      transition: {
        duration: 1.15,
        ease: [0.22, 1, 0.36, 1],
      },
    },

    exit: {
      opacity: 0,
      filter: "blur(12px)",
      scale: 1.012,
      transition: {
        duration: 0.65,
        ease: [0.4, 0, 1, 1],
      },
    },
  },

  fadeUp: {
    initial: {
      opacity: 0,
      y: 28,
    },

    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.9,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  },

  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.13,
      },
    },
  },
};

const formatCount = (value) =>
  new Intl.NumberFormat("en-US", {
    minimumIntegerDigits: 2,
  }).format(value || 0);


// ============================================================================
// SECTION 3 — MAIN PUBLIC GIVEAWAY PAGE
// ============================================================================

export default function GiveawayPage() {
  const [experience, setExperience] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [selectedPassenger, setSelectedPassenger] =
    useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] =
    useState("connecting");
  const [errorMessage, setErrorMessage] = useState("");

  const stage = experience?.stage || STAGES.INITIAL;

  const safeStage = STAGE_CONTENT[stage]
    ? stage
    : STAGES.INITIAL;

  const stageContent = STAGE_CONTENT[safeStage];

  const stageIndex = Math.max(
    0,
    STAGE_ORDER.indexOf(safeStage)
  );

  const passengerCount =
    experience?.manifest_count || passengers.length || 0;

  const selectionPreview =
    experience?.selection_preview || null;

  const loadSelectedPassenger = useCallback(
    async (passengerId) => {
      if (!passengerId) {
        setSelectedPassenger(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("participants")
          .select(`
            id,
            full_name,
            email,
            ticket_code,
            flight,
            seat,
            gate,
            terminal,
            status,
            created_at,
            giveaway_eligible,
            giveaway_winner,
            giveaway_selected_at
          `)
          .eq("id", passengerId)
          .maybeSingle();

        if (error) {
          throw error;
        }

        setSelectedPassenger(data || null);
      } catch (error) {
        console.error(
          "Selected passenger loading error:",
          error
        );

        setErrorMessage(
          "The selected passenger could not be loaded."
        );
      }
    },
    []
  );

  const loadPassengerReferences = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("participants")
        .select(`
          id,
          ticket_code,
          flight,
          seat,
          gate
        `)
        .eq("giveaway_eligible", true)
        .not("ticket_code", "is", null)
        .order("created_at", {
          ascending: true,
        })
        .limit(12);

      if (error) {
        throw error;
      }

      setPassengers(data || []);
    } catch (error) {
      console.error(
        "Passenger reference loading error:",
        error
      );

      /*
       * Δεν εμφανίζουμε public error για τα atmospheric
       * references, επειδή δεν επηρεάζουν τη λειτουργία
       * της τελετής.
       */
    }
  }, []);

  const applyExperienceState = useCallback(
    async (nextExperience) => {
      if (!nextExperience) {
        return;
      }

      setExperience(nextExperience);
      setErrorMessage("");

      if (nextExperience.selected_passenger_id) {
        await loadSelectedPassenger(
          nextExperience.selected_passenger_id
        );
      } else {
        setSelectedPassenger(null);
      }
    },
    [loadSelectedPassenger]
  );

  const loadInitialExperience = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase
        .from("giveaway_experience")
        .select("*")
        .eq("id", EXPERIENCE_ID)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error(
          "The giveaway experience state has not been initialized."
        );
      }

      await applyExperienceState(data);
      await loadPassengerReferences();
    } catch (error) {
      console.error(
        "Public giveaway loading error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "The Secret Destination Experience could not be loaded."
      );
    } finally {
      setIsLoading(false);
    }
  }, [applyExperienceState, loadPassengerReferences]);

  useEffect(() => {
    loadInitialExperience();
  }, [loadInitialExperience]);

  useEffect(() => {
    const channel = supabase
      .channel("giveaway-public-experience")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "giveaway_experience",
          filter: `id=eq.${EXPERIENCE_ID}`,
        },
        async (payload) => {
          if (!payload.new) {
            return;
          }

          await applyExperienceState(payload.new);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setConnectionStatus("connected");
          return;
        }

        if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
          setConnectionStatus("disconnected");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [applyExperienceState]);

  useEffect(() => {
    const refreshState = () => {
      if (document.visibilityState === "visible") {
        loadInitialExperience();
      }
    };

    document.addEventListener(
      "visibilitychange",
      refreshState
    );

    window.addEventListener("focus", refreshState);

    return () => {
      document.removeEventListener(
        "visibilitychange",
        refreshState
      );

      window.removeEventListener("focus", refreshState);
    };
  }, [loadInitialExperience]);

  if (isLoading && !experience) {
    return <PublicLoadingScreen />;
  }

  return (
   <main
  className={`${instrumentSans.variable} ${ibmPlexMono.variable} relative min-h-screen overflow-hidden bg-[#020711] font-[var(--font-instrument-sans)] text-[#f4f1ea] selection:bg-[#c7a86c]/30`}
>
      <AtmosphericBackground
        stage={safeStage}
        atmosphere={stageContent.atmosphere}
        passengers={passengers}
      />

      <div className="relative z-20 flex min-h-screen flex-col">
        <PublicHeader
          stage={safeStage}
          stageIndex={stageIndex}
          passengerCount={passengerCount}
          connectionStatus={connectionStatus}
        />

        <div className="flex flex-1 items-center justify-center px-5 pb-24 pt-28 sm:px-9 sm:pb-28 sm:pt-32 lg:px-14">
          <div className="mx-auto w-full max-w-[1680px]">
            <AnimatePresence mode="wait">
              <ExperienceStage
                key={safeStage}
                stage={safeStage}
                content={stageContent}
                passengerCount={passengerCount}
                selectionPreview={selectionPreview}
                selectedPassenger={selectedPassenger}
                errorMessage={errorMessage}
              />
            </AnimatePresence>
          </div>
        </div>

        <BrandSignature
          stage={safeStage}
          status={stageContent.systemStatus}
          progress={stageContent.progress}
        />
      </div>
    </main>
  );
}


// ============================================================================
// SECTION 4 — PUBLIC EXPERIENCE STATE SCREENS
// ============================================================================

function ExperienceStage({
  stage,
  content,
  passengerCount,
  selectionPreview,
  selectedPassenger,
  errorMessage,
}) {
  if (stage === STAGES.SELECTING) {
    return (
      <PassengerSelectionStage
        content={content}
        passenger={selectionPreview}
        passengerCount={passengerCount}
      />
    );
  }

  if (stage === STAGES.PASSENGER_SELECTED) {
    return (
      <PassengerSelectedStage content={content} />
    );
  }

  if (stage === STAGES.WINNER_REVEALED) {
    return (
      <WinnerRevealStage
        content={content}
        passenger={selectedPassenger}
      />
    );
  }

  if (stage === STAGES.CLOSING) {
    return <ClosingStage content={content} />;
  }

  return (
    <OperationsStage
      stage={stage}
      content={content}
      passengerCount={passengerCount}
      errorMessage={errorMessage}
    />
  );
}

function OperationsStage({
  stage,
  content,
  passengerCount,
  errorMessage,
}) {
  const showManifestCount = [
    STAGES.MANIFEST_READY,
    STAGES.FINAL_BOARDING,
    STAGES.VERIFYING,
    STAGES.VERIFIED,
    STAGES.CLEARANCE,
    STAGES.DESTINATION_LOCKED,
  ].includes(stage);

  const processingStage = [
    STAGES.MANIFEST_LOADING,
    STAGES.VERIFYING,
  ].includes(stage);

  return (
    <motion.section
      variants={MOTION.screen}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative flex min-h-[610px] items-center justify-center"
    >
      <StageCoordinates />

      <motion.div
        variants={MOTION.stagger}
        initial="initial"
        animate="animate"
        className="relative z-10 flex w-full max-w-[1350px] flex-col items-center px-4 text-center"
      >
        <motion.div
  variants={MOTION.fadeUp}
  className="mb-8 flex flex-col items-center sm:mb-10"
>
  <div className="flex items-center gap-4">
    <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#c8aa70]/45 sm:w-20" />

    <p className="font-[var(--font-ibm-plex-mono)] text-[7px] font-normal uppercase tracking-[0.4em] text-white/24 sm:text-[8px]">
      {content.chapter}
    </p>

    <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#c8aa70]/45 sm:w-20" />
  </div>

  <p className="mt-4 text-[9px] font-medium uppercase tracking-[0.42em] text-[#d1b77f] sm:text-[11px]">
    {content.eyebrow}
  </p>
</motion.div>

        <motion.h1
  variants={MOTION.fadeUp}
  className="max-w-[1480px] text-[clamp(3.35rem,8.4vw,9.4rem)] font-[300] leading-[0.86] tracking-[-0.075em] text-[#f7f6f2]"
>
  <span className="block">
    {content.primary}
  </span>

  <span className="block text-[#d9dde3]/72">
    {content.secondary}
  </span>
</motion.h1>

        <motion.p
          variants={MOTION.fadeUp}
          className="mt-8 max-w-2xl text-sm font-light leading-7 tracking-[0.03em] text-white/45 sm:mt-10 sm:text-base sm:leading-8"
        >
          {content.description}
        </motion.p>

        {showManifestCount && (
          <motion.div
            variants={MOTION.fadeUp}
            className="mt-12 sm:mt-14"
          >
            <div className="flex items-center justify-center gap-4">
              <span className="h-px w-12 bg-white/10" />

              <p className="text-[9px] uppercase tracking-[0.42em] text-white/30">
                Verified Passenger Manifest
              </p>

              <span className="h-px w-12 bg-white/10" />
            </div>

            <p className="mt-5 font-[var(--font-ibm-plex-mono)] text-5xl font-light tracking-[-0.055em] text-[#e5dccb] sm:text-7xl">
              {formatCount(passengerCount)}
            </p>
          </motion.div>
        )}

        {processingStage && (
          <motion.div
            variants={MOTION.fadeUp}
            className="mt-12 flex items-center gap-4"
          >
            <ProcessingIndicator />

            <span className="text-[9px] uppercase tracking-[0.34em] text-white/30">
              Procedure active
            </span>
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mt-10 max-w-2xl border-l border-red-300/35 bg-red-300/[0.035] px-5 py-3 text-left"
          >
            <p className="text-[8px] uppercase tracking-[0.3em] text-red-200/45">
              Experience Notice
            </p>

            <p className="mt-2 text-xs tracking-[0.035em] text-red-100/65">
              {errorMessage}
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.section>
  );
}


// ============================================================================
// SECTION 5 — PASSENGER SELECTION PUBLIC SCREEN
// ============================================================================

function PassengerSelectionStage({
  content,
  passenger,
  passengerCount,
}) {
  const reference =
    passenger?.ticket_code || "AV-••••••";

  const seat = passenger?.seat || "—";
  const gate = passenger?.gate || "—";
  const flight = passenger?.flight || "OM 1025";

  return (
    <motion.section
      variants={MOTION.screen}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative flex min-h-[650px] items-center justify-center"
    >
      <StageCoordinates />

      <div className="relative z-10 flex w-full max-w-[1420px] flex-col items-center px-4 text-center">
        <p className="text-[9px] uppercase tracking-[0.44em] text-[#cbb07c] sm:text-xs">
          {content.eyebrow}
        </p>

        <h1 className="mt-7 text-[clamp(3.5rem,8.3vw,9.1rem)] font-[300] leading-[0.86] tracking-[-0.075em] text-[#f7f6f2]">
          Selection

          <span className="block text-white/65">
            In Progress
          </span>
        </h1>

        <div className="relative mt-12 w-full max-w-5xl overflow-hidden border-y border-white/[0.075] py-8 sm:mt-16 sm:py-10">
          <motion.div
            className="absolute inset-y-0 w-[34%] bg-gradient-to-r from-transparent via-[#d0b276]/[0.08] to-transparent"
            animate={{
              x: ["-140%", "390%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={`${reference}-${seat}-${gate}-${flight}`}
              initial={{
                opacity: 0,
                y: 14,
                filter: "blur(8px)",
              }}
              animate={{
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
              }}
              exit={{
                opacity: 0,
                y: -14,
                filter: "blur(8px)",
              }}
              transition={{
                duration: 0.16,
              }}
              className="relative grid grid-cols-2 gap-6 sm:grid-cols-4"
            >
              <SelectionMetric
                label="Ticket"
                value={reference}
              />

              <SelectionMetric
                label="Flight"
                value={flight}
              />

              <SelectionMetric
                label="Seat"
                value={seat}
              />

              <SelectionMetric
                label="Gate"
                value={gate}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-10 flex items-center gap-4">
          <ProcessingIndicator />

          <span className="text-[9px] uppercase tracking-[0.34em] text-white/30">
            Processing {formatCount(passengerCount)} verified
            records
          </span>
        </div>
      </div>
    </motion.section>
  );
}

function SelectionMetric({ label, value }) {
  return (
    <div>
      <p className="text-[8px] uppercase tracking-[0.34em] text-white/25">
        {label}
      </p>

      <p className="mt-3 truncate font-[var(--font-ibm-plex-mono)] text-sm tracking-[0.15em] text-[#dfcfaf]/75 sm:text-lg">
        {value}
      </p>
    </div>
  );
}


// ============================================================================
// SECTION 6 — PASSENGER SELECTED PUBLIC SCREEN
// ============================================================================

function PassengerSelectedStage() {
  return (
    <motion.section
      variants={MOTION.screen}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative flex min-h-[650px] items-center justify-center"
    >
      <StageCoordinates />

      <div className="relative z-10 flex flex-col items-center px-4 text-center">
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.6,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 1.1,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative mb-12 flex h-20 w-20 items-center justify-center"
        >
          <motion.span
            initial={{
              scale: 0.7,
              opacity: 0,
            }}
            animate={{
              scale: 1.7,
              opacity: 0,
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
            }}
            className="absolute inset-0 rounded-full border border-[#c8aa70]/25"
          />

          <span className="absolute inset-0 rounded-full border border-[#c8aa70]/30" />

          <CheckIcon />
        </motion.div>

        <motion.p
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.25,
            duration: 0.8,
          }}
          className="text-[9px] uppercase tracking-[0.46em] text-[#cbb07c] sm:text-xs"
        >
          Identity Secured
        </motion.p>

        <motion.h1
          initial={{
            opacity: 0,
            y: 35,
            filter: "blur(10px)",
          }}
          animate={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
          }}
          transition={{
            delay: 0.45,
            duration: 1.25,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mt-7 text-[clamp(4rem,10vw,10.8rem)] font-extralight leading-[0.82] tracking-[-0.075em] text-[#f5f4f0]"
        >
          Passenger

          <span className="block text-white/65">
            Selected
          </span>
        </motion.h1>

        <motion.div
          initial={{
            scaleX: 0,
          }}
          animate={{
            scaleX: 1,
          }}
          transition={{
            delay: 0.9,
            duration: 1.6,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mt-10 h-px w-56 origin-center bg-gradient-to-r from-transparent via-[#c8aa70]/65 to-transparent sm:w-96"
        />

        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 1.25,
            duration: 1,
          }}
          className="mt-8 text-xs uppercase tracking-[0.3em] text-white/30"
        >
          Awaiting public reveal clearance
        </motion.p>
      </div>
    </motion.section>
  );
}


// ============================================================================
// SECTION 7 — WINNER REVEAL
// ============================================================================

function WinnerRevealStage({ content, passenger }) {
  const passengerName =
    passenger?.full_name || "Selected Passenger";

  return (
    <motion.section
      variants={MOTION.screen}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative flex min-h-[700px] items-center justify-center"
    >
      <StageCoordinates />

      <motion.div
        initial={{
          opacity: 0,
          scaleX: 0,
        }}
        animate={{
          opacity: 1,
          scaleX: 1,
        }}
        transition={{
          duration: 1.8,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="absolute left-[8%] right-[8%] top-1/2 h-px origin-center bg-gradient-to-r from-transparent via-[#d5b878]/45 to-transparent"
      />

      <div className="relative z-10 flex w-full max-w-[1500px] flex-col items-center px-4 text-center">
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.75,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 1.15,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mb-9 flex h-20 w-20 items-center justify-center"
        >
          <OrbitMark />
        </motion.div>

        <motion.p
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.3,
            duration: 0.8,
          }}
          className="text-[9px] uppercase tracking-[0.48em] text-[#d0b57d] sm:text-xs"
        >
          {content.eyebrow}
        </motion.p>

        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.75,
            duration: 0.8,
          }}
          className="mt-8 font-[var(--font-ibm-plex-mono)] text-xs tracking-[0.28em] text-white/35 sm:text-sm"
        >
          {passenger?.ticket_code || "AV-••••••"}
        </motion.p>

        <motion.h1
          initial={{
            opacity: 0,
            y: 45,
            filter: "blur(16px)",
          }}
          animate={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
          }}
          transition={{
            delay: 1.15,
            duration: 1.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mt-8 max-w-[1450px] font-serif text-[clamp(4rem,10vw,11rem)] font-light leading-[0.85] tracking-[-0.065em] text-[#f7f1e7]"
        >
          {passengerName}
        </motion.h1>

        <motion.div
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 1.8,
            duration: 0.9,
          }}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4"
        >
          <WinnerMetric
            label="Flight"
            value={passenger?.flight || "OM 1025"}
          />

          <WinnerDivider />

          <WinnerMetric
            label="Seat"
            value={passenger?.seat || "—"}
          />

          <WinnerDivider />

          <WinnerMetric
            label="Gate"
            value={passenger?.gate || "—"}
          />

          <WinnerDivider />

          <WinnerMetric
            label="Terminal"
            value={passenger?.terminal || "—"}
          />
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 2.35,
            duration: 1,
          }}
          className="mt-14"
        >
          <p className="text-xs font-light uppercase tracking-[0.33em] text-[#ded1ba]/55 sm:text-sm">
            Your next journey begins now.
          </p>

          <p className="mt-5 text-lg font-light tracking-[-0.025em] text-[#f0e9dc] sm:text-2xl">
            Secret Destination Experience
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}

function WinnerMetric({ label, value }) {
  return (
    <div className="min-w-[90px]">
      <p className="text-[8px] uppercase tracking-[0.3em] text-white/25">
        {label}
      </p>

      <p className="mt-2 font-[var(--font-ibm-plex-mono)] text-xs tracking-[0.16em] text-[#e0cfad]/70">
        {value}
      </p>
    </div>
  );
}

function WinnerDivider() {
  return (
    <span className="hidden h-8 w-px bg-white/10 sm:block" />
  );
}


// ============================================================================
// SECTION 8 — CLOSING CEREMONY
// ============================================================================

function ClosingStage({ content }) {
  return (
    <motion.section
      variants={MOTION.screen}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative flex min-h-[680px] items-center justify-center"
    >
      <StageCoordinates />

      <div className="relative z-10 flex max-w-[1450px] flex-col items-center px-4 text-center">
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.7,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 1.3,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mb-11"
        >
          <OrbitMark large />
        </motion.div>

        <motion.p
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.35,
            duration: 0.8,
          }}
          className="text-[9px] uppercase tracking-[0.48em] text-[#cfb47d] sm:text-xs"
        >
          Secret Destination Experience
        </motion.p>

        <motion.h1
          initial={{
            opacity: 0,
            y: 40,
            filter: "blur(14px)",
          }}
          animate={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
          }}
          transition={{
            delay: 0.65,
            duration: 1.4,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mt-8 text-[clamp(3.6rem,9vw,9.8rem)] font-extralight leading-[0.84] tracking-[-0.075em] text-[#f5f3ed]"
        >
          <span className="block">
            {content.primary}
          </span>

          <span className="block text-white/65">
            {content.secondary}
          </span>
        </motion.h1>

        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 1.4,
            duration: 1,
          }}
          className="mt-9 text-sm font-light tracking-[0.06em] text-white/38 sm:text-base"
        >
          {content.description}
        </motion.p>

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 2,
            duration: 1.2,
          }}
          className="mt-16"
        >
          <p className="text-xl font-light tracking-[-0.035em] text-[#eee7db] sm:text-3xl">
            OMMT
            <span className="lowercase">o</span>
            ...New Horizons
          </p>

          <p className="mt-3 text-[8px] uppercase tracking-[0.4em] text-white/24">
            Aviation · Tourism · Innovation
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}


// ============================================================================
// SECTION 9 — BRAND SIGNATURE
// ============================================================================

function PublicHeader({
  stage,
  stageIndex,
  passengerCount,
  connectionStatus,
}) {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between px-6 py-6 sm:px-9 sm:py-8 lg:px-12">
      <div>
        <p className="text-lg font-light tracking-[-0.04em] text-[#f2eee7] sm:text-2xl">
          OMMT
          <span className="lowercase">o</span>
          ...New Horizons
        </p>

        <p className="mt-2 text-[7px] uppercase tracking-[0.39em] text-white/22 sm:text-[8px]">
          Aviation · Tourism · Innovation
        </p>
      </div>

      <div className="hidden items-start gap-8 sm:flex lg:gap-11">
        <HeaderMetric
          label="Sequence"
          value={`${String(stageIndex + 1).padStart(
            2,
            "0"
          )} / ${String(STAGE_ORDER.length).padStart(
            2,
            "0"
          )}`}
        />

        <HeaderMetric
          label="Manifest"
          value={
            passengerCount
              ? formatCount(passengerCount)
              : "—"
          }
        />

        <HeaderMetric
          label="Status"
          value={
            stage === STAGES.CLOSING
              ? "COMPLETE"
              : "ACTIVE"
          }
        />

        <ConnectionMetric status={connectionStatus} />
      </div>
    </header>
  );
}

function HeaderMetric({ label, value }) {
  return (
    <div className="text-right">
      <p className="text-[7px] uppercase tracking-[0.34em] text-white/18">
        {label}
      </p>

      <p className="mt-2 font-[var(--font-ibm-plex-mono)] text-[8px] tracking-[0.18em] text-white/38">
        {value}
      </p>
    </div>
  );
}

function ConnectionMetric({ status }) {
  const connected = status === "connected";

  return (
    <div className="text-right">
      <p className="text-[7px] uppercase tracking-[0.34em] text-white/18">
        Signal
      </p>

      <div className="mt-2 flex items-center justify-end gap-2">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            connected
              ? "bg-emerald-300/65"
              : "animate-pulse bg-[#c8aa70]/70"
          }`}
        />

        <p className="font-[var(--font-ibm-plex-mono)] text-[8px] tracking-[0.18em] text-white/38">
          {connected ? "LIVE" : "SYNC"}
        </p>
      </div>
    </div>
  );
}

function BrandSignature({ stage, status, progress }) {
  return (
    <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-30 px-6 pb-6 sm:px-9 sm:pb-8 lg:px-12">
      <div className="mx-auto flex max-w-[1680px] items-end justify-between gap-8">
        <div className="hidden sm:block">
          <p className="text-[7px] uppercase tracking-[0.34em] text-white/18">
            Marketing Made in Greece — On Air
          </p>

          <p className="mt-2 text-[7px] uppercase tracking-[0.3em] text-white/13">
            Philoxenia 2026
          </p>
        </div>

        <div className="w-full max-w-md sm:w-[360px]">
          <div className="mb-2 flex items-center justify-between gap-6">
            <span className="truncate text-[7px] uppercase tracking-[0.3em] text-white/23">
              {status}
            </span>

            <span className="font-[var(--font-ibm-plex-mono)] text-[7px] tracking-[0.17em] text-white/23">
              {String(progress).padStart(3, "0")}%
            </span>
          </div>

          <div className="h-px overflow-hidden bg-white/[0.06]">
            <motion.div
              animate={{
                width: `${progress}%`,
              }}
              transition={{
                duration: 1.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="h-full bg-gradient-to-r from-[#715a35] via-[#c6a86c] to-[#e1ca98]"
            />
          </div>
        </div>

        <div className="hidden text-right lg:block">
          <p className="text-[7px] uppercase tracking-[0.34em] text-white/18">
            Secret Destination
          </p>

          <p className="mt-2 font-[var(--font-ibm-plex-mono)] text-[7px] tracking-[0.2em] text-white/13">
            {stage === STAGES.CLOSING
              ? "JOURNEY COMPLETE"
              : "CONFIDENTIAL"}
          </p>
        </div>
      </div>
    </footer>
  );
}


// ============================================================================
// SECTION 10 — ATMOSPHERIC BACKGROUND
// ============================================================================

function AtmosphericBackground({
  stage,
  atmosphere,
  passengers,
}) {
  const intense = [
    "locked",
    "selection",
    "reveal",
    "closing",
  ].includes(atmosphere);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#06111f_0%,#020812_58%,#01040a_100%)]" />

      <motion.div
        animate={{
          opacity: intense ? 0.42 : 0.24,
          scale: intense ? 1.08 : 1,
          x:
            atmosphere === "selection"
              ? ["-4%", "4%", "-4%"]
              : "0%",
        }}
        transition={{
          opacity: {
            duration: 2,
          },
          scale: {
            duration: 2,
          },
          x: {
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
        className="absolute left-1/2 top-[-33%] h-[95%] w-[75%] -translate-x-1/2 rounded-full bg-[#174474]/38 blur-[170px]"
      />

      <motion.div
        animate={{
          opacity:
            atmosphere === "reveal" ||
            atmosphere === "closing"
              ? 0.3
              : atmosphere === "locked"
                ? 0.18
                : 0.08,
        }}
        transition={{
          duration: 2.3,
        }}
        className="absolute bottom-[-42%] left-[6%] h-[75%] w-[70%] rounded-full bg-[#b38b4b]/32 blur-[190px]"
      />

      <GridLayer />

      <ManifestDataStream
        passengers={passengers}
        visible={[
          STAGES.MANIFEST_LOADING,
          STAGES.MANIFEST_READY,
          STAGES.FINAL_BOARDING,
          STAGES.VERIFYING,
          STAGES.SELECTING,
        ].includes(stage)}
      />

      <RadarLayer
        visible={[
          STAGES.VERIFYING,
          STAGES.VERIFIED,
          STAGES.CLEARANCE,
          STAGES.DESTINATION_LOCKED,
        ].includes(stage)}
      />

      <RunwayLayer />

      <MovingReflection />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_28%,rgba(0,0,0,0.68)_100%)]" />

      <NoiseLayer />
    </div>
  );
}

function GridLayer() {
  return (
    <div
      className="absolute inset-0 opacity-[0.045]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.33) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.33) 1px, transparent 1px)",
        backgroundSize: "74px 74px",
        maskImage:
          "linear-gradient(to bottom, transparent, black 15%, black 80%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent, black 15%, black 80%, transparent)",
      }}
    />
  );
}

function ManifestDataStream({ passengers, visible }) {
  const fallbackReferences = [
    "OM1025",
    "AV-183742",
    "BOARDING",
    "MANIFEST",
    "VERIFIED",
    "GATE 08",
    "TERMINAL 02",
    "CLEARANCE",
  ];

  const passengerReferences = passengers
    .slice(0, 8)
    .map((passenger) => passenger.ticket_code)
    .filter(Boolean);

  const references =
    passengerReferences.length > 0
      ? passengerReferences
      : fallbackReferences;

  return (
    <motion.div
      animate={{
        opacity: visible ? 1 : 0.25,
      }}
      transition={{
        duration: 1.5,
      }}
      className="absolute inset-y-[18%] left-[2%] hidden w-40 overflow-hidden lg:block"
    >
      <motion.div
        animate={{
          y: ["0%", "-45%"],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "linear",
        }}
        className="space-y-7"
      >
        {[...references, ...references, ...references].map(
          (reference, index) => (
            <p
              key={`${reference}-${index}`}
              className="font-[var(--font-ibm-plex-mono)] text-[7px] uppercase tracking-[0.28em] text-white/[0.055]"
            >
              {reference}
            </p>
          )
        )}
      </motion.div>
    </motion.div>
  );
}

function RadarLayer({ visible }) {
  return (
    <motion.div
      animate={{
        opacity: visible ? 0.12 : 0.025,
      }}
      transition={{
        duration: 1.8,
      }}
      className="absolute right-[-13%] top-[12%] hidden h-[620px] w-[620px] rounded-full border border-[#b9d0e9]/20 lg:block"
    >
      <span className="absolute inset-[18%] rounded-full border border-[#b9d0e9]/15" />
      <span className="absolute inset-[36%] rounded-full border border-[#b9d0e9]/15" />

      <span className="absolute left-1/2 top-0 h-full w-px bg-[#b9d0e9]/10" />
      <span className="absolute left-0 top-1/2 h-px w-full bg-[#b9d0e9]/10" />

      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, transparent 322deg, rgba(170,205,236,0.16) 350deg, transparent 360deg)",
        }}
      />
    </motion.div>
  );
}

function RunwayLayer() {
  return (
    <div className="absolute bottom-[8%] left-1/2 w-[70%] -translate-x-1/2 opacity-30">
      <div className="relative h-12">
        {Array.from({ length: 13 }).map(
          (_, index) => (
            <motion.span
              key={index}
              animate={{
                opacity: [0.1, 0.75, 0.1],
              }}
              transition={{
                duration: 3.8,
                repeat: Infinity,
                delay: index * 0.18,
              }}
              className="absolute bottom-0 h-[2px] w-[2px] rounded-full bg-[#dfc48e]"
              style={{
                left: `${(index / 12) * 100}%`,
              }}
            />
          )
        )}

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.055] to-transparent" />
      </div>
    </div>
  );
}

function MovingReflection() {
  return (
    <motion.div
      animate={{
        x: ["-40%", "160%"],
        opacity: [0, 0.16, 0],
      }}
      transition={{
        duration: 16,
        repeat: Infinity,
        repeatDelay: 3,
        ease: "linear",
      }}
      className="absolute top-[20%] h-px w-[32%] bg-gradient-to-r from-transparent via-[#d7bc83]/70 to-transparent"
    />
  );
}

function NoiseLayer() {
  return (
    <div className="absolute inset-0 opacity-[0.023] mix-blend-soft-light">
      <div
        className="h-full w-full"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.95' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='.75'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}


// ============================================================================
// SECTION 11 — SUPPORTING VISUAL COMPONENTS
// ============================================================================

function PublicLoadingScreen() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020711] text-[#f4f1ea]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(23,68,116,0.38),transparent_45%),linear-gradient(180deg,#06111f_0%,#020812_58%,#01040a_100%)]" />

      <div className="relative z-10 flex flex-col items-center text-center">
        <OrbitMark large />

        <p className="mt-10 text-[9px] uppercase tracking-[0.42em] text-[#cbb07c]">
          Secret Destination Experience
        </p>

        <div className="mt-6 flex items-center gap-4">
          <ProcessingIndicator />

          <p className="text-[8px] uppercase tracking-[0.32em] text-white/30">
            Establishing live connection
          </p>
        </div>
      </div>
    </main>
  );
}

function StageCoordinates() {
  return (
    <>
      <div className="absolute left-0 top-1/2 hidden -translate-y-1/2 items-center gap-3 lg:flex">
        <span className="font-[var(--font-ibm-plex-mono)] text-[7px] tracking-[0.2em] text-white/12">
          40.6401° N
        </span>

        <span className="h-px w-12 bg-white/[0.07]" />
      </div>

      <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 items-center gap-3 lg:flex">
        <span className="h-px w-12 bg-white/[0.07]" />

        <span className="font-[var(--font-ibm-plex-mono)] text-[7px] tracking-[0.2em] text-white/12">
          22.9444° E
        </span>
      </div>
    </>
  );
}

function ProcessingIndicator() {
  return (
    <span className="flex items-center gap-1.5">
      {[0, 1, 2].map((item) => (
        <motion.span
          key={item}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.75, 1.15, 0.75],
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            delay: item * 0.2,
          }}
          className="h-1 w-1 rounded-full bg-[#c9ab70]"
        />
      ))}
    </span>
  );
}

function OrbitMark({ large = false }) {
  const sizeClass = large ? "h-20 w-20" : "h-12 w-12";

  return (
    <div className={`relative ${sizeClass}`}>
      <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d1b477]" />

      <motion.span
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute inset-0 rounded-full border border-[#d1b477]/40"
      >
        <span className="absolute left-1/2 top-[-2px] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#ead7af]" />
      </motion.span>

      <motion.span
        animate={{
          rotate: -360,
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute inset-[18%] rotate-45 rounded-full border border-[#d1b477]/18"
      />
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="27"
      height="27"
      viewBox="0 0 30 30"
      fill="none"
      aria-hidden="true"
    >
      <motion.path
        d="M7 15.5L12.3 20.5L23 9.5"
        stroke="#D8BE88"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{
          pathLength: 0,
          opacity: 0,
        }}
        animate={{
          pathLength: 1,
          opacity: 1,
        }}
        transition={{
          delay: 0.45,
          duration: 1.1,
          ease: [0.22, 1, 0.36, 1],
        }}
      />
    </svg>
  );
}
