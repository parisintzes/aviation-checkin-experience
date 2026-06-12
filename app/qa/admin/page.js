"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, RefreshCw, Radio } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function ModeratorConsole() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchQuestions() {
    setLoading(true);

    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setQuestions(data || []);
    }

    setLoading(false);
  }

  async function approveQuestion(id) {
    await supabase
      .from("questions")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        rejected_at: null,
      })
      .eq("id", id);

    fetchQuestions();
  }

  async function rejectQuestion(id) {
    await supabase
      .from("questions")
      .update({
        status: "rejected",
        rejected_at: new Date().toISOString(),
        approved_at: null,
        is_current: false,
      })
      .eq("id", id);

    fetchQuestions();
  }

  async function setLiveQuestion(id) {
    await supabase.from("questions").update({ is_current: false }).neq("id", id);

    await supabase
      .from("questions")
      .update({
        status: "approved",
        is_current: true,
        approved_at: new Date().toISOString(),
      })
      .eq("id", id);

    fetchQuestions();
  }

  useEffect(() => {
    fetchQuestions();

    const channel = supabase
      .channel("questions-moderator")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "questions" },
        () => {
          fetchQuestions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const pending = questions.filter((q) => q.status === "pending");
  const approved = questions.filter((q) => q.status === "approved");
  const rejected = questions.filter((q) => q.status === "rejected");

  return (
    <main className="min-h-screen bg-[#02050c] text-white">
      <div className="relative min-h-screen overflow-hidden px-6 py-8">
        <Background />

        <section className="relative z-10 mx-auto max-w-6xl">
          <header className="mb-10 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.45em] text-[#d7a247]/90">
                OMMT Airlines
              </p>

              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em]">
                Moderator Console
              </h1>

              <p className="mt-3 text-sm leading-6 text-white/48">
                Review, approve and clear passenger transmissions before they appear on the live screen.
              </p>
            </div>

            <button
              onClick={fetchQuestions}
              className="flex items-center gap-3 rounded-full border border-[#d7a247]/30 bg-[#d7a247]/10 px-5 py-3 text-[10px] uppercase tracking-[0.3em] text-[#f7d27a]"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </header>

          <div className="grid gap-6 lg:grid-cols-3">
            <QuestionColumn
              title="Incoming"
              subtitle="Pending Transmissions"
              count={pending.length}
              questions={pending}
              loading={loading}
              actions={(question) => (
                <>
                  <button
                    onClick={() => approveQuestion(question.id)}
                    className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-emerald-200"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => rejectQuestion(question.id)}
                    className="rounded-full border border-red-400/25 bg-red-500/10 px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-red-200"
                  >
                    Reject
                  </button>
                </>
              )}
            />

            <QuestionColumn
              title="Cleared"
              subtitle="Approved Questions"
              count={approved.length}
              questions={approved}
              loading={loading}
              actions={(question) => (
                <button
                  onClick={() => setLiveQuestion(question.id)}
                  className={`rounded-full border px-4 py-3 text-[10px] uppercase tracking-[0.22em] ${
                    question.is_current
                      ? "border-[#d7a247]/40 bg-[#d7a247]/20 text-[#f7d27a]"
                      : "border-white/15 bg-white/5 text-white/70"
                  }`}
                >
                  {question.is_current ? "On Air" : "Set Live"}
                </button>
              )}
            />

            <QuestionColumn
              title="Rejected"
              subtitle="Filtered Transmissions"
              count={rejected.length}
              questions={rejected}
              loading={loading}
              actions={(question) => (
                <button
                  onClick={() => approveQuestion(question.id)}
                  className="rounded-full border border-[#d7a247]/25 bg-[#d7a247]/10 px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-[#f7d27a]"
                >
                  Restore
                </button>
              )}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function QuestionColumn({ title, subtitle, count, questions, loading, actions }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
      <div className="mb-5 flex items-start justify-between border-b border-white/10 pb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.34em] text-[#d7a247]/85">
            {title}
          </p>

          <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em]">
            {subtitle}
          </h2>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d7a247]/25 bg-[#d7a247]/10 text-sm text-[#f7d27a]">
          {count}
        </div>
      </div>

      <div className="space-y-4">
        {loading && (
          <p className="text-sm text-white/40">Loading transmissions...</p>
        )}

        {!loading && questions.length === 0 && (
          <p className="text-sm leading-6 text-white/36">
            No transmissions in this channel.
          </p>
        )}

        {questions.map((question, index) => (
          <motion.article
            key={question.id}
            className="rounded-[1.6rem] border border-white/10 bg-[#02050c]/48 p-5"
            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: index * 0.04, duration: 0.45 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2 text-[9px] uppercase tracking-[0.28em] text-white/34">
                <Radio className="h-3 w-3 text-[#d7a247]" />
                Transmission
              </span>

              <StatusBadge status={question.status} isCurrent={question.is_current} />
            </div>

            <p className="text-[15px] leading-7 text-white/82">
              {question.question}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              {actions(question)}
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status, isCurrent }) {
  if (isCurrent) {
    return (
      <span className="rounded-full border border-[#d7a247]/30 bg-[#d7a247]/10 px-3 py-1 text-[8px] uppercase tracking-[0.24em] text-[#f7d27a]">
        On Air
      </span>
    );
  }

  if (status === "approved") {
    return (
      <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[8px] uppercase tracking-[0.24em] text-emerald-200">
        Approved
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-[8px] uppercase tracking-[0.24em] text-red-200">
        Rejected
      </span>
    );
  }

  return (
    <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[8px] uppercase tracking-[0.24em] text-white/45">
      Pending
    </span>
  );
}

function Background() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(215,162,71,0.18),transparent_42%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#071a33]/55 via-[#02050c] to-[#010309]" />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.05)_46%,transparent_58%)] opacity-40" />
    </div>
  );
}

/*
============================================================
OMMT AIRLINES — LIVE Q&A SYSTEM ARCHITECTURE
============================================================

Η λειτουργία του Live Q&A διαχωρίζεται σε τρία διαφορετικά
περιβάλλοντα (routes), ώστε κάθε τμήμα του συστήματος να
εξυπηρετεί έναν ξεκάθαρο λειτουργικό ρόλο.

Η αρχιτεκτονική αυτή βελτιώνει:

- Την εμπειρία χρήστη
- Την ασφάλεια του περιεχομένου
- Τη διαχειρισιμότητα του συστήματος
- Τη μελλοντική επεκτασιμότητα

------------------------------------------------------------
ROUTE 1 — /qa
PARTICIPANT ENVIRONMENT
------------------------------------------------------------

Περιβάλλον συμμετεχόντων.

Οι επισκέπτες σαρώνουν το QR code και μεταφέρονται
στη φόρμα υποβολής ερωτήσεων.

Κύριες λειτουργίες:

- Εισαγωγή ερώτησης
- Αποστολή ερώτησης στη βάση δεδομένων
- Mobile-first εμπειρία χρήσης

------------------------------------------------------------
ROUTE 2 — /qa/admin
MODERATOR ENVIRONMENT
------------------------------------------------------------

Περιβάλλον διαχείρισης ερωτήσεων.

Χρησιμοποιείται από τον moderator ή την οργανωτική
ομάδα κατά τη διάρκεια της εκδήλωσης.

Κύριες λειτουργίες:

- Προβολή όλων των ερωτήσεων
- Έγκριση ερωτήσεων
- Απόρριψη ερωτήσεων
- Απόκρυψη περιεχομένου
- Διαχείριση ροής συζήτησης

Καμία ερώτηση δεν εμφανίζεται δημόσια χωρίς έγκριση.

------------------------------------------------------------
ROUTE 3 — /qa/live
PRESENTATION ENVIRONMENT
------------------------------------------------------------

Περιβάλλον προβολής συνεδρίου.

Το συγκεκριμένο route προβάλλεται στις οθόνες
της εκδήλωσης.

Κύριες λειτουργίες:

- Προβολή μόνο εγκεκριμένων ερωτήσεων
- Real-time ενημέρωση
- Καθαρό περιβάλλον παρουσίασης
- Χωρίς δυνατότητες επεξεργασίας

------------------------------------------------------------
SYSTEM FLOW
------------------------------------------------------------

Participant
      │
      ▼
   /qa
      │
      ▼
  Supabase
      │
      ▼
 /qa/admin
      │
      ▼
 /qa/live
      │
      ▼
 Conference Screen

------------------------------------------------------------
OMMT AIRLINES PHILOSOPHY
------------------------------------------------------------

Το σύστημα σχεδιάστηκε με λογική αντίστοιχη των
σύγχρονων conference platforms, προσφέροντας
ασφαλή και επαγγελματική διαχείριση του live
interaction μεταξύ κοινού και ομιλητών.

============================================================
*/
