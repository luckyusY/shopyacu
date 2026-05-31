type InstagramProfileCardProps = {
  compact?: boolean;
};

const instagramUrl = "https://www.instagram.com/shopyacu/";

export function InstagramProfileCard({ compact = false }: InstagramProfileCardProps) {
  return (
    <section className={compact ? "mx-auto max-w-7xl px-3 pb-10 sm:px-6 sm:pb-12 lg:px-8" : "mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8"}>
      <div className="overflow-hidden rounded-3xl bg-[#e1302f] text-white shadow-2xl shadow-[#e1302f]/20">
        <div className={`grid gap-5 p-5 sm:p-7 ${compact ? "lg:grid-cols-[1fr_auto]" : "lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:p-9"}`}>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Instagram shop</p>
            <h2 className={`${compact ? "mt-2 text-2xl sm:text-3xl" : "mt-3 text-3xl sm:text-5xl"} font-display font-black leading-tight`}>
              See more products on Instagram.
            </h2>
            <p className={`${compact ? "mt-3" : "mt-4"} max-w-2xl text-sm font-semibold leading-7 text-white/78`}>
              Follow <span className="font-black text-white">@shopyacu</span> for new arrivals, short product videos, customer updates, and quick deals before they reach the website.
            </p>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white p-3 text-ink shadow-xl">
            <div className="flex items-center gap-3">
              <div className="grid h-16 w-16 flex-none place-items-center rounded-full bg-[#e1302f] text-xl font-black text-white ring-4 ring-[#ffcf33]">
                S
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-xl font-black">@shopyacu</p>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Live profile on Instagram</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                ["Profile", "official"],
                ["Followers", "live"],
                ["Updates", "daily"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl bg-surface px-2 py-3">
                  <p className="text-sm font-black text-ink">{value}</p>
                  <p className="mt-1 text-[0.62rem] font-black uppercase tracking-[0.12em] text-muted">{label}</p>
                </div>
              ))}
            </div>

            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex min-h-12 w-full items-center justify-center rounded-full bg-[#e1302f] px-5 text-sm font-black text-white transition hover:bg-ink"
            >
              Open @shopyacu on Instagram
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
