"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { AnimatePresence, motion } from "framer-motion";

import {
  Instrument_Sans,
  IBM_Plex_Mono,
} from "next/font/google";

import { supabase } from "@/lib/supabaseClient";

// ============================================================================
// CONFIGURATION
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
  DESTINATION_REVEALED: "destination_revealed",
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
  STAGES.DESTINATION_REVEALED,
  STAGES.SELECTING,
  STAGES.PASSENGER_SELECTED,
  STAGES.WINNER_REVEALED,
  STAGES.CLOSING,
];

const STAGE_CONTENT = {
  initial: {
    eyebrow: "Secret Destination Experience",
    primary: "Final Boarding",
    secondary: "Procedure",
    description:
      "The final chapter of today's journey is ready to begin.",
    status: "Awaiting Ground Operations",
    progress: 0,
  },

  manifest_loading: {
    eyebrow: "Passenger Manifest",
    primary: "Manifest",
    secondary: "Loading",
    description:
      "Retrieving eligible passengers from secured check-in records.",
    status: "Secure Data Transfer",
    progress: 12,
  },

  manifest_ready: {
    eyebrow: "Passenger Manifest",
    primary: "Manifest",
    secondary: "Received",
    description:
      "Passenger records have been transferred to Ground Operations.",
    status: "Manifest Available",
    progress: 24,
  },

  final_boarding: {
    eyebrow: "Final Boarding Procedure",
    primary: "Final",
    secondary: "Boarding",
    description:
      "Eligible passengers are entering the final departure sequence.",
    status: "Boarding in Progress",
    progress: 36,
  },

  verifying: {
    eyebrow: "Eligibility Verification",
    primary: "Manifest",
    secondary: "Verification",
    description:
      "Check-in credentials and giveaway eligibility are being confirmed.",
    status: "Verification in Progress",
    progress: 48,
  },

  verified: {
    eyebrow: "Eligibility Verification",
    primary: "Manifest",
    secondary: "Verified",
    description:
      "Passenger records have passed the final eligibility procedure.",
    status: "Verification Complete",
    progress: 58,
  },

  clearance: {
    eyebrow: "Ground Operations Clearance",
    primary: "Departure",
    secondary: "Clearance",
    description:
      "Ground Operations has authorised the Secret Destination procedure.",
    status: "Clearance Confirmed",
    progress: 68,
  },

  destination_locked: {
    eyebrow: "Secret Destination",
    primary: "Destination",
    secondary: "Locked",
    description:
      "Destination secured. Awaiting declassification clearance.",
    status: "Destination Confidential",
    progress: 78,
  },

  destination_revealed: {
    eyebrow: "Destination Declassified",
    primary: "PARIS",
    secondary: "ORLY AIRPORT",
    description:
      "The secret destination has been officially revealed.",
    status: "Destination Revealed — ORY",
    progress: 83,
  },

  selecting: {
    eyebrow: "Passenger Selection Sequence",
    primary: "Selection",
    secondary: "In Progress",
    description:
      "Processing the verified passenger manifest.",
    status: "Secure Selection Active",
    progress: 88,
  },

  passenger_selected: {
    eyebrow: "Identity Secured",
    primary: "Passenger",
    secondary: "Selected",
    description:
      "Identity secured. Awaiting public announcement clearance.",
    status: "Identity Secured",
    progress: 94,
  },

  winner_revealed: {
    eyebrow: "Passenger Cleared",
    primary: "Your Next Journey",
    secondary: "Begins Now",
    description:
      "One passenger has received clearance for the Secret Destination Experience.",
    status: "Passenger Cleared",
    progress: 100,
  },

  closing: {
    eyebrow: "OMMTo Airlines",
    primary: "One Journey Ends.",
    secondary: "Another Begins.",
    description:
      "Thank you for travelling with us through New Horizons.",
    status: "Experience Complete",
    progress: 100,
  },
};

const MOTION = {
  initial: {
    opacity: 0,
    filter: "blur(16px)",
    scale: 0.985,
  },

  animate: {
    opacity: 1,
    filter: "blur(0px)",
    scale: 1,
    transition: {
      duration: 1,
      ease: [0.22, 1, 0.36, 1],
    },
  },

  exit: {
    opacity: 0,
    filter: "blur(12px)",
    scale: 1.01,
    transition: {
      duration: 0.45,
    },
  },
};

const formatCount = (value) =>
  String(Number(value) || 0).padStart(2, "0");

// ============================================================================
// MAIN PAGE
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

  const latestExperienceRef = useRef(null);

  const stage = experience?.stage || STAGES.INITIAL;

  const safeStage = STAGE_CONTENT[stage]
    ? stage
    : STAGES.INITIAL;

  const content = STAGE_CONTENT[safeStage];

  const stageIndex = Math.max(
    0,
    STAGE_ORDER.indexOf(safeStage)
  );

  const passengerCount =
    experience?.manifest_count ?? passengers.length;

  // --------------------------------------------------------------------------
  // LOAD ALL ELIGIBLE PASSENGER REFERENCES
  // --------------------------------------------------------------------------

  const loadPassengers = useCallback(async () => {
    try {
      const allPassengers = [];
      const pageSize = 500;

      let from = 0;

      while (true) {
        const { data, error } = await supabase
          .from("participants")
          .select(
            "id,ticket_code,flight,seat,gate,created_at"
          )
          .eq("giveaway_eligible", true)
          .not("ticket_code", "is", null)
          .order("created_at", {
            ascending: true,
          })
          .order("id", {
            ascending: true,
          })
          .range(from, from + pageSize - 1);

        if (error) {
          throw error;
        }

        const batch = data || [];

        allPassengers.push(...batch);

        if (batch.length < pageSize) {
          break;
        }

        from += pageSize;
      }

      const validPassengers = allPassengers.filter(
        (passenger) =>
          typeof passenger.ticket_code === "string" &&
          passenger.ticket_code.trim() !== ""
      );

      setPassengers(validPassengers);
    } catch (error) {
      console.error(
        "Passenger loading error:",
        error
      );

      setErrorMessage(
        "Unable to retrieve passenger references."
      );
    }
  }, []);

  // --------------------------------------------------------------------------
  // LOAD SELECTED PASSENGER
  // --------------------------------------------------------------------------

  const loadSelectedPassenger = useCallback(
    async (passengerId) => {
      if (passengerId == null) {
        setSelectedPassenger(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("participants")
          .select(
            "id,full_name,ticket_code,flight,seat,gate,terminal"
          )
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

        setSelectedPassenger(null);
      }
    },
    []
  );

  // --------------------------------------------------------------------------
  // APPLY EXPERIENCE STATE
  // --------------------------------------------------------------------------

  const applyExperienceState = useCallback(
    (nextExperience) => {
      if (!nextExperience) {
        return;
      }

      const previous = latestExperienceRef.current;

      // Ignore stale events when timestamps are available.
      if (
        previous?.updated_at &&
        nextExperience.updated_at &&
        new Date(nextExperience.updated_at).getTime() <
          new Date(previous.updated_at).getTime()
      ) {
        return;
      }

      latestExperienceRef.current = nextExperience;

      setExperience(nextExperience);
    },
    []
  );

  // --------------------------------------------------------------------------
  // FETCH EXPERIENCE
  // --------------------------------------------------------------------------

  const refreshExperience = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("giveaway_experience")
        .select("*")
        .eq("id", EXPERIENCE_ID)
        .single();

      if (error) {
        throw error;
      }

      applyExperienceState(data);

      setErrorMessage("");
    } catch (error) {
      console.error(
        "Experience synchronization error:",
        error
      );

      setErrorMessage(
        "Experience synchronization unavailable."
      );
    } finally {
      setIsLoading(false);
    }
  }, [applyExperienceState]);

  // --------------------------------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------------------------------

  useEffect(() => {
    refreshExperience();
    loadPassengers();
  }, [refreshExperience, loadPassengers]);

  // --------------------------------------------------------------------------
  // LOAD WINNER ONLY WHEN REVEAL IS AUTHORISED
  // --------------------------------------------------------------------------

  useEffect(() => {
    const revealAllowed = [
      STAGES.WINNER_REVEALED,
      STAGES.CLOSING,
    ].includes(safeStage);

    if (
      revealAllowed &&
      experience?.selected_passenger_id != null
    ) {
      loadSelectedPassenger(
        experience.selected_passenger_id
      );
    } else {
      setSelectedPassenger(null);
    }
  }, [
    safeStage,
    experience?.selected_passenger_id,
    loadSelectedPassenger,
  ]);

  // --------------------------------------------------------------------------
  // REALTIME SUBSCRIPTION
  // --------------------------------------------------------------------------

  useEffect(() => {
    const channel = supabase
      .channel("ommt-public-display")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "giveaway_experience",
          filter: `id=eq.${EXPERIENCE_ID}`,
        },
        (payload) => {
          if (payload.new) {
            applyExperienceState(payload.new);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setConnectionStatus("connected");
          refreshExperience();
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
  }, [applyExperienceState, refreshExperience]);

  // --------------------------------------------------------------------------
  // FALLBACK SYNCHRONIZATION
  // --------------------------------------------------------------------------

  useEffect(() => {
    const interval = window.setInterval(() => {
      refreshExperience();
    }, 2500);

    return () => {
      window.clearInterval(interval);
    };
  }, [refreshExperience]);

  // --------------------------------------------------------------------------
  // REFRESH WHEN WINDOW BECOMES ACTIVE
  // --------------------------------------------------------------------------

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") {
        refreshExperience();
      }
    };

    document.addEventListener(
      "visibilitychange",
      refresh
    );

    window.addEventListener("focus", refresh);

    return () => {
      document.removeEventListener(
        "visibilitychange",
        refresh
      );

      window.removeEventListener("focus", refresh);
    };
  }, [refreshExperience]);

  // --------------------------------------------------------------------------
  // LOADING
  // --------------------------------------------------------------------------

  if (isLoading && !experience) {
    return <LoadingScreen />;
  }

  return (
    <main
      className={`${instrumentSans.variable} ${ibmPlexMono.variable} relative min-h-screen overflow-hidden bg-[#020711] font-[var(--font-instrument-sans)] text-[#f4f1ea]`}
    >
      <AtmosphericBackground stage={safeStage} />

      <div className="relative z-20 flex min-h-screen flex-col">
        <PublicHeader
          stage={safeStage}
          stageIndex={stageIndex}
          passengerCount={passengerCount}
          connectionStatus={connectionStatus}
        />

        <div className="flex flex-1 items-center justify-center px-5 pb-24 pt-28 sm:px-9 lg:px-14">
          <div className="mx-auto w-full max-w-[1680px]">
            <AnimatePresence mode="wait">
              <ExperienceStage
                key={safeStage}
                stage={safeStage}
                content={content}
                passengers={passengers}
                passengerCount={passengerCount}
                selectedPassenger={selectedPassenger}
                errorMessage={errorMessage}
              />
            </AnimatePresence>
          </div>
        </div>

        <BrandSignature
          stage={safeStage}
          status={content.status}
          progress={content.progress}
        />
      </div>
    </main>
  );
}

// ============================================================================
// STAGE ROUTER
// ============================================================================

function ExperienceStage({
  stage,
  content,
  passengers,
  passengerCount,
  selectedPassenger,
  errorMessage,
}) {
  switch (stage) {
    case STAGES.DESTINATION_REVEALED:
      return <DestinationRevealStage />;

    case STAGES.SELECTING:
      return (
        <PassengerSelectionStage
          content={content}
          passengers={passengers}
          passengerCount={passengerCount}
        />
      );

    case STAGES.PASSENGER_SELECTED:
      return <PassengerSelectedStage />;

    case STAGES.WINNER_REVEALED:
      return (
        <WinnerRevealStage
          passenger={selectedPassenger}
        />
      );

    case STAGES.CLOSING:
      return <ClosingStage />;

    default:
      return (
        <OperationsStage
          content={content}
          passengerCount={passengerCount}
          errorMessage={errorMessage}
        />
      );
  }
}

// ============================================================================
// STANDARD OPERATIONS
// ============================================================================

function OperationsStage({
  content,
  passengerCount,
  errorMessage,
}) {
  return (
    <motion.section
      {...MOTION}
      className="relative flex min-h-[650px] items-center justify-center"
    >
      <div className="flex w-full flex-col items-center text-center">
        <p className="text-[10px] uppercase tracking-[0.45em] text-[#d1b77f]">
          {content.eyebrow}
        </p>

        <h1 className="mt-9 text-[clamp(3.5rem,9vw,10rem)] font-[300] leading-[0.87] tracking-[-0.04em]">
          {content.primary}

          <span className="block text-white/60">
            {content.secondary}
          </span>
        </h1>

        <p className="mt-10 max-w-2xl text-sm font-light leading-8 text-white/40">
          {content.description}
        </p>

        <div className="mt-14 border-t border-white/10 px-16 pt-8">
          <p className="text-[9px] uppercase tracking-[0.35em] text-white/30">
            Passenger Manifest
          </p>

          <p className="mt-5 font-[var(--font-ibm-plex-mono)] text-5xl font-light text-[#e5dccb]">
            {formatCount(passengerCount)}
          </p>
        </div>

        {errorMessage && (
          <p className="mt-8 text-xs text-red-200/60">
            {errorMessage}
          </p>
        )}
      </div>
    </motion.section>
  );
}

// ============================================================================
// DESTINATION REVEAL
// ============================================================================

function DestinationRevealStage() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1500),
      setTimeout(() => setPhase(2), 3000),
      setTimeout(() => setPhase(3), 4500),
      setTimeout(() => setPhase(4), 6000),
      setTimeout(() => setPhase(5), 7500),
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <motion.section
      {...MOTION}
      className="relative flex min-h-[700px] items-center justify-center overflow-hidden"
    >
      <Radar />

      <div className="relative z-10 flex w-full flex-col items-center text-center">
        <AnimatePresence mode="wait">
          {phase < 3 ? (
            <motion.div
              key={`signal-${phase}`}
              initial={{
                opacity: 0,
                y: 25,
                filter: "blur(12px)",
              }}
              animate={{
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
              }}
              exit={{
                opacity: 0,
                y: -20,
              }}
              className="flex flex-col items-center"
            >
              <OrbitMark large />

              <p className="mt-12 text-[10px] uppercase tracking-[0.4em] text-[#d1b77f]">
                Destination Declassification
              </p>

              <h1 className="mt-8 text-[clamp(3rem,7vw,7rem)] font-light tracking-[-0.04em]">
                {phase === 0
                  ? "Signal Acquired"
                  : phase === 1
                    ? "Coordinates Verified"
                    : "Destination Clearance"}
              </h1>

              <p className="mt-8 font-[var(--font-ibm-plex-mono)] text-xs tracking-[0.2em] text-white/30">
                {phase === 0
                  ? "ESTABLISHING SECURE CONNECTION"
                  : phase === 1
                    ? "48.7292° N · 2.3597° E"
                    : "DESTINATION READY FOR RELEASE"}
              </p>

              <div className="mt-10">
                <ProcessingIndicator />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="paris"
              initial={{
                opacity: 0,
                scale: 0.94,
                filter: "blur(20px)",
              }}
              animate={{
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
              }}
              transition={{
                duration: 1.5,
              }}
              className="flex flex-col items-center"
            >
              <p className="text-[11px] uppercase tracking-[0.5em] text-[#d1b77f]">
                Destination Declassified
              </p>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.3 }}
                className="mt-9 h-px w-72 bg-gradient-to-r from-transparent via-[#d8be88] to-transparent"
              />

              <h1 className="mt-12 text-[clamp(6rem,16vw,16rem)] font-[300] leading-[0.85] tracking-[-0.06em]">
                PARIS
              </h1>

              {phase >= 4 && (
                <motion.div
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1 }}
                  className="mt-12"
                >
                  <p className="text-2xl font-light uppercase tracking-[0.35em] text-[#e4d5b8]">
                    ORLY AIRPORT
                  </p>

                  <p className="mt-6 font-[var(--font-ibm-plex-mono)] text-sm tracking-[0.4em] text-white/40">
                    ORY · FRANCE
                  </p>
                </motion.div>
              )}

              {phase >= 5 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-14 text-[10px] uppercase tracking-[0.35em] text-[#d1b77f]/60"
                >
                  Your Secret Destination Has Been Revealed
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

// ============================================================================
// PASSENGER SELECTION
// VISUAL ANIMATION ONLY — NO WINNER SELECTION
// ============================================================================

function PassengerSelectionStage({
  content,
  passengers,
  passengerCount,
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const lastIndexRef = useRef(-1);

  const validPassengers = useMemo(
    () =>
      passengers.filter(
        (passenger) =>
          typeof passenger.ticket_code === "string" &&
          passenger.ticket_code.trim() !== ""
      ),
    [passengers]
  );

  useEffect(() => {
    if (!validPassengers.length) {
      return;
    }

    const interval = window.setInterval(() => {
      const count = validPassengers.length;

      if (count === 1) {
        setActiveIndex(0);
        return;
      }

      // Avoid repeating the same ticket consecutively.
      let nextIndex = Math.floor(Math.random() * count);

      if (nextIndex === lastIndexRef.current) {
        nextIndex = (nextIndex + 1) % count;
      }

      lastIndexRef.current = nextIndex;

      setActiveIndex(nextIndex);
    }, 130);

    return () => {
      window.clearInterval(interval);
    };
  }, [validPassengers]);

  const passenger =
    validPassengers.length > 0
      ? validPassengers[activeIndex % validPassengers.length]
      : null;

  const ticket =
    passenger?.ticket_code || "AV-••••••";

  const flight =
    passenger?.flight || "OM 1025";

  const seat =
    passenger?.seat || "—";

  const gate =
    passenger?.gate || "—";

  return (
    <motion.section
      {...MOTION}
      className="relative flex min-h-[680px] items-center justify-center"
    >
      <StageCoordinates />

      <div className="relative z-10 flex w-full max-w-[1420px] flex-col items-center px-4 text-center">
        <p className="text-[10px] uppercase tracking-[0.44em] text-[#cbb07c]">
          {content.eyebrow}
        </p>

        <h1 className="mt-8 text-[clamp(3.8rem,9vw,10rem)] font-[300] leading-[0.86] tracking-[-0.04em]">
          Selection

          <span className="block text-white/60">
            In Progress
          </span>
        </h1>

        <div className="relative mt-16 w-full max-w-5xl overflow-hidden border-y border-white/[0.08] py-10">
          <motion.div
            className="pointer-events-none absolute inset-y-0 w-[34%] bg-gradient-to-r from-transparent via-[#d0b276]/[0.09] to-transparent"
            animate={{
              x: ["-140%", "390%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          <div className="relative grid grid-cols-2 gap-6 sm:grid-cols-4">
            <AnimatedSelectionMetric
              label="Ticket"
              value={ticket}
            />

            <AnimatedSelectionMetric
              label="Flight"
              value={flight}
            />

            <AnimatedSelectionMetric
              label="Seat"
              value={seat}
            />

            <AnimatedSelectionMetric
              label="Gate"
              value={gate}
            />
          </div>
        </div>

        <div className="mt-11 flex items-center gap-4">
          <ProcessingIndicator />

          <span className="text-[9px] uppercase tracking-[0.34em] text-white/35">
            Processing {formatCount(passengerCount)} verified records
          </span>
        </div>

        <p className="mt-7 font-[var(--font-ibm-plex-mono)] text-[8px] uppercase tracking-[0.3em] text-[#cbb07c]/35">
          Secure selection sequence active
        </p>
      </div>
    </motion.section>
  );
}

function AnimatedSelectionMetric({
  label,
  value,
}) {
  return (
    <div className="min-w-0">
      <p className="text-[8px] uppercase tracking-[0.34em] text-white/25">
        {label}
      </p>

      <div className="mt-4 h-7 overflow-hidden">
        <AnimatePresence mode="sync">
          <motion.p
            key={`${label}-${value}`}
            initial={{
              opacity: 0,
              y: 9,
              filter: "blur(4px)",
            }}
            animate={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
            }}
            exit={{
              opacity: 0,
              y: -9,
              filter: "blur(4px)",
            }}
            transition={{
              duration: 0.1,
            }}
            className="truncate font-[var(--font-ibm-plex-mono)] text-sm tracking-[0.12em] text-[#dfcfaf]/80 sm:text-lg"
          >
            {value}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================================
// PASSENGER SELECTED
// ============================================================================

function PassengerSelectedStage() {
  return (
    <motion.section
      {...MOTION}
      className="relative flex min-h-[680px] items-center justify-center"
    >
      <StageCoordinates />

      <div className="flex flex-col items-center px-4 text-center">
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.5,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 1,
          }}
          className="mb-12 flex h-24 w-24 items-center justify-center rounded-full border border-[#c8aa70]/30"
        >
          <CheckIcon />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-[11px] uppercase tracking-[0.45em] text-[#cbb07c]"
        >
          Identity Secured
        </motion.p>

        <motion.h1
          initial={{
            opacity: 0,
            y: 40,
            filter: "blur(15px)",
          }}
          animate={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
          }}
          transition={{
            delay: 0.5,
            duration: 1.3,
          }}
          className="mt-9 text-[clamp(4rem,10vw,11rem)] font-[300] leading-[0.85] tracking-[-0.04em]"
        >
          Passenger

          <span className="block text-white/60">
            Selected
          </span>
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            delay: 1,
            duration: 1.3,
          }}
          className="mt-12 h-px w-80 bg-gradient-to-r from-transparent via-[#c8aa70] to-transparent"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-10 text-[10px] uppercase tracking-[0.35em] text-white/35"
        >
          Awaiting Public Reveal Clearance
        </motion.p>
      </div>
    </motion.section>
  );
}

// ============================================================================
// WINNER REVEAL
// ============================================================================

function WinnerRevealStage({ passenger }) {
  return (
    <motion.section
      {...MOTION}
      className="relative flex min-h-[720px] items-center justify-center"
    >
      <StageCoordinates />

      <div className="flex w-full max-w-[1500px] flex-col items-center px-4 text-center">
        <OrbitMark large />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-[11px] uppercase tracking-[0.48em] text-[#d0b57d]"
        >
          Passenger Cleared
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-9 font-[var(--font-ibm-plex-mono)] text-sm tracking-[0.3em] text-white/40"
        >
          {passenger?.ticket_code || "AV-••••••"}
        </motion.p>

        <motion.h1
          initial={{
            opacity: 0,
            y: 45,
            filter: "blur(18px)",
          }}
          animate={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
          }}
          transition={{
            delay: 1.1,
            duration: 1.5,
          }}
          className="mt-9 max-w-[1450px] break-words text-[clamp(3.5rem,9vw,10rem)] font-[300] leading-[0.9] tracking-[-0.045em]"
        >
          {passenger?.full_name || "Selected Passenger"}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className="mt-12 flex flex-wrap justify-center gap-10"
        >
          <WinnerMetric
            label="Flight"
            value={passenger?.flight || "OM 1025"}
          />

          <WinnerMetric
            label="Seat"
            value={passenger?.seat || "—"}
          />

          <WinnerMetric
            label="Gate"
            value={passenger?.gate || "—"}
          />

          <WinnerMetric
            label="Terminal"
            value={passenger?.terminal || "—"}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4 }}
          className="mt-16"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-[#ded1ba]/60">
            Your next journey begins now.
          </p>

          <p className="mt-6 text-2xl font-light text-[#f0e9dc]">
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
      <p className="text-[8px] uppercase tracking-[0.3em] text-white/30">
        {label}
      </p>

      <p className="mt-3 font-[var(--font-ibm-plex-mono)] text-sm tracking-[0.15em] text-[#e0cfad]/75">
        {value}
      </p>
    </div>
  );
}

// ============================================================================
// CLOSING CEREMONY
// ============================================================================

function ClosingStage() {
  return (
    <motion.section
      {...MOTION}
      className="relative flex min-h-[680px] items-center justify-center"
    >
      <div className="flex flex-col items-center px-4 text-center">
        <OrbitMark large />

        <p className="mt-12 text-[10px] uppercase tracking-[0.45em] text-[#cfb47d]">
          Secret Destination Experience
        </p>

        <h1 className="mt-10 text-[clamp(3.5rem,9vw,10rem)] font-[300] leading-[0.9] tracking-[-0.04em]">
          One Journey Ends.

          <span className="block text-white/60">
            Another Begins.
          </span>
        </h1>

        <p className="mt-12 text-sm text-white/40">
          Thank you for travelling with us through New Horizons.
        </p>

        <p className="mt-16 text-3xl font-light tracking-[-0.04em]">
          OMMTo
          <span className="text-white/40">
            ...New Horizons
          </span>
        </p>
      </div>
    </motion.section>
  );
}

// ============================================================================
// HEADER
// ============================================================================

function PublicHeader({
  stage,
  stageIndex,
  passengerCount,
  connectionStatus,
}) {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 px-6 pt-7 sm:px-10 lg:px-12">
      <div className="mx-auto flex max-w-[1680px] items-start justify-between border-b border-white/[0.06] pb-6">
        <div>
          <p className="text-xl font-light tracking-[-0.045em]">
            OMMTo
            <span className="text-white/40">
              ...New Horizons
            </span>
          </p>

          <p className="mt-4 text-[7px] uppercase tracking-[0.4em] text-[#c8aa70]/45">
            Aviation · Tourism · Innovation
          </p>
        </div>

        <div className="hidden gap-10 sm:flex">
          <HeaderMetric
            label="Sequence"
            value={`${String(stageIndex + 1).padStart(
              2,
              "0"
            )} / ${STAGE_ORDER.length}`}
          />

          <HeaderMetric
            label="Manifest"
            value={formatCount(passengerCount)}
          />

          <HeaderMetric
            label="Status"
            value={
              stage === STAGES.CLOSING
                ? "COMPLETE"
                : "ACTIVE"
            }
          />

          <HeaderMetric
            label="Signal"
            value={
              connectionStatus === "connected"
                ? "LIVE"
                : "SYNC"
            }
          />
        </div>
      </div>
    </header>
  );
}

function HeaderMetric({ label, value }) {
  return (
    <div className="text-right">
      <p className="text-[7px] uppercase tracking-[0.3em] text-white/20">
        {label}
      </p>

      <p className="mt-3 font-[var(--font-ibm-plex-mono)] text-[9px] tracking-[0.15em] text-white/50">
        {value}
      </p>
    </div>
  );
}

// ============================================================================
// FOOTER
// ============================================================================

function BrandSignature({
  stage,
  status,
  progress,
}) {
  const destinationRevealed =
    STAGE_ORDER.indexOf(stage) >=
    STAGE_ORDER.indexOf(STAGES.DESTINATION_REVEALED);

  return (
    <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-30 px-6 pb-8 sm:px-10 lg:px-12">
      <div className="mx-auto grid max-w-[1680px] items-end gap-8 border-t border-white/[0.06] pt-6 sm:grid-cols-3">
        <div className="hidden sm:block">
          <p className="text-[7px] uppercase tracking-[0.35em] text-white/20">
            Marketing Made in Greece — On Air
          </p>

          <p className="mt-3 font-[var(--font-ibm-plex-mono)] text-[8px] text-white/15">
            PHILOXENIA 2026
          </p>
        </div>

        <div>
          <div className="flex justify-between">
            <div>
              <p className="text-[7px] uppercase tracking-[0.3em] text-white/20">
                Flight Sequence
              </p>

              <p className="mt-3 text-[8px] uppercase tracking-[0.25em] text-white/40">
                {status}
              </p>
            </div>

            <p className="font-[var(--font-ibm-plex-mono)] text-[9px] text-[#d2b77f]/65">
              {progress}%
            </p>
          </div>

          <div className="mt-5 h-px bg-white/10">
            <motion.div
              animate={{
                width: `${progress}%`,
              }}
              transition={{
                duration: 1,
              }}
              className="h-px bg-gradient-to-r from-[#7e633a] via-[#c8aa70] to-[#e3cd9c]"
            />
          </div>
        </div>

        <div className="hidden text-right sm:block">
          <p className="text-[7px] uppercase tracking-[0.3em] text-white/20">
            Mission Status
          </p>

          <p className="mt-3 font-[var(--font-ibm-plex-mono)] text-[8px] tracking-[0.15em] text-white/35">
            {stage === STAGES.CLOSING
              ? "JOURNEY COMPLETE"
              : destinationRevealed
                ? "DESTINATION REVEALED · ORY"
                : "DESTINATION CONFIDENTIAL"}
          </p>
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// BACKGROUND
// ============================================================================

function AtmosphericBackground({ stage }) {
  const isSelection = stage === STAGES.SELECTING;

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#06111f_0%,#020812_58%,#01040a_100%)]" />

      <motion.div
        animate={{
          opacity: isSelection ? 0.45 : 0.25,
          scale: isSelection ? 1.1 : 1,
        }}
        transition={{
          duration: 2,
        }}
        className="absolute left-1/2 top-[-30%] h-[95%] w-[75%] -translate-x-1/2 rounded-full bg-[#174474]/40 blur-[170px]"
      />

      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.33) 1px, transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.33) 1px,transparent 1px)",
          backgroundSize: "74px 74px",
        }}
      />

      <motion.div
        animate={{
          x: ["-40%", "160%"],
          opacity: [0, 0.15, 0],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          repeatDelay: 3,
          ease: "linear",
        }}
        className="absolute top-[20%] h-px w-[32%] bg-gradient-to-r from-transparent via-[#d7bc83]/70 to-transparent"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_28%,rgba(0,0,0,0.68)_100%)]" />
    </div>
  );
}

// ============================================================================
// RADAR
// ============================================================================

function Radar() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.18 }}
      className="pointer-events-none absolute left-1/2 top-1/2 h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#c8aa70]/20"
    >
      <div className="absolute inset-[15%] rounded-full border border-[#c8aa70]/15" />

      <div className="absolute inset-[30%] rounded-full border border-[#c8aa70]/15" />

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
            "conic-gradient(from 0deg,transparent 0deg,transparent 315deg,rgba(200,170,112,0.18) 350deg,transparent 360deg)",
        }}
      />
    </motion.div>
  );
}

// ============================================================================
// STAGE COORDINATES
// ============================================================================

function StageCoordinates() {
  return (
    <>
      <div className="absolute left-0 top-1/2 hidden -translate-y-1/2 items-center gap-3 lg:flex">
        <span className="font-[var(--font-ibm-plex-mono)] text-[8px] text-white/15">
          40.6401° N
        </span>

        <span className="h-px w-12 bg-white/10" />
      </div>

      <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 items-center gap-3 lg:flex">
        <span className="h-px w-12 bg-white/10" />

        <span className="font-[var(--font-ibm-plex-mono)] text-[8px] text-white/15">
          22.9444° E
        </span>
      </div>
    </>
  );
}

// ============================================================================
// PROCESSING INDICATOR
// ============================================================================

function ProcessingIndicator() {
  return (
    <span className="flex items-center gap-2">
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.75, 1.15, 0.75],
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            delay: index * 0.2,
          }}
          className="h-1.5 w-1.5 rounded-full bg-[#c9ab70]"
        />
      ))}
    </span>
  );
}

// ============================================================================
// ORBIT MARK
// ============================================================================

function OrbitMark({ large = false }) {
  const size = large
    ? "h-24 w-24"
    : "h-14 w-14";

  return (
    <div className={`relative ${size}`}>
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
        className="absolute inset-[18%] rounded-full border border-[#d1b477]/20"
      />
    </div>
  );
}

// ============================================================================
// CHECK ICON
// ============================================================================

function CheckIcon() {
  return (
    <svg
      width="35"
      height="35"
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
          delay: 0.5,
          duration: 1.1,
        }}
      />
    </svg>
  );
}

// ============================================================================
// LOADING SCREEN
// ============================================================================

function LoadingScreen() {
  return (
    <main
      className={`${instrumentSans.variable} ${ibmPlexMono.variable} flex min-h-screen items-center justify-center bg-[#020711] font-[var(--font-instrument-sans)] text-[#f4f1ea]`}
    >
      <div className="flex flex-col items-center text-center">
        <OrbitMark large />

        <p className="mt-12 text-[10px] uppercase tracking-[0.4em] text-[#cbb07c]">
          Secret Destination Experience
        </p>

        <div className="mt-8 flex items-center gap-4">
          <ProcessingIndicator />

          <p className="text-[9px] uppercase tracking-[0.3em] text-white/35">
            Establishing Live Connection
          </p>
        </div>
      </div>
    </main>
  );
}
