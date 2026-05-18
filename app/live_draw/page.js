export default function LiveDrawPage() {
  return (
    <main className="min-h-screen bg-white text-black flex items-center justify-center">
      <div className="text-center">
        <p className="uppercase tracking-[0.4em] text-gray-400 text-sm">
          Live Giveaway
        </p>

        <h1 className="text-5xl font-bold mt-4">
          Aviation Experience Draw
        </h1>

        <p className="mt-6 text-gray-600">
          The winner announcement screen will appear here.
        </p>

        <button className="mt-10 px-8 py-4 bg-black text-white rounded-full hover:opacity-80 transition">
          Start Draw
        </button>
      </div>
    </main>
  );
}