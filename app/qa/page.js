"use client";

/*
  ============================================================
  SECTION 1 — IMPORTS
  ============================================================
*/

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle2, Radio } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

/*
  ============================================================
  SECTION 2 — MAIN PASSENGER Q&A PAGE
  ============================================================
*/

export default function PassengerQAPage() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /*
    ============================================================
    SECTION 3 — QUESTION SUBMISSION HANDLER
    ============================================================
  */

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    const cleanQuestion = question.trim();

    if (!cleanQuestion) {
      setErrorMessage("Παρακαλούμε πληκτρολογήστε την ερώτησή σας πριν από την αποστολή.");
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

  /*
    ============================================================
    SECTION 4 — PAGE STRUCTURE
    ============================================================
  */

  return (
    <main className="fixed inset-0 h-[100dvh] w-screen overflow-hidden bg-[#02050c] text-white">
      <section className="relative mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-[#06152a]">
        <AviationBackground />

        <div className="relative z-10 flex flex-1 flex-col px-7 pb-7 pt-8">
          <TopChannelBar />

          {!submitted ? (
            <QuestionSubmissionView
              question={question}
              setQuestion={setQuestion}
              loading={loading}
              errorMessage={errorMessage}
              handleSubmit={handleSubmit}
            />
          ) : (
            <SuccessView onReset={() => setSubmitted(false)} />
          )}
        </div>
      </section>
    </main>
  );
}

/*
  ============================================================
  SECTION 5 — TOP CHANNEL BAR
  ============================================================
*/

function TopChannelBar() {
  return (
    <header className="flex items-center justify-between">
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d7a247]/30 bg-[#d7a247]/10 text-[#f7d27a]">
        <Radio className="h-4 w-4" />
      </div>

      <p className="text-[9px] uppercase tracking-[0.34em] text-white/34">
        Live Discussion Channel
      </p>
    </header>
  );
}

/*
  ============================================================
  SECTION 6 — QUESTION SUBMISSION VIEW
  ============================================================
*/

function QuestionSubmissionView({
  question,
  setQuestion,
  loading,
  errorMessage,
  handleSubmit,
}) {
  return (
    <>
      <HeroSection />

      {errorMessage && <ErrorMessage message={errorMessage} />}

      <TransmissionForm
        question={question}
        setQuestion={setQuestion}
        loading={loading}
        handleSubmit={handleSubmit}
      />
    </>
  );
}

/*
  ============================================================
  SECTION 7 — HERO SECTION
  ============================================================
*/

function HeroSection() {
  return (
    <motion.div
      className="mt-14"
      initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="mb-4 text-[9px] uppercase tracking-[0.42em] text-[#d7a247]/90">
        Audience Communication Channel
      </p>

      <h1 className="max-w-[96%] text-[2.42rem] font-semibold leading-[0.95] tracking-[-0.06em] text-white">
        Transmit Your Question.
      </h1>

      <div className="mt-7 h-[1px] w-20 bg-gradient-to-r from-[#d7a247] to-transparent" />

      <p className="mt-6 max-w-[94%] text-[13.5px] leading-7 text-white/62">
        Η ερώτηση σας μεταδίδεται ανώνυμα στο κεντρικό σύστημα επικοινωνίας του
        OMMT Airlines και, εφόσον εγκριθεί, μπορεί να προβληθεί ζωντανά κατά τη
        διάρκεια του ταξιδιού. Για τη βέλτιστη διαχείριση των εισερχόμενων
        μεταδόσεων, παρακαλούμε να διατυπώσετε την ερώτησή σας στην ελληνική
        γλώσσα.
      </p>
    </motion.div>
  );
}

/*
  ============================================================
  SECTION 8 — ERROR MESSAGE
  ============================================================
*/

function ErrorMessage({ message }) {
  return (
    <motion.div
      className="mt-6 rounded-3xl border border-red-400/20 bg-red-500/10 p-4 text-[13px] leading-6 text-red-100 backdrop-blur-xl"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {message}
    </motion.div>
  );
}

/*
  ============================================================
  SECTION 9 — TRANSMISSION FORM
  ============================================================
*/

function TransmissionForm({ question, setQuestion, loading, handleSubmit }) {
  return (
    <motion.form
      onSubmit={handleSubmit}
      className="mt-7 flex flex-1 flex-col"
      initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ delay: 0.18, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <label className="block rounded-[2rem] border border-white/12 bg-[#02050c]/42 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
        <span className="mb-4 block text-[10px] uppercase tracking-[0.32em] text-[#d7a247]/90">
          Audience Transmission
        </span>

        <textarea
          required
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={7}
          maxLength={420}
          className="min-h-[190px] w-full resize-none bg-transparent text-[17px] leading-7 text-white outline-none placeholder:text-white/28"
          placeholder="Πληκτρολογήστε την ερώτηση σας..."
        />

        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-[8px] uppercase tracking-[0.24em] text-white/30">
            Anonymous · Greek Required
          </span>

          <span className="text-[9px] uppercase tracking-[0.28em] text-white/30">
            {question.length}/420
          </span>
        </div>
      </label>

      <GroundCrewNotice />

      <button
        type="submit"
        disabled={loading}
        className="group relative mt-6 flex w-full items-center justify-between overflow-hidden rounded-full border border-[#d7a247]/35 bg-[#02050c]/46 px-5 py-[16px] text-[#f7f1e6] shadow-[0_18px_70px_rgba(0,0,0,0.45)] backdrop-blur-2xl disabled:opacity-50"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#d7a247]/14 via-white/7 to-transparent" />

        <span className="relative z-10 text-[10px] font-medium uppercase tracking-[0.32em]">
          {loading ? "Transmitting..." : "Transmit Question"}
        </span>

        <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[#d7a247]/35 bg-[#d7a247]/10 text-[#f7d27a]">
          <Send className="h-4 w-4" />
        </span>
      </button>

      <BrandSignature />
    </motion.form>
  );
}

/*
  ============================================================
  SECTION 10 — GROUND CREW NOTICE
  ============================================================
*/

function GroundCrewNotice() {
  return (
    <div className="mt-5 rounded-[1.6rem] border border-[#d7a247]/14 bg-[#02050c]/34 p-4 backdrop-blur-xl">
      <p className="text-[9px] uppercase tracking-[0.32em] text-[#d7a247]/80">
        Ground Crew Review Required
      </p>

      <p className="mt-3 text-[12.5px] leading-6 text-white/44">
        Οι εισερχόμενες μεταδόσεις αξιολογούνται πριν προωθηθούν στη ζωντανή
        συζήτηση.
      </p>
    </div>
  );
}

/*
  ============================================================
  SECTION 11 — SUCCESS VIEW
  ============================================================
*/

function SuccessView({ onReset }) {
  return (
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

      <h1 className="mt-5 max-w-[92%] text-[2.35rem] font-semibold leading-[0.95] tracking-[-0.055em] text-white">
        Η μετάδοσή σας καταχωρήθηκε επιτυχώς.
      </h1>

      <p className="mt-7 max-w-[88%] text-[14px] leading-7 text-white/62">
        Η μετάδοσή σας βρίσκεται σε αναμονή αξιολόγησης από το πλήρωμα εδάφους.
        Εφόσον εγκριθεί, μπορεί να προωθηθεί στη ζωντανή συζήτηση και να
        προβληθεί στην κεντρική οθόνη επικοινωνίας.
      </p>

      <button
        type="button"
        onClick={onReset}
        className="mt-10 rounded-full border border-[#d7a247]/30 bg-[#02050c]/48 px-6 py-4 text-[10px] uppercase tracking-[0.3em] text-[#f7f1e6] backdrop-blur-2xl"
      >
        Transmit Another Question
      </button>

      <BrandSignature />
    </motion.div>
  );
}

/*
  ============================================================
  SECTION 12 — BRAND SIGNATURE
  Κρατάει πάντα το μικρό "o" στο OMMTo.
  ============================================================
*/

function BrandSignature() {
  return (
    <p className="mt-5 text-center text-[8px] tracking-[0.32em] text-white/28">
      OMMT<span className="lowercase">o</span>...New Horizons
    </p>
  );
}

/*
  ============================================================
  SECTION 13 — AVIATION BACKGROUND SYSTEM
  ============================================================
*/

function AviationBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0 scale-[1.08] bg-[url('/textures/cloud-flight-bg.webp')] bg-cover bg-center"
        animate={{
          scale: [1.08, 1.14, 1.08],
          x: [0, -10, 0],
          y: [0, 12, 0],
        }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-[#020713]/35 via-[#071a33]/25 to-[#02050c]/95" />

      <motion.div
        className="absolute right-[-25%] top-[18%] h-[460px] w-[460px] rounded-full bg-[#d7a247]/25 blur-3xl"
        animate={{
          opacity: [0.35, 0.75, 0.35],
          scale: [1, 1.08, 1],
        }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.08)_46%,transparent_58%)]" />

      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(255,255,255,0.10)_0%,transparent_34%)] opacity-45"
        animate={{
          opacity: [0.25, 0.45, 0.25],
          scale: [1, 1.06, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

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
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute bottom-0 left-0 right-0 h-[52%] bg-gradient-to-t from-[#02050c] via-[#02050c]/88 to-transparent" />

      <motion.div
        className="absolute bottom-[14%] left-[-25%] h-28 w-[150%] rounded-[50%] border-t border-[#d7a247]/20"
        animate={{
          x: [0, 14, 0],
          opacity: [0.16, 0.34, 0.16],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
