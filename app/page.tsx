const stats = [
  { label: "Scheduled this week", value: "42", delta: "+18%", tone: "violet" },
  { label: "Engagement rate", value: "7.4%", delta: "+1.3%", tone: "emerald" },
  { label: "Assets approved", value: "19", delta: "+6", tone: "amber" },
  { label: "Pending reviews", value: "08", delta: "-3", tone: "rose" },
];

const schedule = [
  {
    day: "Mon",
    date: "22",
    posts: [
      { title: "Launch teaser", channel: "Instagram", time: "09:00", status: "Queued" },
      { title: "Newsletter", channel: "Email", time: "14:00", status: "Ready" },
    ],
  },
  {
    day: "Tue",
    date: "23",
    posts: [
      { title: "Customer story", channel: "LinkedIn", time: "11:30", status: "Draft" },
      { title: "Product update", channel: "X", time: "18:00", status: "Scheduled" },
    ],
  },
  {
    day: "Wed",
    date: "24",
    posts: [
      { title: "Reel script", channel: "TikTok", time: "08:45", status: "Review" },
    ],
  },
  {
    day: "Thu",
    date: "25",
    posts: [
      { title: "Case study", channel: "Blog", time: "10:00", status: "Ready" },
      { title: "Webinar invite", channel: "LinkedIn", time: "16:00", status: "Queued" },
    ],
  },
  {
    day: "Fri",
    date: "26",
    posts: [{ title: "Weekend recap", channel: "Instagram", time: "12:00", status: "Scheduled" }],
  },
];

const queue = [
  { title: "Spring campaign launch", type: "Campaign", owner: "Maya", due: "Today" },
  { title: "Creator collab brief", type: "Brief", owner: "Leo", due: "Tomorrow" },
  { title: "CTA A/B test copy", type: "Copy", owner: "Jin", due: "Thu" },
  { title: "SEO blog refresh", type: "Article", owner: "Ari", due: "Fri" },
];

const channels = [
  { name: "Instagram", value: 82, color: "bg-pink-500" },
  { name: "LinkedIn", value: 68, color: "bg-sky-500" },
  { name: "Email", value: 74, color: "bg-violet-500" },
  { name: "X", value: 46, color: "bg-slate-700" },
];

const tasks = [
  "Finalize hero visuals for launch",
  "Review paid social captions",
  "Approve customer quote shortlist",
  "Schedule webinar reminder emails",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#eef2ff,_#f8fafc_35%,_#f1f5f9_100%)] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 text-lg font-bold text-white shadow-lg shadow-violet-200">
              S
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Studio</p>
              <h1 className="text-lg font-semibold text-slate-900">Scheduler</h1>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#" className="text-slate-900">Overview</a>
            <a href="#">Calendar</a>
            <a href="#">Campaigns</a>
            <a href="#">Reports</a>
          </nav>

          <div className="flex items-center gap-3">
            <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
              Export
            </button>
            <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-slate-200 transition hover:bg-slate-800">
              New post
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-violet-600">Content calendar</p>
            <h2 className="text-4xl font-semibold tracking-tight text-slate-900">Q3 content plan</h2>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-800">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            14 assets ready to publish
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.3)]">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-slate-500">{stat.label}</span>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    stat.tone === "violet"
                      ? "bg-violet-100 text-violet-700"
                      : stat.tone === "emerald"
                        ? "bg-emerald-100 text-emerald-700"
                        : stat.tone === "amber"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {stat.delta}
                </span>
              </div>
              <div className="text-3xl font-semibold tracking-tight text-slate-900">{stat.value}</div>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_35px_-22px_rgba(15,23,42,0.35)]">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900">Week at a glance</h3>
              <button className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600">This week</button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {schedule.map((day) => (
                <div key={day.day} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">{day.day}</span>
                    <span className="text-xs text-slate-500">{day.date}</span>
                  </div>

                  <div className="space-y-2">
                    {day.posts.map((post) => (
                      <div key={`${day.day}-${post.title}`} className="rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-slate-100">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-slate-800">{post.title}</p>
                          <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-700">
                            {post.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          {post.channel} · {post.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_35px_-22px_rgba(15,23,42,0.35)]">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900">Channel mix</h3>
                <span className="text-sm text-slate-500">Live</span>
              </div>

              <div className="space-y-4">
                {channels.map((channel) => (
                  <div key={channel.name}>
                    <div className="mb-1.5 flex items-center justify-between text-sm text-slate-600">
                      <span>{channel.name}</span>
                      <span>{channel.value}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div className={`${channel.color} h-full rounded-full`} style={{ width: `${channel.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-900 p-5 text-white shadow-[0_18px_35px_-22px_rgba(15,23,42,0.55)]">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold">Priority tasks</h3>
                <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-medium text-slate-200">4 left</span>
              </div>

              <ul className="space-y-3">
                {tasks.map((task) => (
                  <li key={task} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <span className="text-sm text-slate-100">{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_35px_-22px_rgba(15,23,42,0.35)]">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900">Upcoming queue</h3>
              <button className="text-sm font-medium text-violet-600">View all</button>
            </div>

            <div className="space-y-3">
              {queue.map((item) => (
                <div key={item.title} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                      <span>{item.type}</span>
                      <span>•</span>
                      <span>{item.owner}</span>
                    </div>
                  </div>
                  <div className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
                    {item.due}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_35px_-22px_rgba(15,23,42,0.35)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900">Performance</h3>
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">+24.8%</span>
            </div>

            <div className="space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                  <span>Reach</span>
                  <span>89k</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-[89%] rounded-full bg-violet-500" />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                  <span>CTR</span>
                  <span>4.8%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-[72%] rounded-full bg-sky-500" />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                  <span>Conversions</span>
                  <span>312</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-[68%] rounded-full bg-emerald-500" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
