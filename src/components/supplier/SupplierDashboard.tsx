'use client';
// The Supplier Portal preview: the screen on the truck in SupplierChaosFlow, which lifts off and
// becomes this full product view. Once in place (`live`), a guided tour plays like a product video:
// a cursor takes a WhatsApp order from arrival through confirmation, packing, dispatch, ePOD and
// payout. Any click hands control to the visitor; everything stays clickable (⌘K palette, orders,
// the route map, reorders, Tally sync). Sample data. State: ./supplier-dashboard-data.ts.
// Styles: app/supplier/supplier-flow.css (.sdb-*)
import { useEffect, useMemo, useReducer, useRef, useState, type Dispatch } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import {
  init, reducer, rupees, orderTotal, itemsSummary, isOpen, STEPS, KPI, SERIES, BASE_ESCROW, INCOMING,
  type Action, type State, type Status, type Channel as ChannelT, type View, type Range, type Filter, type Order, type Van, type FeedKind, type Series,
} from './supplier-dashboard-data';
import { niceMax, smooth } from './chart-utils';

const ui = Geist({ subsets: ['latin'], variable: '--font-ui', display: 'swap' });
const uiMono = Geist_Mono({ subsets: ['latin'], variable: '--font-ui-mono', display: 'swap' });

type P = { s: State; d: Dispatch<Action> };

/* ───────────── icons (24px grid, 1.6 stroke) ───────────── */
const I = {
  home: 'M3.5 10.5L12 4l8.5 6.5V19a1 1 0 0 1-1 1H15v-5.5H9V20H4.5a1 1 0 0 1-1-1z',
  orders: 'M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01',
  dispatch: 'M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3.2v2.8h-7M7 18.5a1.5 1.5 0 1 0 0-.01M17 18.5a1.5 1.5 0 1 0 0-.01',
  inventory: 'M12 3.5l8 4.5v8l-8 4.5L4 16V8zM4 8l8 4.5L20 8M12 12.5v8',
  crates: 'M4 9.5h16V19H4zM4 9.5L6 5h12l2 4.5M9.5 13.5h5',
  invoices: 'M7 3.5h10v17l-2.5-1.5-2.5 1.5-2.5-1.5L7 20.5zM10 8.5h4M10 12h4M10 15.5h2.5',
  payouts: 'M3.5 9.5L12 4l8.5 5.5M5.5 10v7.5M10 10v7.5M14 10v7.5M18.5 10v7.5M3.5 20h17',
  search: 'M10.5 17.5a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4.5-4.5',
  plus: 'M12 5v14M5 12h14',
  export: 'M12 15V4.5M8 8.5l4-4 4 4M5 14.5V19h14v-4.5',
  close: 'M6.5 6.5l11 11M17.5 6.5l-11 11',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  chat: 'M4.5 19.5l1.2-3.6A7.8 7.8 0 1 1 8.4 18.4z',
  portal: 'M3.5 5h17v11h-17zM9 20h6M12 16v4',
  mic: 'M12 3.5a3 3 0 0 0-3 3V12a3 3 0 0 0 6 0V6.5a3 3 0 0 0-3-3zM5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5',
  updown: 'M8 9.5l4-4 4 4M8 14.5l4 4 4-4',
  bell: 'M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0',
  help: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17zM9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.7M12 17h.01',
  label: 'M7 9V3.5h10V9M7 17H4.5v-7h15v7H17M7 14h10v6.5H7z',
  pen: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  coin: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17zM9 9h6M9 12h6M11 9c2.8 0 2.8 3 0 3l3.5 4',
  doc: 'M7 3.5h7l4 4v13H7zM14 3.5V8h4',
  up: 'M7 14l5-5 5 5',
  warn: 'M12 4l9 16H3zM12 10v4M12 17h.01',
  sync: 'M19.5 12A7.5 7.5 0 0 1 6 16.5M4.5 12A7.5 7.5 0 0 1 18 7.5M18 3.5v4h-4M6 20.5v-4h4',
  play: 'M8 5.5v13l10.5-6.5z',
  pause: 'M8.5 5.5v13M15.5 5.5v13',
  replay: 'M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v4h4',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 13.5l1.6 1.2-2 3.4-1.9-.8a7 7 0 0 1-2 1.2l-.3 2H11l-.3-2a7 7 0 0 1-2-1.2l-1.9.8-2-3.4 1.6-1.2a7 7 0 0 1 0-3l-1.6-1.2 2-3.4 1.9.8a7 7 0 0 1 2-1.2L11 2.5h4l.3 2a7 7 0 0 1 2 1.2l1.9-.8 2 3.4-1.6 1.2a7 7 0 0 1 0 3z',
};
function Ico({ d, s = 16 }: { d: string; s?: number }) {
  return (
    <svg className="sdb-i" width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/* ───────────── small parts ───────────── */
const TONES = [['#E5EFE8', '#2B5D3E'], ['#F2EBE1', '#7A5A2E'], ['#E6EBF2', '#33506B'], ['#F1E7EA', '#7A3D51'], ['#EBE8F3', '#4D4572'], ['#E2EDEE', '#2C5E63']];
function Avatar({ name, size = 24 }: { name: string; size?: number }) {
  const h = Array.from(name).reduce((a, c) => a + c.charCodeAt(0), 0);
  const [bg, fg] = TONES[h % TONES.length];
  const initials = name.split(/[\s&.]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return <span className="sdb-av" style={{ width: size, height: size, background: bg, color: fg, fontSize: Math.round(size * 0.38) }}>{initials}</span>;
}

const TONE: Record<Status, string> = { New: 'new', Allocated: 'prep', Packed: 'pack', 'Out for delivery': 'road', Delivered: 'done' };
function Badge({ s }: { s: Status }) {
  return <span className={`sdb-badge is-${TONE[s]}`}>{s}</span>;
}

function Channel({ c }: { c: ChannelT }) {
  const [d, k] = c === 'WhatsApp' ? [I.chat, 'wa'] : c === 'Voice note' ? [I.mic, 'vn'] : [I.portal, 'pt'];
  return <span className={`sdb-ch is-${k}`}><Ico d={d} s={14} />{c}</span>;
}

// numbers that glide to their new value
function useCount(value: number, ms = 800) {
  const [v, setV] = useState(value);
  const shown = useRef(value);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { shown.current = value; setV(value); return; }
    const a = shown.current, t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      // the frame clock can sit slightly behind t0; clamp so the ease never runs backwards
      const k = Math.max(0, Math.min(1, (now - t0) / ms)), e = 1 - (1 - k) ** 3;
      shown.current = a + (value - a) * e;
      setV(shown.current);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return v;
}

const escrowOf = (s: State) => BASE_ESCROW + s.orders.filter(isOpen).reduce((a, o) => a + orderTotal(o), 0);
const releasingOf = (s: State) => s.orders.filter((o) => o.status === 'Delivered').reduce((a, o) => a + orderTotal(o), 0);
const INCOMING_IDS = new Set(INCOMING.map((o) => o.id));

/* ───────────── shell: sidebar + top bar ───────────── */
const NAV: { id: View; label: string; d: string; group?: string }[] = [
  { id: 'home', label: 'Home', d: I.home },
  { id: 'orders', label: 'Orders', d: I.orders },
  { id: 'dispatch', label: 'Dispatch', d: I.dispatch, group: 'Operations' },
  { id: 'inventory', label: 'Inventory', d: I.inventory, group: 'Operations' },
  { id: 'crates', label: 'Crates', d: I.crates, group: 'Operations' },
  { id: 'invoices', label: 'Invoices', d: I.invoices, group: 'Finance' },
  { id: 'payouts', label: 'Payouts', d: I.payouts, group: 'Finance' },
];

function Sidebar({ s, d }: P) {
  const fresh = s.orders.filter((o) => o.status === 'New').length;
  const esc = useCount(escrowOf(s));
  let group: string | undefined;
  return (
    <aside className="sdb-side">
      <button type="button" className="sdb-ws">
        <span className="sdb-logo" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="14" height="14"><path d="M18.4 8.2A7.2 7.2 0 1 0 19.2 13H12" fill="none" stroke="#9BE2B6" strokeWidth="2.4" strokeLinecap="round" /></svg>
        </span>
        <span><b>Roast Depot</b><small>Wholesale · Bengaluru</small></span>
        <Ico d={I.updown} s={14} />
      </button>
      <nav aria-label="Portal">
        {NAV.map((n) => {
          const head = n.group && n.group !== group ? n.group : null;
          group = n.group;
          return (
            <div key={n.id}>
              {head && <p className="sdb-sec">{head}</p>}
              <button type="button" className="sdb-navb" data-tour={`nav-${n.id}`} aria-current={s.view === n.id ? 'page' : undefined} onClick={() => d({ t: 'view', v: n.id })}>
                <Ico d={n.d} />{n.label}
                {n.id === 'orders' && fresh > 0 && <em className="is-hot">{fresh}</em>}
              </button>
            </div>
          );
        })}
      </nav>
      <div className="sdb-side-foot">
        <div className="sdb-esc">
          <small>In escrow</small>
          <b>{rupees(esc)}</b>
          <span>Releases on ePOD · paid T+1</span>
        </div>
        <button type="button" className="sdb-navb"><Ico d={I.gear} />Settings</button>
      </div>
    </aside>
  );
}

function TopBar({ s, d }: P) {
  const unread = s.toasts.length > 0;
  return (
    <header className="sdb-top">
      <button type="button" className="sdb-search" data-tour="search" onClick={() => d({ t: 'palette', open: true })}>
        <Ico d={I.search} s={15} /><span>Search orders, cafés, SKUs</span><kbd>⌘K</kbd>
      </button>
      <div className="sdb-top-r">
        <span className="sdb-live"><i />Live</span>
        <button type="button" className="sdb-iconb" aria-label="Notifications"><Ico d={I.bell} />{unread && <em />}</button>
        <button type="button" className="sdb-iconb" aria-label="Help"><Ico d={I.help} /></button>
        <Avatar name="Aarav Rao" size={28} />
      </div>
    </header>
  );
}

function PageHead({ title, sub, right }: { title: string; sub: string; right?: React.ReactNode }) {
  return (
    <div className="sdb-ph">
      <div><h2>{title}</h2><p>{sub}</p></div>
      {right && <div className="sdb-ph-r">{right}</div>}
    </div>
  );
}

/* ───────────── Home ───────────── */
const compact = (n: number) => (n >= 1e5 ? `₹${+(n / 1e5).toFixed(1)}L` : n >= 1e3 ? `₹${Math.round(n / 1e3)}K` : `₹${n}`);

function RevenueChart({ series, extra }: { series: Series; extra: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 600, h: 220 });
  const [hi, setHi] = useState<number | null>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const { w, h } = size, n = series.labels.length;
  const cur = series.cur.map(([x, v], i, a) => [x, i === a.length - 1 ? v + extra : v] as [number, number]);
  const P = { l: 46, r: 14, t: 14, b: 28 };
  const max = niceMax(Math.max(...series.prev, ...cur.map((c) => c[1])));
  const X = (i: number) => P.l + (i / (n - 1)) * (w - P.l - P.r);
  const Y = (v: number) => P.t + (1 - v / max) * (h - P.t - P.b);
  const cp = cur.map(([x, v]) => [X(x), Y(v)] as [number, number]);
  const pp = series.prev.map((v, i) => [X(i), Y(v)] as [number, number]);
  const curD = smooth(cp), last = cp[cp.length - 1];
  const area = `${curD}L${last[0]},${Y(0)}L${cp[0][0]},${Y(0)}Z`;
  const curAt = (i: number) => cur.find((c) => c[0] === i)?.[1];
  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect(), px = ((e.clientX - r.left) / r.width) * w;
    setHi(Math.max(0, Math.min(n - 1, Math.round(((px - P.l) / (w - P.l - P.r)) * (n - 1)))));
  };
  const hv = hi !== null ? curAt(hi) : undefined;
  return (
    <div className="sdb-chart" ref={box} onPointerMove={move} onPointerLeave={() => setHi(null)}>
      <svg width={w} height={h} key={series.legend[0]} aria-hidden="true">
        <defs>
          <linearGradient id="sdb-area-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#15934A" stopOpacity="0.16" />
            <stop offset="1" stopColor="#15934A" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1 / 3, 2 / 3, 1].map((k) => (
          <g key={k}>
            <path d={`M${P.l},${Y(max * k)}H${w - P.r}`} className="sdb-gl" />
            <text x={P.l - 10} y={Y(max * k) + 3.5} className="sdb-yl" textAnchor="end">{compact(max * k)}</text>
          </g>
        ))}
        {series.ticks.map((i) => <text key={i} x={X(i)} y={h - 8} className="sdb-xl" textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}>{series.labels[i]}</text>)}
        <path d={smooth(pp)} className="sdb-prev" />
        <path d={area} className="sdb-area" fill="url(#sdb-area-g)" />
        <path d={curD} className="sdb-cur" pathLength={1} />
        <circle cx={last[0]} cy={last[1]} r="9" className="sdb-now-ring" />
        <circle cx={last[0]} cy={last[1]} r="3.5" className="sdb-now" />
        {hi !== null && (
          <g>
            <path d={`M${X(hi)},${P.t}V${h - P.b}`} className="sdb-hair" />
            <circle cx={X(hi)} cy={Y(series.prev[hi])} r="3.5" className="sdb-dot-prev" />
            {hv !== undefined && <circle cx={X(hi)} cy={Y(hv)} r="4" className="sdb-dot-cur" />}
          </g>
        )}
      </svg>
      {hi !== null && (
        <div className="sdb-tip" style={{ left: Math.min(w - 92, Math.max(92, X(hi))) }}>
          <b>{series.labels[hi]}</b>
          <span><i className="c" />{series.legend[0]}<em>{hv !== undefined ? rupees(hv) : '—'}</em></span>
          <span><i className="p" />{series.legend[1]}<em>{rupees(series.prev[hi])}</em></span>
        </div>
      )}
    </div>
  );
}

const FEED_ICON: Record<FeedKind, string> = { order: I.orders, stock: I.inventory, label: I.label, van: I.dispatch, epod: I.pen, invoice: I.doc, payout: I.coin, po: I.doc };

function Home({ s, d }: P) {
  const k = KPI[s.range];
  const extra = s.orders.filter((o) => INCOMING_IDS.has(o.id)).reduce((a, o) => a + orderTotal(o), 0);
  const orders = useCount(k.orders + s.orders.length), revenue = useCount(k.revenue + extra), esc = useCount(escrowOf(s));
  const low = s.inv.filter((i) => i.on - i.res < i.min);
  const dueToday = s.crates.filter((c) => !c.back && c.due.startsWith('Today'));
  return (
    <div className="sdb-page">
      <PageHead
        title="Home"
        sub="Wednesday, 22 October · 14:20"
        right={(
          <div className="sdb-seg" role="tablist" aria-label="Range">
            {([['today', 'Today'], ['7d', '7 days'], ['30d', '30 days']] as [Range, string][]).map(([r, l]) => (
              <button key={r} type="button" role="tab" aria-selected={s.range === r} onClick={() => d({ t: 'range', r })}>{l}</button>
            ))}
          </div>
        )}
      />
      <div className="sdb-home">
        <div className="sdb-home-l">
          <div className="sdb-kpis">
            <div className="sdb-kpi"><small>Orders</small><b>{Math.round(orders).toLocaleString('en-IN')}</b><span className="sdb-delta"><Ico d={I.up} s={12} />{k.ordersDelta}%<span>{k.vs}</span></span></div>
            <div className="sdb-kpi"><small>Gross revenue</small><b>{rupees(revenue)}</b><span className="sdb-delta"><Ico d={I.up} s={12} />{k.revenueDelta}%<span>{k.vs}</span></span></div>
            <div className="sdb-kpi"><small>On-time delivery</small><b>{k.ontime.toFixed(1)}%</b><span className="sdb-delta"><Ico d={I.up} s={12} />{k.ontimeDelta} pts<span>{k.vs}</span></span></div>
            <div className="sdb-kpi"><small>In escrow</small><b>{rupees(esc)}</b><span className="sdb-delta is-mute">Releases on ePOD</span></div>
          </div>
          <section className="sdb-card sdb-chartcard">
            <header>
              <h3>Revenue</h3>
              <span className="sdb-note">{SERIES[s.range].cumulative ? 'Cumulative, by hour' : 'By day'}</span>
              <span className="sdb-legend"><i className="c" />{SERIES[s.range].legend[0]}<i className="p" />{SERIES[s.range].legend[1]}</span>
            </header>
            <RevenueChart series={SERIES[s.range]} extra={extra} />
          </section>
        </div>
        <div className="sdb-home-r">
          <section className="sdb-card">
            <header><h3>Needs attention</h3><span className="sdb-count">{low.filter((i) => !s.drafted.includes(i.sku)).length + (s.sync === 'done' ? 0 : 1) + (dueToday.length ? 1 : 0)}</span></header>
            <ul className="sdb-att">
              {low.map((i) => (
                <li key={i.sku}>
                  <span className="ic is-amber"><Ico d={I.inventory} s={15} /></span>
                  <span><b>{i.sku}</b><small>Low stock · {i.on - i.res} left, reorder at {i.min}</small></span>
                  {s.drafted.includes(i.sku)
                    ? <span className="sdb-ok"><Ico d={I.check} s={13} />PO drafted</span>
                    : <button type="button" className="sdb-b is-sm" onClick={() => d({ t: 'reorder', sku: i.sku })}>Reorder</button>}
                </li>
              ))}
              <li>
                <span className={`ic ${s.sync === 'done' ? 'is-green' : 'is-red'}`}><Ico d={s.sync === 'done' ? I.check : I.sync} s={15} /></span>
                <span><b>{s.sync === 'done' ? 'Tally sync complete' : 'Tally sync failed'}</b><small>INV-2209 · Third Wave · ₹4,980</small></span>
                {s.sync === 'failed' && <button type="button" className="sdb-b is-sm" onClick={() => { d({ t: 'sync', s: 'syncing' }); setTimeout(() => d({ t: 'sync', s: 'done' }), 1300); }}>Retry</button>}
                {s.sync === 'syncing' && <span className="sdb-spin" aria-label="Syncing" />}
              </li>
              {dueToday.length > 0 && (
                <li>
                  <span className="ic is-slate"><Ico d={I.crates} s={15} /></span>
                  <span><b>{dueToday.reduce((a, c) => a + c.out, 0)} crates due back today</b><small>{dueToday.map((c) => c.cafe.split(' · ')[0]).join(', ')}</small></span>
                  <button type="button" className="sdb-b is-sm" onClick={() => d({ t: 'view', v: 'crates' })}>View</button>
                </li>
              )}
            </ul>
          </section>
          <section className="sdb-card sdb-feedcard">
            <header><h3>Activity</h3><span className="sdb-live is-sm"><i />Live</span></header>
            <ul className="sdb-feed">
              {s.feed.slice(0, 7).map((f) => (
                <li key={f.id} className={f.fresh ? 'is-fresh' : ''}>
                  <span className={`ic is-${f.kind}`}><Ico d={FEED_ICON[f.kind]} s={13} /></span>
                  <span><b>{f.text}</b><small>{f.sub}</small></span>
                  <time>{f.t}</time>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ───────────── Orders ───────────── */
const SHORT: Record<Status, string> = { New: 'Received', Allocated: 'Confirmed', Packed: 'Packed', 'Out for delivery': 'Dispatched', Delivered: 'Delivered' };
const ACTION: Record<Status, string> = { New: 'Confirm & reserve stock', Allocated: 'Mark packed · print label', Packed: 'Dispatch with Van 05', 'Out for delivery': 'Record delivery (ePOD)', Delivered: 'Delivered' };
const FILTERS: [Filter, string][] = [['all', 'All'], ['new', 'Needs confirmation'], ['progress', 'In progress'], ['delivered', 'Delivered']];
const inFilter = (o: Order, f: Filter) => f === 'all' || (f === 'new' ? o.status === 'New' : f === 'delivered' ? o.status === 'Delivered' : o.status !== 'New' && o.status !== 'Delivered');

function Orders({ s, d }: P) {
  const q = s.q.trim().toLowerCase();
  const rows = s.orders.filter((o) => inFilter(o, s.filter) && (!q || `${o.id} ${o.cafe} ${o.area} ${o.lines.map((l) => l.sku).join(' ')}`.toLowerCase().includes(q)));
  const sel = s.orders.find((o) => o.id === s.sel);
  const count = (f: Filter) => s.orders.filter((o) => inFilter(o, f)).length;
  return (
    <div className="sdb-page sdb-orders">
      <PageHead
        title="Orders"
        sub={`${count('new')} need confirmation · ${count('progress')} in progress`}
        right={<><button type="button" className="sdb-b"><Ico d={I.export} s={14} />Export</button><button type="button" className="sdb-b is-dark"><Ico d={I.plus} s={14} />New order</button></>}
      />
      <div className="sdb-toolbar">
        <div className="sdb-tabs" role="tablist" aria-label="Filter orders">
          {FILTERS.map(([f, l]) => (
            <button key={f} type="button" role="tab" className="sdb-tab" aria-selected={s.filter === f} onClick={() => d({ t: 'filter', f })}>{l}<em>{count(f)}</em></button>
          ))}
        </div>
        <label className="sdb-filter">
          <Ico d={I.search} s={14} />
          <input id="sdb-filter" value={s.q} onChange={(e) => d({ t: 'q', q: e.target.value })} placeholder="Filter by café, order or SKU" aria-label="Filter orders" />
        </label>
      </div>
      <div className="sdb-table" role="table" aria-label="Orders">
        <div className="sdb-tr sdb-th" role="row"><span>Order</span><span>Café</span><span>Items</span><span>Channel</span><span className="r">Amount</span><span>Status</span><span className="r">ETA</span></div>
        <div className="sdb-tbody">
          {rows.map((o) => (
            <button key={o.id} type="button" role="row" data-tour={`row-${o.id}`} className={`sdb-tr${o.id === s.sel ? ' is-sel' : ''}${o.fresh ? ' is-fresh' : ''}`} onClick={() => d({ t: 'select', id: o.id })}>
              <span className="sdb-mono">{o.id}</span>
              <span className="sdb-cafe"><Avatar name={o.cafe} /><span><b>{o.cafe}</b><small>{o.area}</small></span></span>
              <span className="sdb-items-t">{itemsSummary(o)}</span>
              <span><Channel c={o.channel} /></span>
              <span className="r sdb-amt">{rupees(orderTotal(o))}</span>
              <span><Badge s={o.status} /></span>
              <span className="r sdb-muted">{o.eta}</span>
            </button>
          ))}
          {rows.length === 0 && <p className="sdb-empty">No orders match “{s.q}”. Try a café name or SKU.</p>}
        </div>
      </div>
      {sel && <Drawer o={sel} d={d} />}
    </div>
  );
}

function Drawer({ o, d }: { o: Order; d: Dispatch<Action> }) {
  const at = STEPS.indexOf(o.status);
  return (
    <aside className="sdb-drawer" aria-label={`Order ${o.id}`}>
      <header className="sdb-dw-h">
        <div><span className="sdb-mono">{o.id}</span><Badge s={o.status} /></div>
        <button type="button" className="sdb-iconb" aria-label="Close order" onClick={() => d({ t: 'select', id: null })}><Ico d={I.close} /></button>
      </header>
      <div className="sdb-dw-b">
        <div className="sdb-dw-cafe">
          <Avatar name={o.cafe} size={34} />
          <div><b>{o.cafe}</b><small>{o.area} · Tier {o.tier} pricing</small></div>
          <Channel c={o.channel} />
        </div>
        {o.message && (
          <figure className="sdb-msg">
            <blockquote>{o.message}</blockquote>
            <figcaption><Ico d={I.check} s={12} />{o.lines.length} item{o.lines.length > 1 ? 's' : ''} matched to your catalogue</figcaption>
          </figure>
        )}
        <ol className="sdb-stepper" aria-label="Fulfilment">
          {STEPS.map((st, i) => <li key={st} className={i < at ? 'done' : i === at ? 'now' : ''}><i /><span>{SHORT[st]}</span></li>)}
        </ol>
        <table className="sdb-lines">
          <tbody>
            {o.lines.map((l) => (
              <tr key={l.sku}><td>{l.qty.toLocaleString('en-IN')} × {l.sku}<small>{rupees(l.price)} each</small></td><td className="r">{rupees(l.qty * l.price)}</td></tr>
            ))}
            <tr className="tot"><td>Total</td><td className="r">{rupees(orderTotal(o))}</td></tr>
          </tbody>
        </table>
        <dl className="sdb-meta">
          <dt>Payment</dt><dd>{o.status === 'Delivered' ? 'Released · paid out tomorrow' : 'Held in escrow'}</dd>
          <dt>Invoice</dt><dd>{o.invoice ? <>{o.invoice} · <span className="sdb-okt">synced to Tally</span></> : 'Raised on dispatch'}</dd>
          <dt>Delivery</dt><dd>{o.van ? `${o.van} · ${o.status === 'Delivered' ? `signed by ${o.signer}` : `ETA ${o.eta}`}` : 'Not assigned yet'}</dd>
        </dl>
        <ol className="sdb-log" aria-label="Activity">
          {[...o.log].reverse().map((l, i) => <li key={`${l.t}-${i}`}><time>{l.t}</time><span>{l.text}</span></li>)}
        </ol>
      </div>
      <footer className="sdb-dw-f">
        <button type="button" className="sdb-b is-dark" data-tour="primary-action" disabled={o.status === 'Delivered'} onClick={() => d({ t: 'advance', id: o.id })}>
          {o.status === 'Delivered' ? <><Ico d={I.check} s={14} />Delivered · ePOD signed</> : ACTION[o.status]}
        </button>
        <button type="button" className="sdb-b">Message café</button>
      </footer>
    </aside>
  );
}

/* ───────────── Dispatch: van list + stylised route map ───────────── */
const PLACES: Record<string, [number, number]> = {
  Depot: [96, 292], Koramangala: [292, 246], '80 ft Road': [378, 164], Indiranagar: [462, 98], 'HSR Layout': [250, 334], Jayanagar: [148, 190],
};

function RouteMap({ van }: { van: Van }) {
  const pathRef = useRef<SVGPathElement>(null);
  const markRef = useRef<SVGGElement>(null);
  const pts = [PLACES.Depot, ...van.stops.map((x) => PLACES[x.place] ?? [300, 200])];
  const route = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join('');
  const done = van.stops.filter((x) => x.state === 'done').length;
  const doneD = pts.slice(0, done + 1).map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join('');
  const moving = van.status === 'On route' && done < van.stops.length;
  const shown = useRef<{ id: string; f: number } | null>(null);
  // The van glides to its latest stop, then creeps on toward the next one. Switching vans jumps.
  useEffect(() => {
    const path = pathRef.current, mark = markRef.current;
    if (!path || !mark) return;
    const L = path.getTotalLength();
    const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
    const tot = seg.reduce((a, b) => a + b, 0) || 1;
    const at = (k: number) => seg.slice(0, Math.min(k, seg.length)).reduce((a, b) => a + b, 0) / tot;
    const put = (f: number) => { shown.current = { id: van.id, f }; const p = path.getPointAtLength(L * f); mark.setAttribute('transform', `translate(${p.x} ${p.y})`); };
    const target = at(done), from = shown.current?.id === van.id ? shown.current.f : target;
    const creep = moving ? target + (at(done + 1) - target) * 0.45 : target;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { put(moving ? creep : target); return; }
    let raf = 0;
    const t0 = performance.now(), glide = Math.abs(target - from) > 0.001 ? 1100 : 0;
    const tick = (now: number) => {
      const t = Math.max(0, now - t0);
      if (t < glide) { const k = t / glide, e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2; put(from + (target - from) * e); }
      else { const k = Math.min(1, (t - glide) / 9000), e = 1 - (1 - k) ** 2; put(target + (creep - target) * e); if (k >= 1) return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [route, done, moving]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <svg viewBox="0 0 560 380" preserveAspectRatio="xMidYMid meet" aria-label={`Route map for ${van.id}`} role="img">
      <rect x="-400" y="-300" width="1360" height="980" className="m-bg" />
      <path d="M-10 30C60 20 112 64 122 112S84 172-10 160Z" className="m-water" />
      <ellipse cx="486" cy="304" rx="58" ry="34" className="m-water" />
      <rect x="196" y="36" width="96" height="62" rx="16" className="m-park" />
      <rect x="330" y="252" width="74" height="54" rx="14" className="m-park" />
      <rect x="40" y="222" width="54" height="40" rx="12" className="m-park" />
      {['M38 -300L188 680', 'M-400 360L960 276', 'M246 -300C262 120 238 250 286 680', 'M374 -300L444 680', 'M-400 104C200 142 382 88 960 200', 'M168 -300C190 120 120 260 210 680', 'M520 -300C470 120 540 240 470 680', 'M-400 30C-100 40 0 -10 120 -60'].map((dd) => (
        <g key={dd}><path d={dd} className="m-road-c" /><path d={dd} className="m-road" /></g>
      ))}
      <path d="M-400 280C120 250 220 282 300 246S470 120 960 -40" className="m-major-c" />
      <path d="M-400 280C120 250 220 282 300 246S470 120 960 -40" className="m-major" />
      {[['KORAMANGALA', 292, 282], ['INDIRANAGAR', 462, 70], ['HSR LAYOUT', 250, 366], ['JAYANAGAR', 148, 160], ['80 FT ROAD', 430, 186]].map(([t, x, y]) => (
        <text key={t as string} x={x as number} y={y as number} className="m-lab" textAnchor="middle">{t}</text>
      ))}
      <path d={route} className="m-route-c" />
      <path d={route} ref={pathRef} className="m-route" />
      {done > 0 && <path d={doneD} className="m-route-done" />}
      <g transform={`translate(${PLACES.Depot[0]} ${PLACES.Depot[1]})`}>
        <rect x="-13" y="-13" width="26" height="26" rx="7" className="m-depot" />
        <path d="M-6 3V-2L0-6 6-2V3M-3 3V-1H3V3" className="m-depot-i" />
      </g>
      {van.stops.map((x, i) => {
        const [cx, cy] = PLACES[x.place] ?? [300, 200];
        return (
          <g key={x.place + x.cafe} transform={`translate(${cx} ${cy})`} className={`m-stop is-${x.state}${x.fresh ? ' is-fresh' : ''}`}>
            {x.fresh && <circle r="18" className="m-ping" />}
            <circle r="11" />
            {x.state === 'done' ? <path d="M-4 0.5L-1.2 3.3L4.2-2.6" className="m-tick" /> : <text y="3.6" textAnchor="middle">{i + 1}</text>}
          </g>
        );
      })}
      <g ref={markRef} className="m-van">
        <circle r="17" className="m-van-ring" />
        <circle r="12.5" className="m-van-dot" />
        <path d="M-6 -3h6.5v5H-6zM0.5-1h3l2 2.3V2H0.5" className="m-van-i" />
      </g>
    </svg>
  );
}

function Dispatch({ s, d }: P) {
  const van = s.vans[s.van];
  return (
    <div className="sdb-page">
      <PageHead title="Dispatch" sub="2 vans today · live from the driver app" />
      <div className="sdb-disp">
        <div className="sdb-vans">
          {(Object.values(s.vans) as Van[]).map((v) => {
            const done = v.stops.filter((x) => x.state === 'done').length;
            return (
              <button key={v.id} type="button" data-tour={`van-${v.id.slice(-2)}`} className={`sdb-van${v.id === s.van ? ' is-sel' : ''}`} onClick={() => d({ t: 'van', v: v.id })}>
                <header><b>{v.id}</b><span className={`sdb-mini${v.status === 'On route' ? ' is-go' : ''}`}>{v.status}</span></header>
                <span className="sdb-who"><Avatar name={v.driver} size={20} />{v.driver}<em>{done}/{v.stops.length} stops</em></span>
                <span className="sdb-bar"><i style={{ width: `${(done / Math.max(1, v.stops.length)) * 100}%` }} /></span>
                <ol className="sdb-stops">
                  {v.stops.map((x) => (
                    <li key={x.place + x.cafe} className={`${x.state}${x.fresh ? ' is-fresh' : ''}`}>
                      <i /><span><b>{x.cafe}</b><small>{x.place}</small></span><time>{x.t}</time>
                    </li>
                  ))}
                </ol>
              </button>
            );
          })}
        </div>
        <section className="sdb-card sdb-map">
          <RouteMap van={van} />
          <span className="sdb-map-chip"><b>{van.id}</b>{van.driver} · {van.stops.length} stops · last drop {van.stops[van.stops.length - 1]?.t}</span>
          <span className="sdb-map-leg"><i className="done" />Delivered<i className="todo" />Upcoming<i className="van" />Van</span>
        </section>
      </div>
    </div>
  );
}

/* ───────────── Inventory · Crates · Invoices · Payouts ───────────── */
function Inventory({ s, d }: P) {
  return (
    <div className="sdb-page">
      <PageHead title="Inventory" sub="Live across Bay 01–04 and the cold room · reserved the moment an order is confirmed" right={<button type="button" className="sdb-b"><Ico d={I.export} s={14} />Export</button>} />
      <div className="sdb-table" role="table" aria-label="Inventory">
        <div className="sdb-gr sdb-th" role="row"><span>SKU</span><span className="r">On hand</span><span className="r">Reserved</span><span className="r">Available</span><span>Stock</span><span /></div>
        <div className="sdb-tbody">
          {s.inv.map((i) => {
            const av = i.on - i.res, low = av < i.min;
            return (
              <div key={i.sku} className={`sdb-gr${low ? ' is-low' : ''}`} role="row">
                <span><b>{i.sku}</b><small>{i.bay}</small></span>
                <span className="r sdb-amt">{i.on.toLocaleString('en-IN')}</span>
                <span className="r sdb-muted">{i.res.toLocaleString('en-IN')}</span>
                <span className={`r sdb-amt${low ? ' sdb-warn' : ''}`}>{av.toLocaleString('en-IN')}</span>
                <span className="sdb-stock" title={`${av} available, ${i.res} reserved`}><i className="av" style={{ width: `${(av / i.on) * 100}%` }} /><i className="rs" style={{ width: `${(i.res / i.on) * 100}%` }} /></span>
                <span className="r">
                  {low && (s.drafted.includes(i.sku)
                    ? <span className="sdb-ok"><Ico d={I.check} s={13} />PO drafted</span>
                    : <button type="button" className="sdb-b is-sm" onClick={() => d({ t: 'reorder', sku: i.sku })}>Reorder</button>)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Crates({ s, d }: P) {
  const out = 27 + s.crates.filter((c) => !c.back).reduce((a, c) => a + c.out, 0);
  const due = s.crates.filter((c) => !c.back && c.due.startsWith('Today')).reduce((a, c) => a + c.out, 0);
  return (
    <div className="sdb-page">
      <PageHead title="Crates" sub="120 returnable crates · each one scanned out and back in" />
      <div className="sdb-kpis">
        {[['Out with cafés', out], ['At the depot', 120 - out], ['Due back today', due], ['Missing', 0]].map(([l, v]) => (
          <div className="sdb-kpi" key={l as string}><small>{l}</small><b>{v}</b></div>
        ))}
      </div>
      <div className="sdb-table" role="table" aria-label="Crates by café">
        <div className="sdb-gr is-3 sdb-th" role="row"><span>Café</span><span className="r">Crates out</span><span>Collection</span><span /></div>
        <div className="sdb-tbody">
          {s.crates.map((c) => (
            <div className="sdb-gr is-3" role="row" key={c.cafe}>
              <span className="sdb-cafe"><Avatar name={c.cafe.split(' · ')[0]} /><span><b>{c.cafe.split(' · ')[0]}</b><small>{c.cafe.split(' · ')[1]}</small></span></span>
              <span className="r sdb-amt">{c.back ? 0 : c.out}</span>
              <span className="sdb-muted">{c.back ? 'Collected' : c.due}</span>
              <span className="r">{c.back ? <span className="sdb-ok"><Ico d={I.check} s={13} />Back at depot</span> : <button type="button" className="sdb-b is-sm" onClick={() => d({ t: 'crate', cafe: c.cafe })}>Mark collected</button>}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const irn = (id: string) => {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const x = h.toString(16).padStart(8, '0');
  return `${x.slice(0, 4)}…${x.slice(-4)}`;
};
function Invoices({ s, d }: P) {
  const rows = s.orders.filter((o) => o.invoice).sort((a, b) => (b.invoice! > a.invoice! ? 1 : -1));
  return (
    <div className="sdb-page">
      <PageHead title="Invoices" sub="GST e-invoices, raised on dispatch and pushed to Tally Prime" />
      <div className="sdb-table" role="table" aria-label="Invoices">
        <div className="sdb-gr is-inv sdb-th" role="row"><span>Invoice</span><span>Café</span><span className="r">Amount</span><span>IRN</span><span>Tally</span></div>
        <div className="sdb-tbody">
          {rows.map((o) => {
            const failing = o.invoice === 'INV-2209' && s.sync !== 'done';
            return (
              <div className={`sdb-gr is-inv${o.fresh === false && INCOMING_IDS.has(o.id) ? ' is-fresh' : ''}`} role="row" key={o.invoice}>
                <span className="sdb-mono">{o.invoice}</span>
                <span className="sdb-cafe"><Avatar name={o.cafe} /><span><b>{o.cafe}</b><small>{o.area}</small></span></span>
                <span className="r sdb-amt">{rupees(orderTotal(o))}</span>
                <span className="sdb-mono sdb-muted">{irn(o.id)}</span>
                <span>
                  {!failing ? <span className="sdb-badge is-done">Synced</span>
                    : s.sync === 'syncing' ? <span className="sdb-syncing"><span className="sdb-spin" />Syncing</span>
                    : <span className="sdb-fail"><span className="sdb-badge is-fail">Failed</span><button type="button" className="sdb-b is-sm" onClick={() => { d({ t: 'sync', s: 'syncing' }); setTimeout(() => d({ t: 'sync', s: 'done' }), 1300); }}>Retry</button></span>}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Payouts({ s }: P) {
  const rel = releasingOf(s), shown = useCount(rel), esc = useCount(escrowOf(s));
  const count = s.orders.filter((o) => o.status === 'Delivered').length;
  return (
    <div className="sdb-page">
      <PageHead title="Payouts" sub="Café payments are held in escrow at checkout and released when the ePOD is signed" />
      <section className="sdb-card sdb-payhero" data-tour="payout-hero">
        <div>
          <small>Releasing tomorrow</small>
          <b>{rupees(shown)}</b>
          <span>to HDFC Bank ••9940 · Thu, 23 Oct, 09:00 · {count} deliveries</span>
        </div>
        <ol className="sdb-flow" aria-label="How a payout moves">
          <li className="done"><Ico d={I.coin} s={14} />Held in escrow</li>
          <li className="done"><Ico d={I.pen} s={14} />ePOD signed</li>
          <li className="now"><Ico d={I.payouts} s={14} />Paid T+1</li>
        </ol>
      </section>
      <div className="sdb-kpis is-3">
        <div className="sdb-kpi"><small>In escrow</small><b>{rupees(esc)}</b></div>
        <div className="sdb-kpi"><small>Paid this month</small><b>₹6,42,900</b></div>
        <div className="sdb-kpi"><small>Average settlement</small><b>T+1.0</b></div>
      </div>
      <div className="sdb-table" role="table" aria-label="Payout schedule">
        <div className="sdb-gr is-pay sdb-th" role="row"><span>Date</span><span className="r">Deliveries</span><span className="r">Amount</span><span>Status</span></div>
        <div className="sdb-tbody">
          {[['Thu, 23 Oct · 09:00', count, rel, 'Scheduled'], ['Wed, 22 Oct · 09:00', 5, 26750, 'Paid'], ['Tue, 21 Oct · 09:00', 4, 21300, 'Paid'], ['Mon, 20 Oct · 09:00', 6, 31980, 'Paid']].map(([dt, n, a, st]) => (
            <div className="sdb-gr is-pay" role="row" key={dt as string}>
              <span>{dt}</span><span className="r sdb-amt">{n}</span><span className="r sdb-amt">{rupees(a as number)}</span>
              <span><span className={`sdb-badge ${st === 'Paid' ? 'is-done' : 'is-road'}`}>{st}</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────── ⌘K palette, toasts ───────────── */
type Cmd = { group: string; label: string; hint?: string; d: string; run: () => void };
function Palette({ s, d }: P) {
  const [q, setQ] = useState('');
  const [i, setI] = useState(0);
  const cmds = useMemo<Cmd[]>(() => {
    const acts: Cmd[] = [];
    if (s.next < INCOMING.length) acts.push({ group: 'Actions', label: 'Simulate a WhatsApp order', hint: 'Demo', d: I.chat, run: () => d({ t: 'incoming' }) });
    s.inv.filter((x) => x.on - x.res < x.min && !s.drafted.includes(x.sku)).forEach((x) => acts.push({ group: 'Actions', label: `Reorder ${x.sku}`, d: I.inventory, run: () => d({ t: 'reorder', sku: x.sku }) }));
    if (s.sync === 'failed') acts.push({ group: 'Actions', label: 'Retry Tally sync for INV-2209', d: I.sync, run: () => { d({ t: 'sync', s: 'syncing' }); setTimeout(() => d({ t: 'sync', s: 'done' }), 1300); } });
    const go = NAV.map<Cmd>((n) => ({ group: 'Go to', label: n.label, d: n.d, run: () => d({ t: 'view', v: n.id }) }));
    const os = s.orders.map<Cmd>((o) => ({ group: 'Orders', label: `${o.id} · ${o.cafe}, ${o.area}`, hint: o.status, d: I.orders, run: () => d({ t: 'open', id: o.id }) }));
    const k = q.trim().toLowerCase();
    return (k ? [...acts, ...go, ...os].filter((c) => c.label.toLowerCase().includes(k)) : [...acts, ...go, ...os.slice(0, 3)]).slice(0, 10);
  }, [q, s, d]);
  const run = (c: Cmd | undefined) => { if (!c) return; d({ t: 'palette', open: false }); c.run(); };
  let lastGroup = '';
  return (
    <div className="sdb-pal-bg" onPointerDown={(e) => { if (e.target === e.currentTarget) d({ t: 'palette', open: false }); }}>
      <div className="sdb-pal" role="dialog" aria-label="Command menu">
        <div className="sdb-pal-in">
          <Ico d={I.search} />
          <input
            id="sdb-cmd" autoFocus value={q} placeholder="Type a command or search…"
            onChange={(e) => { setQ(e.target.value); setI(0); }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setI((x) => Math.min(cmds.length - 1, x + 1)); }
              else if (e.key === 'ArrowUp') { e.preventDefault(); setI((x) => Math.max(0, x - 1)); }
              else if (e.key === 'Enter') { e.preventDefault(); run(cmds[i]); }
              else if (e.key === 'Escape') { e.preventDefault(); d({ t: 'palette', open: false }); }
            }}
          />
          <kbd>esc</kbd>
        </div>
        <ul role="listbox" aria-label="Results">
          {cmds.map((c, k) => {
            const head = c.group !== lastGroup ? c.group : null;
            lastGroup = c.group;
            return (
              <li key={c.group + c.label}>
                {head && <p className="grp">{head}</p>}
                <button type="button" role="option" aria-selected={k === i} onPointerEnter={() => setI(k)} onClick={() => run(c)}>
                  <Ico d={c.d} s={15} /><span>{c.label}</span>{c.hint && <em>{c.hint}</em>}
                </button>
              </li>
            );
          })}
          {cmds.length === 0 && <li className="sdb-empty">Nothing matches “{q}”.</li>}
        </ul>
        <footer><span><kbd>↑</kbd><kbd>↓</kbd>to move</span><span><kbd>↵</kbd>to open</span><span><kbd>esc</kbd>to close</span></footer>
      </div>
    </div>
  );
}

function Toasts({ s, d }: P) {
  useEffect(() => {
    if (!s.toasts.length) return;
    const first = s.toasts[0], ms = first.kind === 'order' ? 6500 : first.kind === 'epod' ? 4500 : 3000;
    const t = setTimeout(() => d({ t: 'toast-off', id: first.id }), ms);
    return () => clearTimeout(t);
  }, [s.toasts, d]);
  return (
    <div className="sdb-toasts" aria-live="polite">
      {s.toasts.map((t) => (
        <div key={t.id} className={`sdb-toast is-${t.kind}`} role="status">
          <span className="ic"><Ico d={t.kind === 'order' ? I.chat : t.kind === 'epod' ? I.pen : I.label} s={15} /></span>
          <span className="tx"><b>{t.title}</b><small>{t.body}</small></span>
          {t.open && <button type="button" data-tour="toast-review" onClick={() => { d({ t: 'open', id: t.open! }); d({ t: 'toast-off', id: t.id }); }}>Review</button>}
        </div>
      ))}
    </div>
  );
}

/* ───────────── tour: cursor, callouts, bar ───────────── */
const TOUR = [
  'A café orders on WhatsApp',
  'It arrives as a structured order',
  'Confirm it and stock is reserved',
  'Pack it with a printed label',
  'Dispatch it on the next van',
  'The stop joins Van 05’s route',
  'Van 05 drives the route, drop by drop',
  'The café signs on delivery',
  'The money is released T+1',
  'It all rolls up to Home',
];
const STOP = Symbol('stop');
type Callout = 'wa' | 'epod' | 'payout' | null;

function Callouts({ on, s }: { on: Callout; s: State }) {
  const rel = releasingOf(s);
  return (
    <>
      <aside className={`sdb-co sdb-co-wa${on === 'wa' ? ' is-on' : ''}`} aria-hidden="true">
        <header><span className="wa"><Ico d={I.chat} s={13} /></span><b>Little Ritual</b><span>Jayanagar</span><time>14:21</time></header>
        <p>Bhaiya kal subah 6 oat milk aur 2 kilo house blend bhej dena</p>
        <footer><Ico d={I.check} s={12} />Became order GRB-2059 · 2 items matched</footer>
      </aside>
      <aside className={`sdb-co sdb-co-epod${on === 'epod' ? ' is-on' : ''}`} aria-hidden="true">
        <header><b>Proof of delivery</b><span className="sdb-badge is-done">GPS verified</span></header>
        <svg viewBox="0 0 220 64" className="sig"><path d="M10 44c12-20 24-30 29-21s-9 25-1 21 17-29 26-25-5 23 4 19 14-15 22-11 4 10 12 7 18-9 27-11 23 3 31-1 18-8 24-6" /></svg>
        <footer><span><b>Kavya</b> · Little Ritual, Jayanagar</span><time>16:31</time></footer>
      </aside>
      <aside className={`sdb-co sdb-co-pay${on === 'payout' ? ' is-on' : ''}`} aria-hidden="true">
        <small>Payout scheduled</small>
        <b>{rupees(rel)}</b>
        <span>HDFC Bank ••9940 · Tomorrow, 09:00</span>
      </aside>
    </>
  );
}

export function SupplierDashboard({ live }: { live: boolean }) {
  const [s, d] = useReducer(reducer, undefined, init);
  const [mode, setMode] = useState<'tour' | 'user'>('tour');
  const [step, setStep] = useState(-1);
  const [loop, setLoop] = useState(0);
  const [callout, setCallout] = useState<Callout>(null);
  const [cursor, setCursor] = useState({ x: 140, y: 120, on: false, dur: 0 });
  const [press, setPress] = useState(0);
  const pos = useRef({ x: 140, y: 120 });
  const win = useRef<HTMLDivElement>(null);
  const hover = useRef(false);

  // visitors who prefer reduced motion start in control; the tour is one click away
  useEffect(() => { if (matchMedia('(prefers-reduced-motion: reduce)').matches) setMode('user'); }, []);

  const takeOver = () => {
    if (mode !== 'tour') return;
    setMode('user'); setStep(-1); setCallout(null);
    setCursor((c) => ({ ...c, on: false }));
  };
  const replay = () => { setMode('tour'); setLoop((n) => n + 1); };

  // the guided tour: runs while the dashboard is in place, loops, and stops the moment you take over
  useEffect(() => {
    if (!live || mode !== 'tour') return;
    let alive = true;
    const wait = (ms: number) => new Promise<void>((res, rej) => setTimeout(() => (alive ? res() : rej(STOP)), ms));
    const move = async (name: string) => {
      const root = win.current, el = root?.querySelector<HTMLElement>(`[data-tour="${name}"]`);
      if (!root || !el) throw STOP;
      const rr = root.getBoundingClientRect(), er = el.getBoundingClientRect(), k = rr.width / root.offsetWidth || 1;
      const x = (er.left - rr.left + Math.min(er.width * 0.5, 46)) / k, y = (er.top - rr.top + er.height * 0.62) / k;
      const dur = Math.max(380, Math.min(720, Math.hypot(x - pos.current.x, y - pos.current.y) * 0.9));
      pos.current = { x, y };
      setCursor({ x, y, on: true, dur });
      await wait(dur + 120);
    };
    const click = async () => { setPress((n) => n + 1); await wait(200); };
    (async () => {
      d({ t: 'reset' }); setCallout(null); setStep(0);
      setCursor((c) => ({ ...c, on: true, dur: 0 }));
      await wait(1100);
      d({ t: 'incoming' }); setCallout('wa');
      await wait(900);
      setStep(1); await move('toast-review'); await click(); d({ t: 'open', id: 'GRB-2059' });
      await wait(1500);
      setStep(2); await move('primary-action'); await click(); d({ t: 'advance', id: 'GRB-2059' }); setCallout(null);
      await wait(1000);
      setStep(3); await move('primary-action'); await click(); d({ t: 'advance', id: 'GRB-2059' });
      await wait(1000);
      setStep(4); await move('primary-action'); await click(); d({ t: 'advance', id: 'GRB-2059' });
      await wait(900);
      setStep(5); await move('nav-dispatch'); await click(); d({ t: 'view', v: 'dispatch' }); d({ t: 'van', v: 'Van 05' });
      await wait(1500);
      // the delivery run: the van drives stop to stop, each drop ticking off
      setStep(6); d({ t: 'arrive', v: 'Van 05' });
      await wait(1500);
      d({ t: 'arrive', v: 'Van 05' });
      await wait(1500);
      setStep(7); d({ t: 'advance', id: 'GRB-2059' }); setCallout('epod');
      await wait(2600);
      setStep(8); await move('nav-payouts'); await click(); d({ t: 'view', v: 'payouts' }); setCallout('payout');
      await wait(2300);
      setStep(9); setCallout(null); await move('nav-home'); await click(); d({ t: 'view', v: 'home' });
      await wait(3200);
      setLoop((n) => n + 1);
    })().catch((e) => { if (e !== STOP) throw e; });
    return () => { alive = false; };
  }, [live, mode, loop]);

  // leaving the page (scrolling back to the truck) rewinds the tour
  useEffect(() => {
    if (live || mode !== 'tour') return;
    d({ t: 'reset' }); setStep(-1); setCallout(null);
    setCursor((c) => ({ ...c, on: false }));
  }, [live, mode]);

  // ⌘K / Ctrl+K and Escape while the pointer or focus is inside the portal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const inside = hover.current || !!win.current?.contains(document.activeElement);
      if (!inside || !live) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); takeOver(); d({ t: 'palette', open: !s.palette }); }
      else if (e.key === 'Escape' && !s.palette && s.sel) d({ t: 'select', id: null });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const Screen = { home: Home, orders: Orders, dispatch: Dispatch, inventory: Inventory, crates: Crates, invoices: Invoices, payouts: Payouts }[s.view];
  return (
    <div className={`sdb-scene ${ui.variable} ${uiMono.variable}`} data-mode={mode}>
      <div
        className={`sdb${s.view === 'orders' && s.sel ? ' has-drawer' : ''}`} ref={win} role="region" aria-label="Supplier Portal preview with sample data"
        onPointerDownCapture={(e) => { if (e.isTrusted) takeOver(); }}
        onKeyDownCapture={(e) => { if (e.isTrusted && e.key !== 'Tab') takeOver(); }}
        onPointerEnter={() => { hover.current = true; }} onPointerLeave={() => { hover.current = false; }}
      >
        <Sidebar s={s} d={d} />
        <div className="sdb-main">
          <TopBar s={s} d={d} />
          <div className="sdb-content" key={s.view}><Screen s={s} d={d} /></div>
        </div>
        <Toasts s={s} d={d} />
        {s.palette && <Palette s={s} d={d} />}
        <div
          className={`sdb-cursor${cursor.on && mode === 'tour' && live ? ' is-on' : ''}`} aria-hidden="true"
          style={{ transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)`, transition: `transform ${cursor.dur}ms cubic-bezier(.32,.72,.24,1), opacity .3s ease` }}
        >
          {press > 0 && <span className="sdb-click" key={press} />}
          <svg width="20" height="24" viewBox="0 0 20 24"><path d="M2 1.6v17.6l4.7-4.5 3.1 7.2 3.1-1.3-3.1-7.1h6.4z" /></svg>
        </div>
      </div>
      <Callouts on={mode === 'tour' && live ? callout : null} s={s} />
      <div className="sdb-tour" role="group" aria-label="Guided tour">
        {mode === 'tour' ? (
          <>
            <button type="button" className="sdb-tour-b" aria-label="Pause the tour" onClick={takeOver}><Ico d={I.pause} s={13} /></button>
            <ol className="sdb-tour-steps" aria-hidden="true">
              {TOUR.map((t, i) => <li key={t} className={i < step ? 'done' : i === step ? 'now' : ''} />)}
            </ol>
            <span className="sdb-tour-t"><b>{Math.max(1, step + 1)}/{TOUR.length}</b>{TOUR[Math.max(0, step)]}</span>
            <span className="sdb-tour-h">Click anywhere to take over</span>
          </>
        ) : (
          <>
            <span className="sdb-tour-dot" />
            <span className="sdb-tour-t"><b>You’re in control.</b>Everything works: try ⌘K, an order or the route.</span>
            <button type="button" className="sdb-tour-b is-text" onClick={replay}><Ico d={I.replay} s={13} />Replay tour</button>
          </>
        )}
      </div>
    </div>
  );
}
