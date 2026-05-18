"use client";

import { useEffect, useState } from "react";

export default function LiveDrawPage() {
  const [participants, setParticipants] = useState(284);
  const [winner, setWinner] = useState(null);
  const [drawing, setDrawing] = useState(false);

  const names = [
    "Antonios Giannopoulos",
    "Paris Intzesiloglou",
    "Chrysoula Chatzigeorgiou",
    "Mike",
  ];

  const startDraw = () => {
    setDrawing(true);

    setTimeout(() => {
      const randomWinner =
        names[Math.floor(Math.random() * names.length)];

      setWinner(randomWinner);
      setDrawing(false);
    }, 4000);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      
      <div className="absolute inset-0 opacity-10">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,150,255,0.12),transparent_60%)]" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">

        <div className="mb-6 text-center">
          <p className="mb-3 tracking-[0.45em] text-xs uppercase text-white/40">
            Aviation Experience Live Draw
          </p>

          <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
            LIVE BOARDING
          </h1>

          <p className="mt-5 text-white/50">
            Flight AX-2026 · Thessaloniki → Innovation
          </p>
        </div>

        <div className="mb-10 w-full max-w-xl rounded-[40px] border border-white/10 bg-white/5 p-10 backdrop-blur-2xl">

          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                Passenger Count
              </p>

              <h2 className="mt-2 text-4xl font-bold">
                {participants}
              </h2>
            </div>

            <div className="relative flex h-20 w-20 items-center justify-center">
              <div className="absolute h-20 w-20 animate-ping rounded-full bg-cyan-400/20" />
              <div className="h-5 w-5 rounded-full bg-cyan-300 shadow-[0_0_40px_rgba(34,211,238,1)]" />
            </div>
          </div>

          <div className="mt-8 text-center">

            {!winner && !drawing && (
              <button
                onClick={startDraw}
                className="rounded-full border border-white/20 bg-white px-10 py-4 text-sm font-semibold uppercase tracking-[0.3em] text-black transition hover:scale-105"
              >
                Initiate Live Boarding
              </button>
            )}

            {drawing && (
              <div className="space-y-5">
                <div className="mx-auto h-20 w-20 animate-spin rounded-full border border-cyan-300 border-t-transparent" />

                <p className="tracking-[0.3em] text-cyan-200 uppercase text-sm">
                  Selecting Passenger...
                </p>
              </div>
            )}

            {winner && (
              <div className="space-y-6">

                <div className="rounded-[30px] border border-cyan-400/30 bg-cyan-400/10 p-8 shadow-[0_0_80px_rgba(34,211,238,0.2)]">

                  <p className="mb-4 text-xs uppercase tracking-[0.35em] text-cyan-200">
                    Boarding Confirmed
                  </p>

                  <h2 className="text-4xl font-bold">
                    {winner}
                  </h2>

                  <p className="mt-4 text-white/50">
                    Selected for the Aviation Experience Giveaway
                  </p>
                </div>

                <button
                  onClick={() => setWinner(null)}
                  className="text-sm uppercase tracking-[0.25em] text-white/40 hover:text-white"
                >
                  Reset Draw
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}