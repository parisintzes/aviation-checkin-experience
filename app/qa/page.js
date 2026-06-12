"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle2, Radio } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function PassengerQAPage() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    const cleanQuestion = question.trim();

    if (!cleanQuestion) {
      setErrorMessage("Παρακαλούμε πληκτρολογήστε την ερώτησή σας πριν την αποστολή.");
      return;
    }

    if (cleanQuestion.length < 10) {
      setErrorMessage("Η ερώτηση είναι πολύ σύντομη. Παρακαλούμε διατυπώστε την πιο καθαρά.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("questions").insert([
      {
        question: cleanQuestion,
        status: "pending",
        is_current: false,
      },
    ]);

    setLoading(false);

    if (error) {
      console.log("QUESTION SUBMIT ERROR:", error);
      setErrorMessage("Η μετάδοση δεν ολοκληρώθηκε. Παρακαλούμε δοκιμάστε ξανά.");
      return;
    }

    setSubmitted(true);
    setQuestion("");
  }

  return (
    <main className="fixed inset-0 h-[100dvh] w-screen overflow-hidden bg-[#02050c] text-white">
      <section className="relative mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-[#06152a]">
        <AviationBackground />

        <div className="relative z-10 flex flex-1 flex-col px-7 pb-7 pt-8">
          <header className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d7a247]/30 bg-[#d7a247]/10 text-[#f7d27a]">
              <Radio className="h-4 w-4" />
            </div>

            <p className="text-[9px] uppercase tracking-[0.34em] text-white/34">
              Q&amp;A Channel
            </p>
          </header>

          {!submitted ? (
            <>
              <motion.div
                className="mt-16"
                initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="mb-4 text-[9px] uppercase tracking-[0.42em] text-[#d7a247]/90">
                  Captain&apos;s Communication
                </p>

                <h1 className="max-w-[96%] text-[2.75rem] font-semibold leading-[0.95] tracking-[-0.06em] text-white">
                  Send your question to the cockpit.
                </h1>

                <div className="mt-7 h-[1px] w-20 bg-gradient-to-r from-[#d7a247] to-transparent" />

                <p className="mt-6 max-w-[92%] text-[14px] leading-7 text-white/62">
                  Η ερώτησή σας θα σταλεί ανώνυμα στον moderator και μπορεί να εμφανιστεί
                  στη ζωντανή οθόνη του Captain&apos;s Communication.
                </p>
              </motion.div>

              {errorMessage && (
                <motion.div
                  className="mt-6 rounded-3xl border border-red-400/25 bg-red-500/10 p-4 text-[13px] leading-6 text-red-100 backdrop-blur-xl"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errorMessage}
                </motion.div>
              )}

              <motion.form
                onSubmit={handleSubmit}
                className="mt-8 flex flex-1 flex-col"
                initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.18, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <label className="block rounded-[2rem] border border-white/12 bg-[#02050c]/42 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
                  <span className="mb-4 block text-[10px] uppercase tracking-[0.32em] text-[#d7a247]/90">
                    Passenger Transmission
                  </span>

                  <textarea
                    required
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    rows={7}
                    maxLength={420}
                    className="min-h-[190px] w-full resize-none bg-transparent text-[18px] leading-7 text-white outline-none placeholder:text-white/28"
                    placeholder="Γράψτε εδώ την ερώτησή σας..."
                  />

                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-[9px] uppercase tracking-[0.28em] text-white/30">
                      Anonymous
                    </span>

                    <span className="text-[9px] uppercase tracking-[0.28em] text-white/30">
                      {question.length}/420
                    </span>
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative mt-6 flex w-full items-center justify-between overflow-hidden rounded-full border border-[#d7a247]/35 bg-[#02050c]/46 px-5 py-[16px] text-[#f7f1e6] shadow-[0_18px_70px_rgba(0,0,0,0.45)] backdrop-blur-2xl disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#d7a247]/14 via-white/7 to-transparent" />

                  <span className="relative z-10 text-[10px] font-medium uppercase tracking-[0.32em]">
                    {loading ? "Transmitting" : "Send Transmission"}
                  </span>

                  <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[#d7a247]/35 bg-[#d7a247]/10 text-[#f7d27a]">
                    <Send className="h-4 w-4" />
                  </span>
                </button>

                <p className="mt-5 text-center text-[8px] uppercase tracking-[0.32em] text-white/28">
                  OMMTo...New Horizons
                </p>
              </motion.form>
            </>
          ) : (
            <motion.div
              className="flex flex-1 flex-col items-center justify-center text-center"
              initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#d7a247]/35 bg-[#d7a247]/10 text-[#f7d27a] shadow-[0_0_55px_rgba(215,162,71,0.18)]">
                <CheckCircle2 className="h-10 w-10" />
              </div>

              <p className="mt-10 text-[9px] uppercase tracking-[0.42em] text-[#d7a247]/90">
                Transmission Received
              </p>

              <h1 className="mt-5 max-w-[92%] text-[2.45rem] font-semibold leading-[0.95] tracking-[-0.055em] text-white">
                Your question has reached the cockpit.
              </h1>

              <p className="mt-7 max-w-[88%] text-[14px] leading-7 text-white/62">
                Η ερώτησή σας καταχωρήθηκε επιτυχώς και βρίσκεται σε αναμονή έγκρισης
                από τον moderator.
              </p>

              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-10 rounded-full border border-[#d7a247]/30 bg-[#02050c]/48 px-6 py-4 text-[10px] uppercase tracking-[0.3em] text-[#f7f1e6] backdrop-blur-2xl"
              >
                Send another question
              </button>
            </motion.div>
          )}
        </div>
      </section>
    </main>
  );
}

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

      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(255,255,255,0.10)_0%,transparent_34%)] opacity-45"
        animate={{ opacity: [0.25, 0.45, 0.25], scale: [1, 1.06, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute inset-0 opacity-25 mix-blend-screen"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(247,210,122,0.55) 1px, transparent 1px)",
          backgroundSize: "46px 46px",
        }}
        animate={{ x: [0, -18, 0], y: [0, 22, 0], opacity: [0.12, 0.25, 0.12] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
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
