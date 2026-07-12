"use client";

// ============================================================
// SECTION 1 — Imports
// ============================================================

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";


// ============================================================
// SECTION 2 — Configuration
// ============================================================

const EXPERIENCE_STAGES = {
  INITIAL: "initial",
  LOADING_MANIFEST: "loading_manifest",
  MANIFEST_READY: "manifest_ready",
  FINAL_BOARDING: "final_boarding",
  VERIFYING_MANIFEST: "verifying_manifest",
  MANIFEST_VERIFIED: "manifest_verified",
  CLEARANCE: "clearance",
  DESTINATION_LOCKED: "destination_locked",
  SELECTING_PASSENGER: "selecting_passenger",
  PASSENGER_SELECTED: "passenger_selected",
  WINNER_REVEALED: "winner_revealed",
  CLOSING: "closing",
};

const STAGE_ORDER = [
  EXPERIENCE_STAGES.INITIAL,
  EXPERIENCE_STAGES.LOADING_MANIFEST,
  EXPERIENCE_STAGES.MANIFEST_READY,
  EXPERIENCE_STAGES.FINAL_BOARDING,
  EXPERIENCE_STAGES.VERIFYING_MANIFEST,
  EXPERIENCE_STAGES.MANIFEST_VERIFIED,
  EXPERIENCE_STAGES.CLEARANCE,
  EXPERIENCE_STAGES.DESTINATION_LOCKED,
  EXPERIENCE_STAGES.SELECTING_PASSENGER,
  EXPERIENCE_STAGES.PASSENGER_SELECTED,
  EXPERIENCE_STAGES.WINNER_REVEALED,
  EXPERIENCE_STAGES.CLOSING,
];

const STAGE_METADATA = {
  [EXPERIENCE_STAGES.INITIAL]: {
    eyebrow: "Secret Destination Experience",
    title: "Final Boarding Procedure",
    description:
      "The final chapter of today’s journey is ready to begin.",
    status: "Awaiting Ground Operations",
    progress: 0,
  },

  [EXPERIENCE_STAGES.LOADING_MANIFEST]: {
    eyebrow: "Passenger Manifest",
    title: "Manifest Loading",
    description:
      "Retrieving eligible passengers from the final boarding records.",
    status: "Secure Data Transfer",
    progress: 12,
  },

  [EXPERIENCE_STAGES.MANIFEST_READY]: {
    eyebrow: "Passenger Manifest",
    title: "Manifest Received",
    description:
      "The passenger manifest has been successfully transferred to Ground Operations.",
    status: "Manifest Available",
    progress: 24,
  },

  [EXPERIENCE_STAGES.FINAL_BOARDING]: {
    eyebrow: "Final Boarding Procedure",
    title: "Final Boarding",
    description:
      "All eligible passengers are being prepared for the closing departure sequence.",
    status: "Boarding in Progress",
    progress: 36,
  },

  [EXPERIENCE_STAGES.VERIFYING_MANIFEST]: {
    eyebrow: "Eligibility Verification",
    title: "Verifying Passenger Records",
    description:
      "Check-in status, ticket credentials and giveaway eligibility are being confirmed.",
    status: "Verification in Progress",
    progress: 48,
  },

  [EXPERIENCE_STAGES.MANIFEST_VERIFIED]: {
    eyebrow: "Eligibility Verification",
    title: "Manifest Verified",
    description:
      "All passenger records have passed the final eligibility procedure.",
    status: "Verification Complete",
    progress: 58,
  },

  [EXPERIENCE_STAGES.CLEARANCE]: {
    eyebrow: "Ground Operations Clearance",
    title: "Departure Clearance",
    description:
      "Ground Operations is authorising the final Secret Destination procedure.",
    status: "Clearance Confirmed",
    progress: 68,
  },

  [EXPERIENCE_STAGES.DESTINATION_LOCKED]: {
    eyebrow: "Secret Destination",
    title: "Destination Locked",
    description:
      "The destination has been secured. Passenger selection may now begin.",
    status: "Destination Confidential",
    progress: 78,
  },

  [EXPERIENCE_STAGES.SELECTING_PASSENGER]: {
    eyebrow: "Passenger Selection Sequence",
    title: "Selecting Passenger",
    description:
      "The final passenger is being selected from the verified manifest.",
    status: "Selection in Progress",
    progress: 88,
  },

  [EXPERIENCE_STAGES.PASSENGER_SELECTED]: {
    eyebrow: "Passenger Selection Sequence",
    title: "Passenger Selected",
    description:
      "A passenger has been securely selected. Identity remains protected until final reveal.",
    status: "Identity Secured",
    progress: 94,
  },

  [EXPERIENCE_STAGES.WINNER_REVEALED]: {
    eyebrow: "Secret Destination Clearance",
    title: "Your Next Journey Begins Now",
    description:
      "The final passenger has received clearance for the Secret Destination Experience.",
    status: "Passenger Cleared",
    progress: 100,
  },

  [EXPERIENCE_STAGES.CLOSING]: {
    eyebrow: "OMMTo Airlines",
    title: "One Journey Ends. Another Begins.",
    description:
      "Thank you for travelling with us through New Horizons.",
    status: "Experience Complete",
    progress: 100,
  },
};

const MOTION = {
  screen: {
    initial: {
      opacity: 0,
      filter: "blur(10px)",
      scale: 0.985,
    },
    animate: {
      opacity: 1,
      filter: "blur(0px)",
      scale: 1,
      transition: {
        duration: 1.1,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: {
      opacity: 0,
      filter: "blur(8px)",
      scale: 1.01,
      transition: {
        duration: 0.65,
        ease: [0.4, 0, 1, 1],
      },
    },
  },

  fadeUp: {
    initial: {
      opacity: 0,
      y: 24,
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
        staggerChildren: 0.12,
      },
    },
  },
};

const SELECTION_DURATION = 7000;

const formatPassengerCount = (count) =>
  new Intl.NumberFormat("en-US", {
    minimumIntegerDigits: 2,
  }).format(count);

const getSecureRandomIndex = (arrayLength) => {
  if (!arrayLength || arrayLength < 1) {
    return null;
  }

  const randomValues = new Uint32Array(1);
  window.crypto.getRandomValues(randomValues);

  return randomValues[0] % arrayLength;
};

const wait = (milliseconds) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });


// ============================================================
// SECTION 3 — Main Giveaway Page
// ============================================================

export default function GiveawayPage() {
  const [stage, setStage] = useState(EXPERIENCE_STAGES.INITIAL);
  const [passengers, setPassengers] = useState([]);
  const [selectedPassenger, setSelectedPassenger] = useState(null);

  const [operationsOpen, setOperationsOpen] = useState(false);
  const [manifestLoadedAt, setManifestLoadedAt] = useState(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectionDisplay, setSelectionDisplay] = useState(null);

  const currentStage = STAGE_METADATA[stage];
  const currentStageIndex = STAGE_ORDER.indexOf(stage);

  const eligiblePassengerCount = passengers.length;

  const isManifestLoaded = eligiblePassengerCount > 0;

  const canSelectPassenger =
    stage === EXPERIENCE_STAGES.DESTINATION_LOCKED &&
    isManifestLoaded &&
    !isProcessing;

  const formattedManifestTime = useMemo(() => {
    if (!manifestLoadedAt) {
      return "Not loaded";
    }

    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(manifestLoadedAt);
  }, [manifestLoadedAt]);

  useEffect(() => {
    const handleKeyboardControls = (event) => {
      const pressedKey = event.key.toLowerCase();

      if (pressedKey === "o") {
        setOperationsOpen((current) => !current);
      }

      if (pressedKey === "escape") {
        setOperationsOpen(false);
      }

      if (pressedKey === "f") {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyboardControls);

    return () => {
      window.removeEventListener("keydown", handleKeyboardControls);
    };
  }, []);

  const transitionToStage = useCallback(
    async (nextStage, delay = 0) => {
      if (isProcessing) {
        return;
      }

      setErrorMessage("");

      if (delay > 0) {
        setIsProcessing(true);
        await wait(delay);
        setStage(nextStage);
        setIsProcessing(false);
        return;
      }

      setStage(nextStage);
    },
    [isProcessing]
  );

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020812] text-[#f6f0e5] selection:bg-[#c9a96e]/30">
      <AtmosphericBackground stage={stage} />

      <div className="relative z-20 flex min-h-screen flex-col">
        <PublicHeader
          stage={stage}
          currentStageIndex={currentStageIndex}
          passengerCount={eligiblePassengerCount}
        />

        <div className="flex flex-1 items-center justify-center px-5 py-20 sm:px-8 lg:px-12">
          <div className="mx-auto w-full max-w-[1500px]">
            <AnimatePresence mode="wait">
              <StageScreen
                key={stage}
                stage={stage}
                metadata={currentStage}
                passengerCount={eligiblePassengerCount}
                selectedPassenger={selectedPassenger}
                selectionDisplay={selectionDisplay}
                errorMessage={errorMessage}
              />
            </AnimatePresence>
          </div>
        </div>

        <BrandSignature
          stage={stage}
          status={currentStage.status}
          progress={currentStage.progress}
        />
      </div>

      <OperationsControls
        isOpen={operationsOpen}
        setIsOpen={setOperationsOpen}
        stage={stage}
        currentStageIndex={currentStageIndex}
        passengers={passengers}
        passengerCount={eligiblePassengerCount}
        manifestLoadedAt={formattedManifestTime}
        selectedPassenger={selectedPassenger}
        isManifestLoaded={isManifestLoaded}
        isProcessing={isProcessing}
        canSelectPassenger={canSelectPassenger}
        errorMessage={errorMessage}
        onLoadManifest={() =>
          loadPassengerManifest({
            setStage,
            setPassengers,
            setManifestLoadedAt,
            setSelectedPassenger,
            setSelectionDisplay,
            setErrorMessage,
            setIsProcessing,
          })
        }
        onBeginBoarding={() =>
          transitionToStage(EXPERIENCE_STAGES.FINAL_BOARDING)
        }
        onVerifyManifest={() =>
          verifyPassengerManifest({
            passengers,
            setPassengers,
            setStage,
            setErrorMessage,
            setIsProcessing,
          })
        }
        onGroundClearance={() =>
          transitionToStage(EXPERIENCE_STAGES.CLEARANCE)
        }
        onLockDestination={() =>
          transitionToStage(EXPERIENCE_STAGES.DESTINATION_LOCKED)
        }
        onSelectPassenger={() =>
          runPassengerSelection({
            passengers,
            setStage,
            setSelectedPassenger,
            setSelectionDisplay,
            setErrorMessage,
            setIsProcessing,
          })
        }
        onRevealWinner={() =>
          transitionToStage(EXPERIENCE_STAGES.WINNER_REVEALED)
        }
        onClosing={() =>
          transitionToStage(EXPERIENCE_STAGES.CLOSING)
        }
        onReset={() =>
          resetExperience({
            setStage,
            setPassengers,
            setSelectedPassenger,
            setSelectionDisplay,
            setManifestLoadedAt,
            setErrorMessage,
            setIsProcessing,
          })
        }
        onFullscreen={toggleFullscreen}
      />
    </main>
  );
}


// ============================================================
// SECTION 4 — Supabase Passenger Manifest
// ============================================================

async function loadPassengerManifest({
  setStage,
  setPassengers,
  setManifestLoadedAt,
  setSelectedPassenger,
  setSelectionDisplay,
  setErrorMessage,
  setIsProcessing,
}) {
  setIsProcessing(true);
  setErrorMessage("");
  setSelectedPassenger(null);
  setSelectionDisplay(null);
  setStage(EXPERIENCE_STAGES.LOADING_MANIFEST);

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
  .eq("giveaway_eligible", true)
  .not("ticket_code", "is", null)
  .not("full_name", "is", null)
  .order("created_at", {
    ascending: true,
  });

    if (error) {
      throw error;
    }

    const validPassengers = (data || []).filter(
      (passenger) =>
        passenger.id &&
        passenger.full_name &&
        passenger.ticket_code
    );

    if (validPassengers.length === 0) {
      throw new Error(
        "No eligible checked-in passengers were found in the manifest."
      );
    }

    setPassengers(validPassengers);
    setManifestLoadedAt(new Date());

    await wait(1400);

    setStage(EXPERIENCE_STAGES.MANIFEST_READY);
  } catch (error) {
    console.error("Manifest loading error:", error);

    setPassengers([]);
    setErrorMessage(
      error?.message ||
        "The passenger manifest could not be loaded."
    );

    setStage(EXPERIENCE_STAGES.INITIAL);
  } finally {
    setIsProcessing(false);
  }
}

async function verifyPassengerManifest({
  passengers,
  setPassengers,
  setStage,
  setErrorMessage,
  setIsProcessing,
}) {
  if (!passengers.length) {
    setErrorMessage(
      "Load the passenger manifest before beginning verification."
    );
    return;
  }

  setIsProcessing(true);
  setErrorMessage("");
  setStage(EXPERIENCE_STAGES.VERIFYING_MANIFEST);

  try {
    await wait(2200);

    const verifiedPassengers = passengers.filter(
      (passenger) =>
        passenger.giveaway_eligible === true &&
        passenger.id &&
        passenger.full_name &&
        passenger.ticket_code &&
        passenger.status
    );

    if (verifiedPassengers.length === 0) {
      throw new Error(
        "No passenger records passed the eligibility verification."
      );
    }

    setPassengers(verifiedPassengers);
    setStage(EXPERIENCE_STAGES.MANIFEST_VERIFIED);
  } catch (error) {
    console.error("Manifest verification error:", error);

    setErrorMessage(
      error?.message ||
        "Passenger manifest verification could not be completed."
    );

    setStage(EXPERIENCE_STAGES.MANIFEST_READY);
  } finally {
    setIsProcessing(false);
  }
}


// ============================================================
// SECTION 5 — Experience State Machine
// ============================================================

async function runPassengerSelection({
  passengers,
  setStage,
  setSelectedPassenger,
  setSelectionDisplay,
  setErrorMessage,
  setIsProcessing,
}) {
  if (!passengers.length) {
    setErrorMessage(
      "The verified passenger manifest is empty."
    );
    return;
  }

  setIsProcessing(true);
  setErrorMessage("");
  setSelectedPassenger(null);
  setStage(EXPERIENCE_STAGES.SELECTING_PASSENGER);

  let selectionInterval;

  try {
    selectionInterval = window.setInterval(() => {
      const temporaryIndex = getSecureRandomIndex(passengers.length);

      if (temporaryIndex !== null) {
        setSelectionDisplay(passengers[temporaryIndex]);
      }
    }, 110);

    await wait(SELECTION_DURATION);

    window.clearInterval(selectionInterval);

    const winnerIndex = getSecureRandomIndex(passengers.length);

    if (winnerIndex === null) {
      throw new Error(
        "A passenger could not be selected from the manifest."
      );
    }

    const winner = passengers[winnerIndex];

    setSelectionDisplay(winner);

    /*
     * Reset any previously selected winner.
     * This assumes only one active giveaway ceremony
     * is being operated at a time.
     */
    const { error: resetWinnerError } = await supabase
      .from("participants")
      .update({
        giveaway_winner: false,
        giveaway_selected_at: null,
      })
      .eq("giveaway_winner", true);

    if (resetWinnerError) {
      throw resetWinnerError;
    }

    const selectedAt = new Date().toISOString();

    const { data: savedWinner, error: winnerUpdateError } =
      await supabase
        .from("participants")
        .update({
          giveaway_winner: true,
          giveaway_selected_at: selectedAt,
        })
        .eq("id", winner.id)
        .eq("giveaway_eligible", true)
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
        .single();

    if (winnerUpdateError) {
      throw winnerUpdateError;
    }

    setSelectedPassenger(savedWinner || winner);

    await wait(900);

    setStage(EXPERIENCE_STAGES.PASSENGER_SELECTED);
  } catch (error) {
    if (selectionInterval) {
      window.clearInterval(selectionInterval);
    }

    console.error("Passenger selection error:", error);

    setSelectionDisplay(null);
    setErrorMessage(
      error?.message ||
        "The passenger selection sequence could not be completed."
    );

    setStage(EXPERIENCE_STAGES.DESTINATION_LOCKED);
  } finally {
    setIsProcessing(false);
  }
}

function resetExperience({
  setStage,
  setPassengers,
  setSelectedPassenger,
  setSelectionDisplay,
  setManifestLoadedAt,
  setErrorMessage,
  setIsProcessing,
}) {
  setStage(EXPERIENCE_STAGES.INITIAL);
  setPassengers([]);
  setSelectedPassenger(null);
  setSelectionDisplay(null);
  setManifestLoadedAt(null);
  setErrorMessage("");
  setIsProcessing(false);
}


// ============================================================
// SECTION 6 — Stage Screens
// ============================================================

function StageScreen({
  stage,
  metadata,
  passengerCount,
  selectedPassenger,
  selectionDisplay,
  errorMessage,
}) {
  if (stage === EXPERIENCE_STAGES.SELECTING_PASSENGER) {
    return (
      <PassengerSelectionScreen
        metadata={metadata}
        passenger={selectionDisplay}
        passengerCount={passengerCount}
      />
    );
  }

  if (stage === EXPERIENCE_STAGES.PASSENGER_SELECTED) {
    return (
      <PassengerSelectedScreen metadata={metadata} />
    );
  }

  if (stage === EXPERIENCE_STAGES.WINNER_REVEALED) {
    return (
      <WinnerReveal
        metadata={metadata}
        passenger={selectedPassenger}
      />
    );
  }

  if (stage === EXPERIENCE_STAGES.CLOSING) {
    return <ClosingScreen metadata={metadata} />;
  }

  return (
    <DefaultStageScreen
      stage={stage}
      metadata={metadata}
      passengerCount={passengerCount}
      errorMessage={errorMessage}
    />
  );
}

function DefaultStageScreen({
  stage,
  metadata,
  passengerCount,
  errorMessage,
}) {
  const showManifestCount = [
    EXPERIENCE_STAGES.MANIFEST_READY,
    EXPERIENCE_STAGES.FINAL_BOARDING,
    EXPERIENCE_STAGES.VERIFYING_MANIFEST,
    EXPERIENCE_STAGES.MANIFEST_VERIFIED,
    EXPERIENCE_STAGES.CLEARANCE,
    EXPERIENCE_STAGES.DESTINATION_LOCKED,
  ].includes(stage);

  const isProcessingStage = [
    EXPERIENCE_STAGES.LOADING_MANIFEST,
    EXPERIENCE_STAGES.VERIFYING_MANIFEST,
    EXPERIENCE_STAGES.CLEARANCE,
  ].includes(stage);

  return (
    <motion.section
      variants={MOTION.screen}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative mx-auto flex min-h-[560px] max-w-[1220px] items-center justify-center"
    >
      <div className="absolute inset-0 rounded-[2.25rem] border border-white/[0.07] bg-white/[0.025] shadow-[0_45px_140px_rgba(0,0,0,0.42)] backdrop-blur-[3px]" />

      <div className="absolute inset-[1px] rounded-[2.2rem] bg-gradient-to-b from-white/[0.025] via-transparent to-[#b89355]/[0.025]" />

      <motion.div
        variants={MOTION.stagger}
        initial="initial"
        animate="animate"
        className="relative z-10 flex w-full flex-col items-center px-7 py-16 text-center sm:px-12 lg:px-20"
      >
        <motion.div
          variants={MOTION.fadeUp}
          className="mb-10 flex items-center gap-4"
        >
          <span className="h-px w-10 bg-[#c5a56b]/50 sm:w-16" />

          <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-[#cfb47f] sm:text-xs">
            {metadata.eyebrow}
          </p>

          <span className="h-px w-10 bg-[#c5a56b]/50 sm:w-16" />
        </motion.div>

        <motion.h1
          variants={MOTION.fadeUp}
          className="max-w-5xl font-serif text-[clamp(3rem,7vw,7.5rem)] font-light leading-[0.93] tracking-[-0.045em] text-[#f8f3ea]"
        >
          {metadata.title}
        </motion.h1>

        <motion.p
          variants={MOTION.fadeUp}
          className="mt-8 max-w-2xl text-sm font-light leading-7 tracking-[0.035em] text-[#d5d9de]/70 sm:text-base sm:leading-8"
        >
          {metadata.description}
        </motion.p>

        {showManifestCount && (
          <motion.div
            variants={MOTION.fadeUp}
            className="mt-14"
          >
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/35">
              Eligible passengers
            </p>

            <div className="mt-3 font-mono text-5xl font-light tracking-[-0.05em] text-[#eee5d5] sm:text-7xl">
              {formatPassengerCount(passengerCount)}
            </div>
          </motion.div>
        )}

        {isProcessingStage && (
          <motion.div
            variants={MOTION.fadeUp}
            className="mt-12 flex items-center gap-3"
          >
            <LoadingSignal />

            <span className="text-[10px] uppercase tracking-[0.28em] text-white/40">
              Procedure active
            </span>
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mt-10 max-w-xl rounded-full border border-red-300/15 bg-red-400/[0.05] px-6 py-3 text-xs tracking-[0.04em] text-red-100/70"
          >
            {errorMessage}
          </motion.div>
        )}
      </motion.div>

      <CornerReference reference="SDX / 03" />
    </motion.section>
  );
}

function PassengerSelectionScreen({
  metadata,
  passenger,
  passengerCount,
}) {
  return (
    <motion.section
      variants={MOTION.screen}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative mx-auto flex min-h-[600px] max-w-[1280px] items-center justify-center"
    >
      <div className="absolute inset-0 overflow-hidden rounded-[2.25rem] border border-[#c6a56a]/15 bg-[#06101f]/60 shadow-[0_45px_160px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <motion.div
          className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-[#d3b77f]/80 to-transparent"
          animate={{
            opacity: [0.25, 1, 0.25],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute inset-y-0 w-[45%] bg-gradient-to-r from-transparent via-white/[0.025] to-transparent"
          animate={{
            x: ["-150%", "350%"],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="relative z-10 flex w-full flex-col items-center px-7 py-16 text-center sm:px-12">
        <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-[#cfb47f] sm:text-xs">
          {metadata.eyebrow}
        </p>

        <h1 className="mt-8 font-serif text-[clamp(3.4rem,8vw,8rem)] font-light leading-[0.9] tracking-[-0.055em] text-[#faf5ed]">
          {metadata.title}
        </h1>

        <div className="mt-14 w-full max-w-3xl border-y border-white/[0.08] py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={
                passenger?.id ||
                passenger?.ticket_code ||
                "initial-selection"
              }
              initial={{
                opacity: 0,
                y: 12,
                filter: "blur(8px)",
              }}
              animate={{
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
              }}
              exit={{
                opacity: 0,
                y: -12,
                filter: "blur(8px)",
              }}
              transition={{
                duration: 0.18,
              }}
              className="flex flex-col items-center"
            >
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/35">
                Passenger reference
              </span>

              <span className="mt-4 font-mono text-2xl tracking-[0.22em] text-[#e3d2b3] sm:text-4xl">
                {passenger?.ticket_code || "AV-••••••"}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-10 flex items-center gap-4">
          <LoadingSignal />

          <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">
            {formatPassengerCount(passengerCount)} verified records
          </span>
        </div>
      </div>

      <CornerReference reference="SECURE SELECTION" />
    </motion.section>
  );
}

function PassengerSelectedScreen({ metadata }) {
  return (
    <motion.section
      variants={MOTION.screen}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative mx-auto flex min-h-[590px] max-w-[1240px] items-center justify-center"
    >
      <div className="absolute inset-0 rounded-[2.25rem] border border-[#c6a56a]/20 bg-gradient-to-b from-[#0a1728]/80 to-[#030914]/85 shadow-[0_45px_160px_rgba(0,0,0,0.5)] backdrop-blur-xl" />

      <motion.div
        initial={{
          scaleX: 0,
        }}
        animate={{
          scaleX: 1,
        }}
        transition={{
          duration: 1.5,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="absolute left-[8%] right-[8%] top-1/2 h-px origin-center bg-gradient-to-r from-transparent via-[#ceb17a]/60 to-transparent"
      />

      <div className="relative z-10 flex flex-col items-center px-8 text-center">
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
            delay: 0.25,
            duration: 1.2,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mb-9 flex h-20 w-20 items-center justify-center rounded-full border border-[#d1b579]/35 bg-[#d1b579]/[0.06]"
        >
          <CheckmarkIcon />
        </motion.div>

        <motion.p
          variants={MOTION.fadeUp}
          initial="initial"
          animate="animate"
          className="text-[10px] uppercase tracking-[0.4em] text-[#cfb47f] sm:text-xs"
        >
          {metadata.eyebrow}
        </motion.p>

        <motion.h1
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.45,
            duration: 1.1,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mt-7 font-serif text-[clamp(4rem,9vw,9rem)] font-light leading-[0.88] tracking-[-0.055em] text-[#faf5ed]"
        >
          Passenger
          <br />
          Selected
        </motion.h1>

        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 1,
            duration: 1,
          }}
          className="mt-8 max-w-xl text-sm font-light leading-7 tracking-[0.04em] text-white/50"
        >
          Identity secured. Awaiting final clearance for public
          announcement.
        </motion.p>
      </div>

      <CornerReference reference="IDENTITY SECURED" />
    </motion.section>
  );
}

function ClosingScreen({ metadata }) {
  return (
    <motion.section
      variants={MOTION.screen}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative mx-auto flex min-h-[610px] max-w-[1280px] items-center justify-center"
    >
      <div className="absolute inset-0 rounded-[2.25rem] border border-white/[0.07] bg-[#07111e]/50 backdrop-blur-xl" />

      <div className="relative z-10 flex flex-col items-center px-7 text-center">
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.85,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 1.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mb-12 flex h-28 w-28 items-center justify-center rounded-full border border-[#c9a96e]/20"
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
            delay: 0.35,
            duration: 0.9,
          }}
          className="text-[10px] uppercase tracking-[0.42em] text-[#cfb47f] sm:text-xs"
        >
          Secret Destination Experience
        </motion.p>

        <motion.h1
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.55,
            duration: 1.2,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mt-8 max-w-6xl font-serif text-[clamp(3.5rem,8vw,8rem)] font-light leading-[0.92] tracking-[-0.055em] text-[#faf5ed]"
        >
          {metadata.title}
        </motion.h1>

        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 1.15,
            duration: 1,
          }}
          className="mt-10 text-sm font-light tracking-[0.08em] text-white/45 sm:text-base"
        >
          {metadata.description}
        </motion.p>

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 1.7,
            duration: 1.1,
          }}
          className="mt-16"
        >
          <p className="font-serif text-2xl font-light tracking-[-0.02em] text-[#e7ddcc] sm:text-3xl">
            OMMT
            <span className="lowercase">o</span>
            ...New Horizons
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}

function PublicHeader({
  stage,
  currentStageIndex,
  passengerCount,
}) {
  const sequenceNumber = Math.max(
    1,
    currentStageIndex + 1
  );

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between px-6 py-6 sm:px-9 sm:py-8 lg:px-12">
      <div>
        <p className="font-serif text-xl font-light tracking-[-0.02em] text-[#f4eee4] sm:text-2xl">
          OMMT
          <span className="lowercase">o</span>
          ...New Horizons
        </p>

        <p className="mt-1.5 text-[8px] uppercase tracking-[0.32em] text-white/30 sm:text-[9px]">
          Aviation · Tourism · Innovation
        </p>
      </div>

      <div className="hidden items-center gap-8 text-right sm:flex">
        <HeaderMetric
          label="Sequence"
          value={`${String(sequenceNumber).padStart(
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
            passengerCount > 0
              ? formatPassengerCount(passengerCount)
              : "—"
          }
        />

        <HeaderMetric
          label="Status"
          value={
            stage === EXPERIENCE_STAGES.CLOSING
              ? "COMPLETE"
              : "ACTIVE"
          }
        />
      </div>
    </header>
  );
}

function HeaderMetric({ label, value }) {
  return (
    <div>
      <p className="text-[8px] uppercase tracking-[0.3em] text-white/25">
        {label}
      </p>

      <p className="mt-1.5 font-mono text-[10px] tracking-[0.16em] text-white/55">
        {value}
      </p>
    </div>
  );
}

function LoadingSignal() {
  return (
    <span className="flex items-center gap-1.5">
      {[0, 1, 2].map((item) => (
        <motion.span
          key={item}
          className="h-1 w-1 rounded-full bg-[#d1b579]"
          animate={{
            opacity: [0.25, 1, 0.25],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            delay: item * 0.18,
          }}
        />
      ))}
    </span>
  );
}

function CornerReference({ reference }) {
  return (
    <div className="absolute bottom-7 right-8 hidden items-center gap-3 lg:flex">
      <span className="h-px w-8 bg-white/10" />

      <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-white/25">
        {reference}
      </span>
    </div>
  );
}


// ============================================================
// SECTION 7 — Operations Controls
// ============================================================

function OperationsControls({
  isOpen,
  setIsOpen,
  stage,
  currentStageIndex,
  passengers,
  passengerCount,
  manifestLoadedAt,
  selectedPassenger,
  isManifestLoaded,
  isProcessing,
  canSelectPassenger,
  errorMessage,
  onLoadManifest,
  onBeginBoarding,
  onVerifyManifest,
  onGroundClearance,
  onLockDestination,
  onSelectPassenger,
  onRevealWinner,
  onClosing,
  onReset,
  onFullscreen,
}) {
  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open Ground Operations"
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full border border-white/[0.08] bg-[#07111f]/80 px-4 py-3 text-[9px] uppercase tracking-[0.25em] text-white/45 shadow-2xl backdrop-blur-xl transition duration-500 hover:border-[#c6a56a]/25 hover:text-[#e2cfaa] ${
          isOpen
            ? "pointer-events-none translate-y-3 opacity-0"
            : "translate-y-0 opacity-100"
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c9a96e]/30" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#c9a96e]/70" />
        </span>

        Ground Operations
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{
              opacity: 0,
              y: 30,
              scale: 0.985,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 20,
              scale: 0.985,
            }}
            transition={{
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-h-[calc(100vh-2rem)] max-w-[1180px] overflow-y-auto rounded-[1.75rem] border border-white/[0.09] bg-[#06101d]/95 shadow-[0_30px_120px_rgba(0,0,0,0.75)] backdrop-blur-2xl sm:bottom-6 sm:left-6 sm:right-6"
          >
            <div className="border-b border-white/[0.07] px-5 py-5 sm:px-7">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-[#c9a96e]" />

                    <p className="text-[10px] uppercase tracking-[0.32em] text-[#d5bd8b]">
                      Ground Operations Console
                    </p>
                  </div>

                  <p className="mt-2 max-w-xl text-xs leading-5 text-white/35">
                    Secret Destination ceremonial controls.
                    Press O to open or close this console.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.08] text-lg font-light text-white/40 transition hover:border-white/20 hover:text-white/80"
                  aria-label="Close operations controls"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[0.78fr_1.22fr]">
              <OperationsStatusPanel
                stage={stage}
                currentStageIndex={currentStageIndex}
                passengerCount={passengerCount}
                manifestLoadedAt={manifestLoadedAt}
                selectedPassenger={selectedPassenger}
                isProcessing={isProcessing}
                errorMessage={errorMessage}
              />

              <div className="rounded-[1.4rem] border border-white/[0.07] bg-white/[0.025] p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.28em] text-white/35">
                      Ceremony controls
                    </p>

                    <p className="mt-1.5 text-xs text-white/25">
                      Execute each procedure in sequence.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onFullscreen}
                    className="rounded-full border border-white/[0.08] px-4 py-2 text-[8px] uppercase tracking-[0.24em] text-white/40 transition hover:border-[#c6a56a]/25 hover:text-[#dfc99e]"
                  >
                    Fullscreen
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  <OperationButton
                    number="01"
                    label="Load Manifest"
                    onClick={onLoadManifest}
                    disabled={isProcessing}
                    active={
                      stage ===
                      EXPERIENCE_STAGES.LOADING_MANIFEST
                    }
                  />

                  <OperationButton
                    number="02"
                    label="Begin Final Boarding"
                    onClick={onBeginBoarding}
                    disabled={
                      !isManifestLoaded || isProcessing
                    }
                    active={
                      stage ===
                      EXPERIENCE_STAGES.FINAL_BOARDING
                    }
                  />

                  <OperationButton
                    number="03"
                    label="Verify Manifest"
                    onClick={onVerifyManifest}
                    disabled={
                      !isManifestLoaded || isProcessing
                    }
                    active={
                      stage ===
                      EXPERIENCE_STAGES.VERIFYING_MANIFEST
                    }
                  />

                  <OperationButton
                    number="04"
                    label="Confirm Clearance"
                    onClick={onGroundClearance}
                    disabled={
                      stage !==
                        EXPERIENCE_STAGES.MANIFEST_VERIFIED ||
                      isProcessing
                    }
                    active={
                      stage === EXPERIENCE_STAGES.CLEARANCE
                    }
                  />

                  <OperationButton
                    number="05"
                    label="Lock Destination"
                    onClick={onLockDestination}
                    disabled={
                      stage !== EXPERIENCE_STAGES.CLEARANCE ||
                      isProcessing
                    }
                    active={
                      stage ===
                      EXPERIENCE_STAGES.DESTINATION_LOCKED
                    }
                  />

                  <OperationButton
                    number="06"
                    label="Select Passenger"
                    onClick={onSelectPassenger}
                    disabled={!canSelectPassenger}
                    active={
                      stage ===
                      EXPERIENCE_STAGES.SELECTING_PASSENGER
                    }
                    important
                  />

                  <OperationButton
                    number="07"
                    label="Reveal Winner"
                    onClick={onRevealWinner}
                    disabled={
                      stage !==
                        EXPERIENCE_STAGES.PASSENGER_SELECTED ||
                      !selectedPassenger ||
                      isProcessing
                    }
                    active={
                      stage ===
                      EXPERIENCE_STAGES.WINNER_REVEALED
                    }
                    important
                  />

                  <OperationButton
                    number="08"
                    label="Closing Message"
                    onClick={onClosing}
                    disabled={
                      stage !==
                        EXPERIENCE_STAGES.WINNER_REVEALED ||
                      isProcessing
                    }
                    active={
                      stage === EXPERIENCE_STAGES.CLOSING
                    }
                  />

                  <OperationButton
                    number="00"
                    label="Reset Experience"
                    onClick={onReset}
                    disabled={isProcessing}
                    danger
                  />
                </div>

                <div className="mt-4 rounded-xl border border-white/[0.05] bg-black/10 px-4 py-3">
                  <p className="text-[8px] uppercase tracking-[0.25em] text-white/25">
                    Manifest integrity
                  </p>

                  <p className="mt-1.5 text-[10px] leading-5 text-white/35">
                    {passengers.length > 0
                      ? `${passengers.length} eligible passenger records are currently held in the local ceremony manifest.`
                      : "No passenger records are currently held in the ceremony manifest."}
                  </p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

function OperationsStatusPanel({
  stage,
  currentStageIndex,
  passengerCount,
  manifestLoadedAt,
  selectedPassenger,
  isProcessing,
  errorMessage,
}) {
  const status = STAGE_METADATA[stage];

  return (
    <div className="rounded-[1.4rem] border border-white/[0.07] bg-white/[0.025] p-5">
      <p className="text-[9px] uppercase tracking-[0.28em] text-white/35">
        Live procedure status
      </p>

      <div className="mt-5 border-b border-white/[0.06] pb-5">
        <p className="font-serif text-2xl font-light tracking-[-0.025em] text-[#f1eadf]">
          {status.title}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              errorMessage
                ? "bg-red-300"
                : isProcessing
                  ? "animate-pulse bg-[#d2b67d]"
                  : "bg-emerald-300/70"
            }`}
          />

          <span className="text-[8px] uppercase tracking-[0.25em] text-white/35">
            {errorMessage
              ? "Procedure attention required"
              : isProcessing
                ? "Procedure processing"
                : status.status}
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-5">
        <StatusItem
          label="Sequence"
          value={`${String(
            currentStageIndex + 1
          ).padStart(2, "0")} / ${String(
            STAGE_ORDER.length
          ).padStart(2, "0")}`}
        />

        <StatusItem
          label="Passengers"
          value={
            passengerCount
              ? formatPassengerCount(passengerCount)
              : "—"
          }
        />

        <StatusItem
          label="Manifest loaded"
          value={manifestLoadedAt}
        />

        <StatusItem
          label="Destination"
          value={
            stage === EXPERIENCE_STAGES.DESTINATION_LOCKED ||
            currentStageIndex >
              STAGE_ORDER.indexOf(
                EXPERIENCE_STAGES.DESTINATION_LOCKED
              )
              ? "LOCKED"
              : "PENDING"
          }
        />
      </div>

      <div className="mt-5 rounded-xl border border-[#c6a56a]/10 bg-[#c6a56a]/[0.03] px-4 py-3">
        <p className="text-[8px] uppercase tracking-[0.25em] text-[#cdb583]/60">
          Selected passenger
        </p>

        <p className="mt-2 truncate font-mono text-[10px] tracking-[0.12em] text-white/45">
          {selectedPassenger?.ticket_code ||
            "IDENTITY NOT YET ASSIGNED"}
        </p>
      </div>
    </div>
  );
}

function StatusItem({ label, value }) {
  return (
    <div>
      <p className="text-[8px] uppercase tracking-[0.24em] text-white/20">
        {label}
      </p>

      <p className="mt-1.5 truncate font-mono text-[10px] tracking-[0.08em] text-white/50">
        {value}
      </p>
    </div>
  );
}

function OperationButton({
  number,
  label,
  onClick,
  disabled,
  active,
  important,
  danger,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group relative min-h-[76px] overflow-hidden rounded-xl border px-4 py-3 text-left transition duration-300 ${
        disabled
          ? "cursor-not-allowed border-white/[0.04] bg-white/[0.015] opacity-35"
          : danger
            ? "border-red-300/10 bg-red-400/[0.025] hover:border-red-300/25 hover:bg-red-400/[0.05]"
            : important
              ? "border-[#c6a56a]/20 bg-[#c6a56a]/[0.045] hover:border-[#d2b579]/45 hover:bg-[#c6a56a]/[0.08]"
              : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.16] hover:bg-white/[0.045]"
      } ${active ? "border-[#d2b579]/55 bg-[#c6a56a]/[0.09]" : ""}`}
    >
      {active && (
        <motion.span
          layoutId="active-operation"
          className="absolute inset-y-0 left-0 w-px bg-[#d8bd87]"
        />
      )}

      <span className="font-mono text-[8px] tracking-[0.2em] text-white/20">
        {number}
      </span>

      <span
        className={`mt-3 block text-[9px] uppercase tracking-[0.18em] ${
          danger
            ? "text-red-100/50"
            : important
              ? "text-[#e1cca3]/70"
              : "text-white/45"
        }`}
      >
        {label}
      </span>
    </button>
  );
}


// ============================================================
// SECTION 8 — Winner Reveal
// ============================================================

function WinnerReveal({ metadata, passenger }) {
  const winnerName =
    passenger?.full_name || "Selected Passenger";

  const winnerTicket =
    passenger?.ticket_code || "AV-••••••";

  return (
    <motion.section
      variants={MOTION.screen}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative mx-auto flex min-h-[650px] max-w-[1380px] items-center justify-center"
    >
      <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] border border-[#d2b579]/25 bg-gradient-to-b from-[#0b192b]/90 via-[#06101e]/90 to-[#020812]/95 shadow-[0_50px_180px_rgba(0,0,0,0.62)] backdrop-blur-xl">
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: [0.08, 0.24, 0.12],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-1/2 top-[-40%] h-[110%] w-[70%] -translate-x-1/2 rounded-full bg-[#c9a96e]/20 blur-[140px]"
        />

        <motion.div
          initial={{
            scaleX: 0,
          }}
          animate={{
            scaleX: 1,
          }}
          transition={{
            delay: 0.1,
            duration: 2,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute left-[10%] right-[10%] top-0 h-px origin-center bg-gradient-to-r from-transparent via-[#e1c68e]/90 to-transparent"
        />
      </div>

      <div className="relative z-10 flex w-full flex-col items-center px-7 py-16 text-center sm:px-12 lg:px-20">
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.8,
            rotate: -8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            rotate: 0,
          }}
          transition={{
            duration: 1.4,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mb-10 flex h-24 w-24 items-center justify-center rounded-full border border-[#d5b97f]/30 bg-[#d5b97f]/[0.06]"
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
            delay: 0.35,
            duration: 0.9,
          }}
          className="text-[10px] uppercase tracking-[0.42em] text-[#d4ba87] sm:text-xs"
        >
          Passenger Cleared
        </motion.p>

        <motion.h1
          initial={{
            opacity: 0,
            y: 30,
            filter: "blur(8px)",
          }}
          animate={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
          }}
          transition={{
            delay: 0.6,
            duration: 1.25,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mt-8 max-w-6xl font-serif text-[clamp(3.8rem,8vw,8.5rem)] font-light leading-[0.88] tracking-[-0.06em] text-[#fbf6ed]"
        >
          {winnerName}
        </motion.h1>

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 1.05,
            duration: 0.9,
          }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-8"
        >
          <WinnerDetail
            label="Ticket"
            value={winnerTicket}
          />

          <span className="hidden h-8 w-px bg-white/10 sm:block" />

          <WinnerDetail
            label="Flight"
            value={passenger?.flight || "OM 1025"}
          />

          <span className="hidden h-8 w-px bg-white/10 sm:block" />

          <WinnerDetail
            label="Seat"
            value={passenger?.seat || "—"}
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
            delay: 1.55,
            duration: 1.1,
          }}
          className="mt-14"
        >
          <p className="text-sm font-light uppercase tracking-[0.28em] text-[#ded3c1]/65 sm:text-base">
            Your next journey begins now.
          </p>

          <p className="mt-5 font-serif text-2xl font-light tracking-[-0.02em] text-[#f3eadc] sm:text-3xl">
            Secret Destination Experience
          </p>
        </motion.div>
      </div>

      <CornerReference reference="FINAL CLEARANCE" />
    </motion.section>
  );
}

function WinnerDetail({ label, value }) {
  return (
    <div className="min-w-[110px]">
      <p className="text-[8px] uppercase tracking-[0.3em] text-white/25">
        {label}
      </p>

      <p className="mt-2 font-mono text-xs tracking-[0.17em] text-[#e2d3b7]/80">
        {value}
      </p>
    </div>
  );
}


// ============================================================
// SECTION 9 — Brand Signature
// ============================================================

function BrandSignature({
  stage,
  status,
  progress,
}) {
  return (
    <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-30 px-6 pb-6 sm:px-9 sm:pb-8 lg:px-12">
      <div className="mx-auto flex max-w-[1500px] items-end justify-between gap-8">
        <div className="hidden sm:block">
          <p className="text-[8px] uppercase tracking-[0.3em] text-white/20">
            Marketing Made in Greece — On Air
          </p>

          <p className="mt-1.5 text-[8px] uppercase tracking-[0.26em] text-white/15">
            Philoxenia 2026
          </p>
        </div>

        <div className="w-full max-w-md sm:w-[340px]">
          <div className="mb-2 flex items-center justify-between gap-5">
            <span className="truncate text-[8px] uppercase tracking-[0.25em] text-white/25">
              {status}
            </span>

            <span className="font-mono text-[8px] tracking-[0.15em] text-white/25">
              {String(progress).padStart(3, "0")}%
            </span>
          </div>

          <div className="h-px overflow-hidden bg-white/[0.07]">
            <motion.div
              animate={{
                width: `${progress}%`,
              }}
              transition={{
                duration: 1.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="h-full bg-gradient-to-r from-[#866b3f] via-[#c9a96e] to-[#e0c995]"
            />
          </div>
        </div>

        <div className="hidden text-right lg:block">
          <p className="text-[8px] uppercase tracking-[0.3em] text-white/20">
            Secret Destination
          </p>

          <p className="mt-1.5 font-mono text-[8px] tracking-[0.18em] text-white/15">
            {stage === EXPERIENCE_STAGES.CLOSING
              ? "JOURNEY COMPLETE"
              : "CONFIDENTIAL"}
          </p>
        </div>
      </div>
    </footer>
  );
}

function OrbitMark() {
  return (
    <div className="relative h-11 w-11">
      <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d2b579]" />

      <motion.span
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute inset-0 rounded-[50%] border border-[#d2b579]/45"
      >
        <span className="absolute left-1/2 top-[-2px] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#ead8b4]" />
      </motion.span>

      <span className="absolute inset-[8px] rotate-45 rounded-[50%] border border-[#d2b579]/20" />
    </div>
  );
}

function CheckmarkIcon() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      aria-hidden="true"
    >
      <motion.path
        d="M7 15.5L12.3 20.5L23 9.5"
        stroke="#D8BF8D"
        strokeWidth="1.5"
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
          delay: 0.55,
          duration: 1.1,
          ease: [0.22, 1, 0.36, 1],
        }}
      />
    </svg>
  );
}


// ============================================================
// SECTION 10 — Atmospheric Background
// ============================================================

function AtmosphericBackground({ stage }) {
  const revealActive = [
    EXPERIENCE_STAGES.PASSENGER_SELECTED,
    EXPERIENCE_STAGES.WINNER_REVEALED,
    EXPERIENCE_STAGES.CLOSING,
  ].includes(stage);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(23,52,87,0.5),transparent_42%),linear-gradient(180deg,#06101f_0%,#020812_62%,#01050b_100%)]" />

      <motion.div
        animate={{
          opacity: revealActive ? 0.32 : 0.16,
          scale: revealActive ? 1.08 : 1,
        }}
        transition={{
          duration: 2,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="absolute left-1/2 top-[-25%] h-[85%] w-[70%] -translate-x-1/2 rounded-full bg-[#234d7c]/35 blur-[150px]"
      />

      <motion.div
        animate={{
          opacity: revealActive ? 0.22 : 0.08,
        }}
        transition={{
          duration: 2.5,
        }}
        className="absolute bottom-[-35%] left-[12%] h-[70%] w-[55%] rounded-full bg-[#b18a4d]/30 blur-[170px]"
      />

      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "linear-gradient(to bottom, transparent, black 18%, black 75%, transparent)",
        }}
      />

      <motion.div
        animate={{
          x: ["-20%", "120%"],
          opacity: [0, 0.18, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 3,
        }}
        className="absolute top-[22%] h-px w-[35%] bg-gradient-to-r from-transparent via-[#d4b579]/70 to-transparent"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.55)_100%)]" />

      <div className="absolute inset-0 opacity-[0.025] mix-blend-soft-light">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.7'/%3E%3C/svg%3E\")",
          }}
        />
      </div>
    </div>
  );
}
