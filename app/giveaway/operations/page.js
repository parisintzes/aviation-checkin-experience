"use client";

// ============================================================================
// SECTION 1 — IMPORTS
// ============================================================================

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";


// ============================================================================
// SECTION 2 — CONFIGURATION
// ============================================================================

const EXPERIENCE_ID = "main";

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

const STAGE_INFORMATION = {
  [STAGES.INITIAL]: {
    sequence: "00",
    title: "Final Boarding Standby",
    status: "Awaiting Ground Operations",
    progress: 0,
  },

  [STAGES.MANIFEST_LOADING]: {
    sequence: "01",
    title: "Manifest Loading",
    status: "Secure data transfer active",
    progress: 12,
  },

  [STAGES.MANIFEST_READY]: {
    sequence: "02",
    title: "Manifest Received",
    status: "Passenger records available",
    progress: 24,
  },

  [STAGES.FINAL_BOARDING]: {
    sequence: "03",
    title: "Final Boarding",
    status: "Boarding procedure active",
    progress: 36,
  },

  [STAGES.VERIFYING]: {
    sequence: "04",
    title: "Manifest Verification",
    status: "Eligibility verification active",
    progress: 48,
  },

  [STAGES.VERIFIED]: {
    sequence: "05",
    title: "Manifest Verified",
    status: "Eligibility confirmed",
    progress: 58,
  },

  [STAGES.CLEARANCE]: {
    sequence: "06",
    title: "Departure Clearance",
    status: "Ground Operations clearance confirmed",
    progress: 68,
  },

  [STAGES.DESTINATION_LOCKED]: {
    sequence: "07",
    title: "Destination Locked",
    status: "Secret destination secured",
    progress: 78,
  },

  [STAGES.SELECTING]: {
    sequence: "08",
    title: "Passenger Selection",
    status: "Selection sequence active",
    progress: 88,
  },

  [STAGES.PASSENGER_SELECTED]: {
    sequence: "09",
    title: "Passenger Selected",
    status: "Identity secured",
    progress: 94,
  },

  [STAGES.WINNER_REVEALED]: {
    sequence: "10",
    title: "Passenger Revealed",
    status: "Public clearance complete",
    progress: 100,
  },

  [STAGES.CLOSING]: {
    sequence: "11",
    title: "Closing Ceremony",
    status: "Experience complete",
    progress: 100,
  },
};

const SELECTION_DURATION = 7200;
const SELECTION_TICK = 130;

const wait = (milliseconds) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });

const formatCount = (value) =>
  new Intl.NumberFormat("en-US", {
    minimumIntegerDigits: 2,
  }).format(value || 0);

const secureRandomIndex = (length) => {
  if (!length || length <= 0) {
    return null;
  }

  const values = new Uint32Array(1);
  window.crypto.getRandomValues(values);

  return values[0] % length;
};


// ============================================================================
// SECTION 3 — MAIN OPERATIONS PAGE
// ============================================================================

export default function GiveawayOperationsPage() {
  const [experience, setExperience] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [selectedPassenger, setSelectedPassenger] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectionIntervalRef = useRef(null);

  const stage = experience?.stage || STAGES.INITIAL;
  const currentStage = STAGE_INFORMATION[stage];
  const stageIndex = STAGE_ORDER.indexOf(stage);

  const manifestCount =
    experience?.manifest_count || passengers.length || 0;

  const destinationLocked =
    stageIndex >=
    STAGE_ORDER.indexOf(STAGES.DESTINATION_LOCKED);

  const formattedUpdateTime = useMemo(() => {
    if (!experience?.updated_at) {
      return "—";
    }

    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date(experience.updated_at));
  }, [experience?.updated_at]);

  const loadExperience = useCallback(async () => {
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
        const { data: createdExperience, error: creationError } =
          await supabase
            .from("giveaway_experience")
            .insert({
              id: EXPERIENCE_ID,
              stage: STAGES.INITIAL,
              manifest_count: 0,
              selected_passenger_id: null,
              selection_preview: null,
              is_processing: false,
              last_action: "Experience initialized",
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (creationError) {
          throw creationError;
        }

        setExperience(createdExperience);
        return;
      }

      setExperience(data);

      if (data.selected_passenger_id) {
        await loadSelectedPassenger(data.selected_passenger_id);
      }
    } catch (error) {
      console.error("Experience loading error:", error);

      setErrorMessage(
        error?.message ||
          "The giveaway experience could not be loaded."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSelectedPassenger = useCallback(
    async (passengerId) => {
      if (!passengerId) {
        setSelectedPassenger(null);
        return;
      }

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
          giveaway_eligible,
          giveaway_winner,
          giveaway_selected_at
        `)
        .eq("id", passengerId)
        .maybeSingle();

      if (error) {
        console.error("Selected passenger loading error:", error);
        return;
      }

      setSelectedPassenger(data || null);
    },
    []
  );

  useEffect(() => {
    loadExperience();
  }, [loadExperience]);

  useEffect(() => {
    const channel = supabase
      .channel("giveaway-operations-state")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "giveaway_experience",
          filter: `id=eq.${EXPERIENCE_ID}`,
        },
        async (payload) => {
          const updatedExperience =
            payload.new && Object.keys(payload.new).length
              ? payload.new
              : null;

          if (!updatedExperience) {
            return;
          }

          setExperience(updatedExperience);

          if (updatedExperience.selected_passenger_id) {
            await loadSelectedPassenger(
              updatedExperience.selected_passenger_id
            );
          } else {
            setSelectedPassenger(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadSelectedPassenger]);

  useEffect(() => {
    return () => {
      if (selectionIntervalRef.current) {
        window.clearInterval(selectionIntervalRef.current);
      }
    };
  }, []);

  const updateExperience = useCallback(
    async (updates) => {
      const updatePayload = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("giveaway_experience")
        .update(updatePayload)
        .eq("id", EXPERIENCE_ID)
        .select()
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setExperience(data);
      }

      return data;
    },
    []
  );

  const executeAction = useCallback(
    async ({
      actionName,
      processingStage,
      finalStage,
      processingDuration = 0,
      callback,
    }) => {
      if (isExecuting) {
        return;
      }

      setIsExecuting(true);
      setErrorMessage("");
      setSuccessMessage("");

      try {
        if (processingStage) {
          await updateExperience({
            stage: processingStage,
            is_processing: true,
            last_action: actionName,
          });
        }

        if (callback) {
          await callback();
        }

        if (processingDuration > 0) {
          await wait(processingDuration);
        }

        if (finalStage) {
          await updateExperience({
            stage: finalStage,
            is_processing: false,
            last_action: actionName,
          });
        }

        setSuccessMessage(`${actionName} completed.`);
      } catch (error) {
        console.error(`${actionName} error:`, error);

        setErrorMessage(
          error?.message || `${actionName} could not be completed.`
        );

        await updateExperience({
          is_processing: false,
          last_action: `${actionName} failed`,
        }).catch(() => {});
      } finally {
        setIsExecuting(false);
      }
    },
    [isExecuting, updateExperience]
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020711] text-[#f2efe8]">
      <OperationsBackground />

      <div className="relative z-20 mx-auto min-h-screen max-w-[1680px] px-5 py-6 sm:px-8 lg:px-12">
        <OperationsHeader
          status={currentStage.status}
          updatedAt={formattedUpdateTime}
        />

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
          <LiveStatusPanel
            experience={experience}
            stage={stage}
            currentStage={currentStage}
            manifestCount={manifestCount}
            selectedPassenger={selectedPassenger}
            destinationLocked={destinationLocked}
            isLoading={isLoading}
          />

          <CeremonyControls
            stage={stage}
            isExecuting={isExecuting}
            passengerCount={manifestCount}
            selectedPassenger={selectedPassenger}
            onLoadManifest={() =>
              executeAction({
                actionName: "Passenger Manifest Loading",
                processingStage: STAGES.MANIFEST_LOADING,
                finalStage: STAGES.MANIFEST_READY,
                processingDuration: 1800,
                callback: async () => {
                  const loadedPassengers =
                    await fetchEligiblePassengers();

                  setPassengers(loadedPassengers);

                  await updateExperience({
                    manifest_count: loadedPassengers.length,
                    selected_passenger_id: null,
                    selection_preview: null,
                  });
                },
              })
            }
            onBeginBoarding={() =>
              executeAction({
                actionName: "Final Boarding Procedure",
                finalStage: STAGES.FINAL_BOARDING,
              })
            }
            onVerifyManifest={() =>
              executeAction({
                actionName: "Passenger Manifest Verification",
                processingStage: STAGES.VERIFYING,
                finalStage: STAGES.VERIFIED,
                processingDuration: 2400,
                callback: async () => {
                  const verifiedPassengers =
                    passengers.length > 0
                      ? passengers
                      : await fetchEligiblePassengers();

                  if (!verifiedPassengers.length) {
                    throw new Error(
                      "No passengers passed eligibility verification."
                    );
                  }

                  setPassengers(verifiedPassengers);

                  await updateExperience({
                    manifest_count: verifiedPassengers.length,
                  });
                },
              })
            }
            onConfirmClearance={() =>
              executeAction({
                actionName: "Ground Operations Clearance",
                finalStage: STAGES.CLEARANCE,
              })
            }
            onLockDestination={() =>
              executeAction({
                actionName: "Secret Destination Lock",
                finalStage: STAGES.DESTINATION_LOCKED,
              })
            }
            onSelectPassenger={() =>
              handlePassengerSelection({
                passengers,
                selectionIntervalRef,
                updateExperience,
                setPassengers,
                setSelectedPassenger,
                setIsExecuting,
                setErrorMessage,
                setSuccessMessage,
              })
            }
            onRevealWinner={() =>
              executeAction({
                actionName: "Passenger Public Reveal",
                finalStage: STAGES.WINNER_REVEALED,
              })
            }
            onClosing={() =>
              executeAction({
                actionName: "Closing Ceremony",
                finalStage: STAGES.CLOSING,
              })
            }
            onReset={() =>
              resetGiveawayExperience({
                selectionIntervalRef,
                updateExperience,
                setPassengers,
                setSelectedPassenger,
                setIsExecuting,
                setErrorMessage,
                setSuccessMessage,
              })
            }
          />
        </div>

        <SystemMessages
          errorMessage={errorMessage}
          successMessage={successMessage}
        />

        <OperationsFooter />
      </div>
    </main>
  );
}


// ============================================================================
// SECTION 4 — PASSENGER MANIFEST
// ============================================================================

async function fetchEligiblePassengers() {
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
    .not("full_name", "is", null)
    .not("ticket_code", "is", null)
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  const validPassengers = (data || []).filter(
    (passenger) =>
      passenger?.id &&
      passenger?.full_name?.trim() &&
      passenger?.ticket_code?.trim() &&
      passenger?.giveaway_eligible === true
  );

  if (!validPassengers.length) {
    throw new Error(
      "No eligible checked-in passengers were found."
    );
  }

  return validPassengers;
}


// ============================================================================
// SECTION 5 — PASSENGER SELECTION
// ============================================================================

async function handlePassengerSelection({
  passengers,
  selectionIntervalRef,
  updateExperience,
  setPassengers,
  setSelectedPassenger,
  setIsExecuting,
  setErrorMessage,
  setSuccessMessage,
}) {
  setIsExecuting(true);
  setErrorMessage("");
  setSuccessMessage("");

  try {
    const activePassengers =
      passengers.length > 0
        ? passengers
        : await fetchEligiblePassengers();

    if (!activePassengers.length) {
      throw new Error(
        "The verified passenger manifest is empty."
      );
    }

    setPassengers(activePassengers);

    await updateExperience({
      stage: STAGES.SELECTING,
      is_processing: true,
      last_action: "Passenger Selection Sequence",
      manifest_count: activePassengers.length,
      selected_passenger_id: null,
    });

    selectionIntervalRef.current = window.setInterval(() => {
      const previewIndex = secureRandomIndex(
        activePassengers.length
      );

      if (previewIndex === null) {
        return;
      }

      const previewPassenger = activePassengers[previewIndex];

      updateExperience({
        selection_preview: {
          id: previewPassenger.id,
          ticket_code: previewPassenger.ticket_code,
          flight: previewPassenger.flight,
          seat: previewPassenger.seat,
          gate: previewPassenger.gate,
        },
      }).catch((error) => {
        console.error("Preview update error:", error);
      });
    }, SELECTION_TICK);

    await wait(SELECTION_DURATION);

    window.clearInterval(selectionIntervalRef.current);
    selectionIntervalRef.current = null;

    const winnerIndex = secureRandomIndex(
      activePassengers.length
    );

    if (winnerIndex === null) {
      throw new Error(
        "A passenger could not be selected."
      );
    }

    const winner = activePassengers[winnerIndex];
    const selectedAt = new Date().toISOString();

    const { error: previousWinnerError } = await supabase
      .from("participants")
      .update({
        giveaway_winner: false,
        giveaway_selected_at: null,
      })
      .eq("giveaway_winner", true)
      .neq("id", winner.id);

    if (previousWinnerError) {
      throw previousWinnerError;
    }

    const { error: winnerUpdateError } = await supabase
      .from("participants")
      .update({
        giveaway_winner: true,
        giveaway_selected_at: selectedAt,
      })
      .eq("id", winner.id)
      .eq("giveaway_eligible", true);

    if (winnerUpdateError) {
      throw winnerUpdateError;
    }

    const storedWinner = {
      ...winner,
      giveaway_winner: true,
      giveaway_selected_at: selectedAt,
    };

    setSelectedPassenger(storedWinner);

    await updateExperience({
      stage: STAGES.PASSENGER_SELECTED,
      selected_passenger_id: winner.id,
      selection_preview: {
        id: winner.id,
        ticket_code: winner.ticket_code,
        flight: winner.flight,
        seat: winner.seat,
        gate: winner.gate,
      },
      is_processing: false,
      last_action: "Passenger selected",
    });

    setSuccessMessage("Passenger selection completed.");
  } catch (error) {
    if (selectionIntervalRef.current) {
      window.clearInterval(selectionIntervalRef.current);
      selectionIntervalRef.current = null;
    }

    console.error("Passenger selection error:", error);

    setErrorMessage(
      error?.message ||
        "Passenger selection could not be completed."
    );

    await updateExperience({
      stage: STAGES.DESTINATION_LOCKED,
      is_processing: false,
      last_action: "Passenger selection failed",
    }).catch(() => {});
  } finally {
    setIsExecuting(false);
  }
}

async function resetGiveawayExperience({
  selectionIntervalRef,
  updateExperience,
  setPassengers,
  setSelectedPassenger,
  setIsExecuting,
  setErrorMessage,
  setSuccessMessage,
}) {
  if (selectionIntervalRef.current) {
    window.clearInterval(selectionIntervalRef.current);
    selectionIntervalRef.current = null;
  }

  setIsExecuting(true);
  setErrorMessage("");
  setSuccessMessage("");

  try {
    await updateExperience({
      stage: STAGES.INITIAL,
      manifest_count: 0,
      selected_passenger_id: null,
      selection_preview: null,
      is_processing: false,
      last_action: "Experience reset",
    });

    setPassengers([]);
    setSelectedPassenger(null);
    setSuccessMessage("Experience reset completed.");
  } catch (error) {
    console.error("Experience reset error:", error);

    setErrorMessage(
      error?.message ||
        "The experience could not be reset."
    );
  } finally {
    setIsExecuting(false);
  }
}


// ============================================================================
// SECTION 6 — OPERATIONS HEADER
// ============================================================================

function OperationsHeader({ status, updatedAt }) {
  return (
    <header className="flex flex-col gap-6 border-b border-white/[0.07] pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c9aa70]/35" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#c9aa70]" />
          </span>

          <p className="text-[9px] uppercase tracking-[0.4em] text-[#cfb57f]">
            OMMT Airlines
          </p>
        </div>

        <h1 className="mt-4 text-3xl font-extralight tracking-[-0.055em] text-[#f2efe9] sm:text-5xl">
          Ground Operations
        </h1>

        <p className="mt-3 text-[9px] uppercase tracking-[0.31em] text-white/25">
          Secret Destination Ceremonial Control
        </p>
      </div>

      <div className="flex gap-8">
        <HeaderMetric
          label="System status"
          value={status}
        />

        <HeaderMetric
          label="Last update"
          value={updatedAt}
        />
      </div>
    </header>
  );
}

function HeaderMetric({ label, value }) {
  return (
    <div>
      <p className="text-[7px] uppercase tracking-[0.3em] text-white/20">
        {label}
      </p>

      <p className="mt-2 max-w-[220px] truncate font-mono text-[9px] uppercase tracking-[0.13em] text-white/45">
        {value}
      </p>
    </div>
  );
}


// ============================================================================
// SECTION 7 — LIVE STATUS PANEL
// ============================================================================

function LiveStatusPanel({
  experience,
  stage,
  currentStage,
  manifestCount,
  selectedPassenger,
  destinationLocked,
  isLoading,
}) {
  return (
    <section className="border border-white/[0.07] bg-white/[0.018]">
      <div className="border-b border-white/[0.06] px-5 py-4">
        <p className="text-[8px] uppercase tracking-[0.32em] text-white/28">
          Live Experience State
        </p>
      </div>

      <div className="p-5 sm:p-7">
        {isLoading ? (
          <div className="flex min-h-[350px] items-center justify-center">
            <ProcessingIndicator />
          </div>
        ) : (
          <>
            <div>
              <p className="font-mono text-[9px] tracking-[0.22em] text-[#cbb17d]/60">
                SEQUENCE {currentStage.sequence}
              </p>

              <h2 className="mt-4 text-3xl font-extralight tracking-[-0.055em] text-[#f1eee7] sm:text-4xl">
                {currentStage.title}
              </h2>

              <div className="mt-4 flex items-center gap-3">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    experience?.is_processing
                      ? "animate-pulse bg-[#c9aa70]"
                      : "bg-emerald-300/65"
                  }`}
                />

                <p className="text-[8px] uppercase tracking-[0.29em] text-white/32">
                  {currentStage.status}
                </p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-px bg-white/[0.05]">
              <StatusCell
                label="Manifest"
                value={formatCount(manifestCount)}
              />

              <StatusCell
                label="Destination"
                value={
                  destinationLocked ? "LOCKED" : "PENDING"
                }
              />

              <StatusCell
                label="Processing"
                value={
                  experience?.is_processing ? "ACTIVE" : "STANDBY"
                }
              />

              <StatusCell
                label="Experience"
                value={stage.toUpperCase()}
              />
            </div>

            <div className="mt-7 border-l border-[#c9aa70]/25 bg-[#c9aa70]/[0.025] px-5 py-4">
              <p className="text-[8px] uppercase tracking-[0.3em] text-[#cdb582]/45">
                Selected passenger
              </p>

              {selectedPassenger ? (
                <div className="mt-4">
                  <p className="text-lg font-light tracking-[-0.03em] text-[#eee8dd]">
                    {selectedPassenger.full_name}
                  </p>

                  <p className="mt-2 font-mono text-[9px] tracking-[0.2em] text-white/35">
                    {selectedPassenger.ticket_code}
                  </p>
                </div>
              ) : (
                <p className="mt-3 font-mono text-[9px] tracking-[0.15em] text-white/25">
                  IDENTITY NOT ASSIGNED
                </p>
              )}
            </div>

            <div className="mt-7">
              <div className="flex items-center justify-between">
                <p className="text-[7px] uppercase tracking-[0.28em] text-white/20">
                  Ceremony progress
                </p>

                <p className="font-mono text-[8px] text-white/28">
                  {currentStage.progress}%
                </p>
              </div>

              <div className="mt-3 h-px overflow-hidden bg-white/[0.06]">
                <motion.div
                  animate={{
                    width: `${currentStage.progress}%`,
                  }}
                  transition={{
                    duration: 1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="h-full bg-gradient-to-r from-[#745d38] via-[#c6a86c] to-[#e2ca98]"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function StatusCell({ label, value }) {
  return (
    <div className="bg-[#050c16] px-4 py-4">
      <p className="text-[7px] uppercase tracking-[0.27em] text-white/18">
        {label}
      </p>

      <p className="mt-2 truncate font-mono text-[9px] tracking-[0.12em] text-white/42">
        {value}
      </p>
    </div>
  );
}


// ============================================================================
// SECTION 8 — CEREMONY CONTROLS
// ============================================================================

function CeremonyControls({
  stage,
  isExecuting,
  passengerCount,
  selectedPassenger,
  onLoadManifest,
  onBeginBoarding,
  onVerifyManifest,
  onConfirmClearance,
  onLockDestination,
  onSelectPassenger,
  onRevealWinner,
  onClosing,
  onReset,
}) {
  return (
    <section className="border border-white/[0.07] bg-white/[0.018]">
      <div className="border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center justify-between">
          <p className="text-[8px] uppercase tracking-[0.32em] text-white/28">
            Ceremony Sequence
          </p>

          <p className="font-mono text-[8px] tracking-[0.15em] text-white/20">
            {formatCount(passengerCount)} PASSENGERS
          </p>
        </div>
      </div>

      <div className="grid gap-2 p-5 sm:grid-cols-2 lg:p-7 xl:grid-cols-3">
        <ControlButton
          number="01"
          label="Load Manifest"
          description="Retrieve eligible passenger records"
          active={stage === STAGES.MANIFEST_LOADING}
          disabled={isExecuting}
          onClick={onLoadManifest}
        />

        <ControlButton
          number="02"
          label="Begin Final Boarding"
          description="Start the public boarding ceremony"
          active={stage === STAGES.FINAL_BOARDING}
          disabled={
            passengerCount === 0 || isExecuting
          }
          onClick={onBeginBoarding}
        />

        <ControlButton
          number="03"
          label="Verify Manifest"
          description="Confirm passenger eligibility"
          active={stage === STAGES.VERIFYING}
          disabled={
            passengerCount === 0 || isExecuting
          }
          onClick={onVerifyManifest}
        />

        <ControlButton
          number="04"
          label="Confirm Clearance"
          description="Authorise the final departure sequence"
          active={stage === STAGES.CLEARANCE}
          disabled={
            stage !== STAGES.VERIFIED || isExecuting
          }
          onClick={onConfirmClearance}
        />

        <ControlButton
          number="05"
          label="Lock Destination"
          description="Secure the secret destination"
          active={stage === STAGES.DESTINATION_LOCKED}
          disabled={
            stage !== STAGES.CLEARANCE || isExecuting
          }
          onClick={onLockDestination}
        />

        <ControlButton
          number="06"
          label="Select Passenger"
          description="Execute the secure selection sequence"
          active={stage === STAGES.SELECTING}
          disabled={
            stage !== STAGES.DESTINATION_LOCKED ||
            passengerCount === 0 ||
            isExecuting
          }
          important
          onClick={onSelectPassenger}
        />

        <ControlButton
          number="07"
          label="Reveal Passenger"
          description="Release the selected identity publicly"
          active={stage === STAGES.WINNER_REVEALED}
          disabled={
            stage !== STAGES.PASSENGER_SELECTED ||
            !selectedPassenger ||
            isExecuting
          }
          important
          onClick={onRevealWinner}
        />

        <ControlButton
          number="08"
          label="Closing Ceremony"
          description="Complete the Secret Destination act"
          active={stage === STAGES.CLOSING}
          disabled={
            stage !== STAGES.WINNER_REVEALED ||
            isExecuting
          }
          onClick={onClosing}
        />

        <ControlButton
          number="00"
          label="Reset Experience"
          description="Return all public screens to standby"
          disabled={isExecuting}
          danger
          onClick={onReset}
        />
      </div>
    </section>
  );
}

function ControlButton({
  number,
  label,
  description,
  active,
  disabled,
  important,
  danger,
  onClick,
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`relative min-h-[132px] overflow-hidden border p-5 text-left transition duration-300 ${
        disabled
          ? "cursor-not-allowed border-white/[0.035] bg-white/[0.008] opacity-30"
          : danger
            ? "border-red-300/10 bg-red-400/[0.018] hover:border-red-300/25 hover:bg-red-400/[0.04]"
            : important
              ? "border-[#c8aa70]/22 bg-[#c8aa70]/[0.04] hover:border-[#c8aa70]/50 hover:bg-[#c8aa70]/[0.075]"
              : "border-white/[0.065] bg-white/[0.012] hover:border-white/[0.16] hover:bg-white/[0.032]"
      } ${
        active
          ? "border-[#d2b67d]/60 bg-[#c8aa70]/[0.08]"
          : ""
      }`}
    >
      {active && (
        <motion.span
          layoutId="active-operation-control"
          className="absolute inset-y-0 left-0 w-px bg-[#dfc58d]"
        />
      )}

      <p className="font-mono text-[8px] tracking-[0.22em] text-white/20">
        {number}
      </p>

      <p
        className={`mt-4 text-[10px] uppercase tracking-[0.21em] ${
          danger
            ? "text-red-100/48"
            : important
              ? "text-[#dfcb9f]/72"
              : "text-white/48"
        }`}
      >
        {label}
      </p>

      <p className="mt-3 text-[10px] font-light leading-5 text-white/22">
        {description}
      </p>
    </button>
  );
}


// ============================================================================
// SECTION 9 — SYSTEM FEEDBACK
// ============================================================================

function SystemMessages({
  errorMessage,
  successMessage,
}) {
  return (
    <AnimatePresence>
      {(errorMessage || successMessage) && (
        <motion.div
          initial={{
            opacity: 0,
            y: 14,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: 10,
          }}
          className={`mt-6 border-l px-5 py-4 ${
            errorMessage
              ? "border-red-300/40 bg-red-400/[0.035]"
              : "border-emerald-300/30 bg-emerald-300/[0.025]"
          }`}
        >
          <p
            className={`text-[8px] uppercase tracking-[0.3em] ${
              errorMessage
                ? "text-red-200/50"
                : "text-emerald-200/45"
            }`}
          >
            {errorMessage
              ? "Ground Operations Notice"
              : "Procedure Confirmation"}
          </p>

          <p className="mt-2 text-xs text-white/48">
            {errorMessage || successMessage}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


// ============================================================================
// SECTION 10 — BRAND & BACKGROUND
// ============================================================================

function OperationsFooter() {
  return (
    <footer className="mt-8 flex flex-col gap-4 border-t border-white/[0.06] py-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-light tracking-[-0.03em] text-[#e9e3d8]">
          OMMT
          <span className="lowercase">o</span>
          ...New Horizons
        </p>

        <p className="mt-2 text-[7px] uppercase tracking-[0.35em] text-white/18">
          Aviation · Tourism · Innovation
        </p>
      </div>

      <p className="text-[7px] uppercase tracking-[0.3em] text-white/15">
        Marketing Made in Greece — On Air · Philoxenia 2026
      </p>
    </footer>
  );
}

function OperationsBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#06101d_0%,#020711_58%,#01040a_100%)]" />

      <div className="absolute left-1/2 top-[-35%] h-[90%] w-[75%] -translate-x-1/2 rounded-full bg-[#17416d]/25 blur-[180px]" />

      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
        }}
      />

      <motion.div
        animate={{
          x: ["-35%", "160%"],
          opacity: [0, 0.12, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 3,
        }}
        className="absolute top-[24%] h-px w-[32%] bg-gradient-to-r from-transparent via-[#d6ba82]/65 to-transparent"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.62)_100%)]" />
    </div>
  );
}

function ProcessingIndicator() {
  return (
    <span className="flex items-center gap-2">
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
          className="h-1.5 w-1.5 rounded-full bg-[#c9aa70]"
        />
      ))}
    </span>
  );
}
