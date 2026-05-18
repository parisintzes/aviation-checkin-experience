"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function CheckInPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ticketCode, setTicketCode] = useState("");

  const generateTicketCode = () => {
    return "AV-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const code = generateTicketCode();
    setLoading(true);

    const { error } = await supabase.from("participants").insert([
      {
        full_name: fullName,
        email: email,
      },
    ]);

    setLoading(false);

    if (!error) {
      setTicketCode(code);
      setSuccess(true);
    } else {
      alert(error?.message || "Check-in failed. Please try again.");
      console.log("SUPABASE ERROR:", error);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      {/* Background atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1f2937_0%,#050505_42%,#000_100%)]" />
      <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[360px] w-[360px] bg-white/5 blur-3xl" />

      {/* Grid lines */}
      <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:42px_42px]" />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          {/* Top label */}
          <div className="mb-8 flex items-center justify-between text-xs uppercase tracking-[0.32em] text-zinc-500">
            <span>Gate A26</span>
            <span>Live Draw</span>
          </div>

          {!success ? (
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl">
              <div className="mb-8 border-b border-white/10 pb-6">
                <p className="mb-3 text-xs uppercase tracking-[0.45em] text-cyan-200/70">
                  Passenger Check-In
                </p>

                <h1 className="text-4xl font-semibold leading-tight">
                  Aviation
                  <br />
                  Boarding Pass
                </h1>

                <p className="mt-4 text-sm leading-6 text-zinc-400">
                  Enter your details to generate your digital boarding pass for
                  the live giveaway experience.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">
                    Passenger Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full name"
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-200/60"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-cyan-200/60"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 w-full rounded-2xl bg-white px-5 py-4 text-sm font-semibold uppercase tracking-[0.22em] text-black transition hover:bg-cyan-100 disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Generate Boarding Pass"}
                </button>
              </form>

              <div className="mt-8 flex justify-between border-t border-white/10 pt-5 text-[10px] uppercase tracking-[0.25em] text-zinc-600">
                <span>Check-In Open</span>
                <span>Secure Entry</span>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[2rem] border border-cyan-200/30 bg-white text-black shadow-2xl">
              <div className="bg-black px-6 py-5 text-white">
                <p className="text-xs uppercase tracking-[0.45em] text-cyan-200/80">
                  Boarding Pass Confirmed
                </p>
                <h2 className="mt-3 text-3xl font-semibold">
                  You are checked in.
                </h2>
              </div>

              <div className="p-6">
                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-400">
                      Passenger
                    </p>
                    <p className="mt-1 text-lg font-semibold">{fullName}</p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-400">
                      Gate
                    </p>
                    <p className="mt-1 text-lg font-semibold">A26</p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-400">
                      Ticket
                    </p>
                    <p className="mt-1 text-lg font-semibold">{ticketCode}</p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-400">
                      Status
                    </p>
                    <p className="mt-1 text-lg font-semibold text-green-700">
                      Eligible
                    </p>
                  </div>
                </div>

                <div className="border-t border-dashed border-zinc-300 pt-5">
                  <div className="h-16 rounded-xl bg-[repeating-linear-gradient(90deg,#000_0px,#000_3px,transparent_3px,transparent_8px)] opacity-80" />
                  <p className="mt-4 text-center text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                    Keep this screen until the live draw
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}