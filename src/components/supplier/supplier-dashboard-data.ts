// Sample data and state for the Supplier Portal preview (SupplierDashboard.tsx).
// One reducer drives everything, so the guided tour and a visitor's own clicks go through the
// same actions: confirming an order reserves stock, dispatching adds a stop to a van and raises a
// Tally-synced e-invoice, delivery signs the ePOD and moves the money to tomorrow's payout.
// All figures, cafés and people are illustrative.

export type View = 'home' | 'orders' | 'dispatch' | 'inventory' | 'crates' | 'invoices' | 'payouts';
export type Status = 'New' | 'Allocated' | 'Packed' | 'Out for delivery' | 'Delivered';
export type Channel = 'WhatsApp' | 'Portal' | 'Voice note';
export type Range = 'today' | '7d' | '30d';
export type Filter = 'all' | 'new' | 'progress' | 'delivered';
export type VanId = 'Van 04' | 'Van 05';
export type Line = { sku: string; qty: number; price: number };
export type LogEntry = { t: string; text: string };
export type Order = {
  id: string; cafe: string; area: string; tier: 'A' | 'B'; channel: Channel; placed: string;
  lines: Line[]; status: Status; eta: string; van?: VanId; message?: string; signer?: string;
  invoice?: string; log: LogEntry[]; fresh?: boolean;
};
export type Item = { sku: string; on: number; res: number; bay: string; min: number };
export type Stop = { place: string; cafe: string; t: string; state: 'done' | 'next' | 'todo'; fresh?: boolean };
export type Van = { id: VanId; driver: string; status: string; stops: Stop[] };
export type Crate = { cafe: string; out: number; due: string; back: boolean };
export type FeedKind = 'order' | 'stock' | 'label' | 'van' | 'epod' | 'invoice' | 'payout' | 'po';
export type Feed = { id: number; t: string; kind: FeedKind; text: string; sub: string; fresh?: boolean };
export type Toast = { id: number; kind: 'order' | 'epod' | 'info'; title: string; body: string; open?: string };

export type State = {
  view: View; range: Range; filter: Filter; q: string; sel: string | null; palette: boolean;
  orders: Order[]; inv: Item[]; drafted: string[]; sync: 'failed' | 'syncing' | 'done';
  crates: Crate[]; vans: Record<VanId, Van>; van: VanId;
  feed: Feed[]; toasts: Toast[]; next: number; seq: number;
};

export type Action =
  | { t: 'reset' } | { t: 'view'; v: View } | { t: 'open'; id: string } | { t: 'select'; id: string | null }
  | { t: 'range'; r: Range } | { t: 'filter'; f: Filter } | { t: 'q'; q: string } | { t: 'palette'; open: boolean }
  | { t: 'incoming' } | { t: 'advance'; id: string } | { t: 'toast-off'; id: number }
  | { t: 'reorder'; sku: string } | { t: 'sync'; s: 'syncing' | 'done' } | { t: 'crate'; cafe: string } | { t: 'van'; v: VanId } | { t: 'arrive'; v: VanId };

export const STEPS: Status[] = ['New', 'Allocated', 'Packed', 'Out for delivery', 'Delivered'];
const TIMES: Record<Status, string> = { New: '14:21', Allocated: '14:22', Packed: '14:41', 'Out for delivery': '15:00', Delivered: '16:31' };

export const orderTotal = (o: Order) => o.lines.reduce((a, l) => a + l.qty * l.price, 0);
export const rupees = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
export const itemsSummary = (o: Order) =>
  `${o.lines[0].qty.toLocaleString('en-IN')} × ${o.lines[0].sku}${o.lines.length > 1 ? ` +${o.lines.length - 1}` : ''}`;
export const isOpen = (o: Order) => o.status !== 'Delivered';

const ORDERS: Order[] = [
  {
    id: 'GRB-2058', cafe: 'Blue Tokai', area: 'Indiranagar', tier: 'A', channel: 'Portal', placed: '10:52',
    lines: [{ sku: 'Cups 8oz', qty: 1000, price: 2.9 }], status: 'New', eta: 'Tomorrow',
    log: [{ t: '10:52', text: 'Placed on the portal' }],
  },
  {
    id: 'GRB-2057', cafe: 'Morning Ground', area: 'Whitefield', tier: 'B', channel: 'WhatsApp', placed: '10:31',
    message: 'Kal tak 8 kilo espresso blend chahiye. Same rate as last time?',
    lines: [{ sku: 'Espresso blend 1kg', qty: 8, price: 800 }], status: 'New', eta: 'Tomorrow',
    log: [{ t: '10:31', text: 'Received on WhatsApp · 1 item matched' }],
  },
  {
    id: 'GRB-2056', cafe: 'Copper Kettle', area: 'HSR Layout', tier: 'B', channel: 'Voice note', placed: '09:58',
    message: '0:14 voice note · “Chaar bottle vanilla syrup bhej do”',
    lines: [{ sku: 'Vanilla syrup 750ml', qty: 4, price: 765 }], status: 'Allocated', eta: '15:30', van: 'Van 05',
    log: [{ t: '09:58', text: 'Received as a voice note · 1 item matched' }, { t: '10:06', text: 'Confirmed · stock reserved in Bay 03' }],
  },
  {
    id: 'GRB-2055', cafe: 'Brew Theory', area: 'Koramangala', tier: 'B', channel: 'Portal', placed: '09:40',
    lines: [{ sku: 'Single estate 1kg', qty: 2, price: 1120 }, { sku: 'Cups 12oz', qty: 200, price: 7.5 }], status: 'Packed', eta: '16:00', van: 'Van 05',
    log: [{ t: '09:40', text: 'Placed on the portal' }, { t: '09:44', text: 'Confirmed · stock reserved in Bay 01' }, { t: '11:20', text: 'Packed · thermal label printed' }],
  },
  {
    id: 'GRB-2053', cafe: 'Third Wave', area: 'Indiranagar', tier: 'A', channel: 'WhatsApp', placed: 'Yesterday',
    message: '6 kg house blend for tomorrow please',
    lines: [{ sku: 'House blend 1kg', qty: 6, price: 830 }], status: 'Out for delivery', eta: '14:35', van: 'Van 04', invoice: 'INV-2209',
    log: [{ t: 'Yest.', text: 'Received on WhatsApp · 1 item matched' }, { t: '08:50', text: 'Packed · thermal label printed' }, { t: '12:40', text: 'Dispatched with Van 04 · ETA 14:35' }],
  },
  {
    id: 'GRB-2051', cafe: 'Maverick & Farmer', area: '80 ft Road', tier: 'A', channel: 'WhatsApp', placed: 'Yesterday',
    lines: [{ sku: 'Oat milk 1L', qty: 12, price: 180 }], status: 'Delivered', eta: '13:50', van: 'Van 04', signer: 'Rahul', invoice: 'INV-2208',
    log: [{ t: '12:40', text: 'Dispatched with Van 04' }, { t: '13:52', text: 'Delivered · ePOD signed by Rahul' }],
  },
  {
    id: 'GRB-2048', cafe: 'Blue Tokai', area: 'Koramangala', tier: 'A', channel: 'WhatsApp', placed: 'Yesterday',
    lines: [{ sku: 'Arabica AA 1kg', qty: 10, price: 740 }, { sku: 'Oat milk 1L', qty: 4, price: 180 }], status: 'Delivered', eta: '13:10', van: 'Van 04', signer: 'Priya', invoice: 'INV-2207',
    log: [{ t: '12:40', text: 'Dispatched with Van 04' }, { t: '13:11', text: 'Delivered · ePOD signed by Priya' }],
  },
];

// orders that arrive during the tour, or from "Simulate a WhatsApp order" in ⌘K
export const INCOMING: Order[] = [
  {
    id: 'GRB-2059', cafe: 'Little Ritual', area: 'Jayanagar', tier: 'B', channel: 'WhatsApp', placed: '14:21',
    message: 'Bhaiya kal subah 6 oat milk aur 2 kilo house blend bhej dena',
    lines: [{ sku: 'Oat milk 1L', qty: 6, price: 190 }, { sku: 'House blend 1kg', qty: 2, price: 860 }], status: 'New', eta: 'Tomorrow',
    log: [{ t: '14:21', text: 'Received on WhatsApp · 2 items matched' }], fresh: true,
  },
  {
    id: 'GRB-2060', cafe: 'Copper Kettle', area: 'HSR Layout', tier: 'B', channel: 'Portal', placed: '14:26',
    lines: [{ sku: 'Arabica AA 1kg', qty: 4, price: 760 }], status: 'New', eta: 'Tomorrow',
    log: [{ t: '14:26', text: 'Placed on the portal' }], fresh: true,
  },
  {
    id: 'GRB-2061', cafe: 'Morning Ground', area: 'Whitefield', tier: 'B', channel: 'Voice note', placed: '14:33',
    message: '0:11 voice note · “Do vanilla syrup aur 500 cups chahiye”',
    lines: [{ sku: 'Vanilla syrup 750ml', qty: 2, price: 765 }, { sku: 'Cups 8oz', qty: 500, price: 3.1 }], status: 'New', eta: 'Tomorrow',
    log: [{ t: '14:33', text: 'Received as a voice note · 2 items matched' }], fresh: true,
  },
];

const INVENTORY: Item[] = [
  { sku: 'Arabica AA 1kg', on: 128, res: 35, bay: 'Bay 01', min: 30 },
  { sku: 'House blend 1kg', on: 60, res: 6, bay: 'Bay 02', min: 20 },
  { sku: 'Espresso blend 1kg', on: 22, res: 8, bay: 'Bay 02', min: 20 },
  { sku: 'Single estate 1kg', on: 40, res: 2, bay: 'Bay 01', min: 10 },
  { sku: 'Oat milk 1L', on: 96, res: 24, bay: 'Cold room', min: 36 },
  { sku: 'Vanilla syrup 750ml', on: 36, res: 4, bay: 'Bay 03', min: 12 },
  { sku: 'Cups 8oz', on: 4000, res: 1000, bay: 'Bay 04', min: 1500 },
  { sku: 'Cups 12oz', on: 2500, res: 200, bay: 'Bay 04', min: 1000 },
];

const VANS: Record<VanId, Van> = {
  'Van 04': {
    id: 'Van 04', driver: 'Ramesh K.', status: 'On route',
    stops: [
      { place: 'Koramangala', cafe: 'Blue Tokai', t: '13:10', state: 'done' },
      { place: '80 ft Road', cafe: 'Maverick & Farmer', t: '13:50', state: 'done' },
      { place: 'Indiranagar', cafe: 'Third Wave', t: '14:35', state: 'next' },
    ],
  },
  'Van 05': {
    id: 'Van 05', driver: 'Imran S.', status: 'Loading · Bay 02',
    stops: [
      { place: 'HSR Layout', cafe: 'Copper Kettle', t: '15:30', state: 'todo' },
      { place: 'Koramangala', cafe: 'Brew Theory', t: '16:00', state: 'todo' },
    ],
  },
};

const CRATES: Crate[] = [
  { cafe: 'Blue Tokai · Koramangala', out: 6, due: 'Today, 16:00', back: false },
  { cafe: 'Third Wave · Indiranagar', out: 4, due: 'Today, 16:30', back: false },
  { cafe: 'Maverick & Farmer · 80 ft Rd', out: 3, due: 'Tomorrow', back: false },
  { cafe: 'Copper Kettle · HSR Layout', out: 2, due: 'Tomorrow', back: false },
];

const FEED: Feed[] = [
  { id: 1, t: '13:52', kind: 'epod', text: 'ePOD signed by Rahul', sub: 'Maverick & Farmer · GRB-2051' },
  { id: 2, t: '13:11', kind: 'epod', text: 'ePOD signed by Priya', sub: 'Blue Tokai Koramangala · GRB-2048' },
  { id: 3, t: '12:40', kind: 'van', text: 'Van 04 left Bay 01', sub: '3 stops · Ramesh K.' },
  { id: 4, t: '10:52', kind: 'order', text: 'New order GRB-2058', sub: 'Blue Tokai Indiranagar · Portal' },
  { id: 5, t: '10:31', kind: 'order', text: 'New order GRB-2057', sub: 'Morning Ground · WhatsApp' },
];

export const init = (): State => ({
  view: 'home', range: 'today', filter: 'all', q: '', sel: null, palette: false,
  orders: ORDERS.map((o) => ({ ...o, log: [...o.log] })), inv: INVENTORY.map((i) => ({ ...i })), drafted: [], sync: 'failed',
  crates: CRATES.map((c) => ({ ...c })), vans: { 'Van 04': { ...VANS['Van 04'], stops: VANS['Van 04'].stops.map((s) => ({ ...s })) }, 'Van 05': { ...VANS['Van 05'], stops: VANS['Van 05'].stops.map((s) => ({ ...s })) } },
  van: 'Van 04', feed: FEED.map((f) => ({ ...f })), toasts: [], next: 0, seq: 100,
});

const feedItem = (id: number, t: string, kind: FeedKind, text: string, sub: string): Feed => ({ id, t, kind, text, sub, fresh: true });
const keepToasts = (ts: Toast[]) => ts.slice(-3);

export function reducer(s: State, a: Action): State {
  switch (a.t) {
    case 'reset': return init();
    case 'view': return { ...s, view: a.v, palette: false, sel: a.v === 'orders' ? s.sel : null };
    case 'open': return { ...s, view: 'orders', sel: a.id, filter: 'all', q: '', palette: false, toasts: s.toasts.filter((x) => x.open !== a.id) };
    case 'select': return { ...s, sel: a.id };
    case 'range': return { ...s, range: a.r };
    case 'filter': return { ...s, filter: a.f };
    case 'q': return { ...s, q: a.q };
    case 'palette': return { ...s, palette: a.open };
    case 'van': return { ...s, van: a.v };
    case 'arrive': {
      // the van reaches its next stop: that drop is done, the one after becomes next
      const v = s.vans[a.v], i = v.stops.findIndex((x) => x.state !== 'done');
      if (i < 0) return s;
      const stops = v.stops.map((x, k) => (k === i ? { ...x, state: 'done' as const, fresh: false } : k === i + 1 ? { ...x, state: 'next' as const } : x));
      const seq = s.seq + 1;
      // that café's order on this van is delivered too, so Orders and Payouts agree with the map
      const stop = v.stops[i];
      const orders = s.orders.map((o) => (o.van === a.v && o.cafe === stop.cafe && o.area === stop.place && o.status !== 'Delivered'
        ? { ...o, status: 'Delivered' as const, signer: 'Barista on shift', log: [...o.log, { t: stop.t, text: 'Delivered · ePOD signed' }] } : o));
      return { ...s, seq, orders, vans: { ...s.vans, [a.v]: { ...v, stops } }, feed: [feedItem(seq, stop.t, 'epod', `Delivered at ${stop.place}`, `${stop.cafe} · ${a.v}`), ...s.feed] };
    }
    case 'toast-off': return { ...s, toasts: s.toasts.filter((x) => x.id !== a.id) };
    case 'reorder': {
      if (s.drafted.includes(a.sku)) return s;
      const seq = s.seq + 1;
      return { ...s, seq, drafted: [...s.drafted, a.sku], feed: [feedItem(seq, '14:24', 'po', `PO drafted for ${a.sku}`, 'Sent to Araku Estates for approval'), ...s.feed] };
    }
    case 'sync': {
      if (a.s === 'syncing') return { ...s, sync: 'syncing' };
      const seq = s.seq + 1;
      return { ...s, seq, sync: 'done', feed: [feedItem(seq, '14:25', 'invoice', 'INV-2209 synced to Tally', 'Third Wave · ₹4,980'), ...s.feed] };
    }
    case 'crate': return { ...s, crates: s.crates.map((c) => (c.cafe === a.cafe ? { ...c, back: true } : c)) };
    case 'incoming': {
      const src = INCOMING[s.next];
      if (!src) return s;
      const o: Order = { ...src, log: [...src.log] };
      const seq = s.seq + 2;
      return {
        ...s, next: s.next + 1, seq,
        orders: [o, ...s.orders],
        feed: [feedItem(seq - 1, o.placed, 'order', `New order ${o.id}`, `${o.cafe} · ${o.channel}`), ...s.feed],
        toasts: keepToasts([...s.toasts, { id: seq, kind: 'order', title: `New order from ${o.cafe}`, body: `${o.id} · via ${o.channel} · ${rupees(orderTotal(o))}`, open: o.id }]),
      };
    }
    case 'advance': {
      const o = s.orders.find((x) => x.id === a.id);
      if (!o || o.status === 'Delivered') return s;
      const next = STEPS[STEPS.indexOf(o.status) + 1], t = TIMES[next];
      const no: Order = { ...o, status: next, fresh: false, log: [...o.log] };
      let { inv, vans, feed, toasts, seq } = s;
      const lines = o.lines.map((l) => `${l.qty.toLocaleString('en-IN')} × ${l.sku}`).join(', ');
      if (next === 'Allocated') {
        inv = inv.map((it) => { const l = o.lines.find((x) => x.sku === it.sku); return l ? { ...it, res: it.res + l.qty } : it; });
        no.log.push({ t, text: 'Confirmed · stock reserved in Bay 02' });
        feed = [feedItem(++seq, t, 'stock', `Stock reserved for ${o.id}`, lines), ...feed];
      } else if (next === 'Packed') {
        no.log.push({ t, text: 'Packed · thermal label printed' });
        feed = [feedItem(++seq, t, 'label', `${o.id} packed`, 'Label printed · Bay 02 dock'), ...feed];
        toasts = keepToasts([...toasts, { id: ++seq, kind: 'info', title: 'Label printed', body: `${o.id} · ${o.cafe}` }]);
      } else if (next === 'Out for delivery') {
        const n = 1 + Math.max(...s.orders.map((x) => (x.invoice ? parseInt(x.invoice.slice(4), 10) : 0)));
        no.van = 'Van 05'; no.eta = '16:30'; no.invoice = `INV-${n}`;
        no.log.push({ t, text: 'Dispatched with Van 05 · ETA 16:30' }, { t, text: `e-Invoice INV-${n} generated · synced to Tally` });
        const v = vans['Van 05'];
        if (!v.stops.some((x) => x.cafe === o.cafe && x.place === o.area)) {
          vans = { ...vans, 'Van 05': { ...v, status: 'On route', stops: [...v.stops, { place: o.area, cafe: o.cafe, t: '16:30', state: 'todo', fresh: true }] } };
        }
        feed = [feedItem(++seq, t, 'van', `${o.id} added to Van 05`, `${o.cafe} · ETA 16:30`), feedItem(++seq, t, 'invoice', `INV-${n} synced to Tally`, `IRN generated · ${rupees(orderTotal(o))}`), ...feed];
      } else {
        no.signer = 'Kavya';
        no.log.push({ t, text: 'Delivered · ePOD signed by Kavya' });
        inv = inv.map((it) => { const l = o.lines.find((x) => x.sku === it.sku); return l ? { ...it, on: it.on - l.qty, res: Math.max(0, it.res - l.qty) } : it; });
        const v = vans[o.van ?? 'Van 05'];
        const stops = v.stops.map((x) => (x.cafe === o.cafe ? { ...x, state: 'done' as const, fresh: false } : x.state === 'todo' && x.t < o.eta ? { ...x, state: 'done' as const } : x));
        vans = { ...vans, [v.id]: { ...v, status: stops.every((x) => x.state === 'done') ? 'Returning to depot' : 'On route', stops } };
        feed = [feedItem(++seq, t, 'epod', `ePOD signed by Kavya`, `${o.cafe} · ${o.id}`), feedItem(++seq, t, 'payout', `${rupees(orderTotal(o))} scheduled for payout`, 'Releases tomorrow, 09:00'), ...feed];
        toasts = keepToasts([...toasts, { id: ++seq, kind: 'epod', title: `Delivered to ${o.cafe}`, body: `ePOD signed by Kavya · ${t}` }]);
      }
      return { ...s, orders: s.orders.map((x) => (x.id === o.id ? no : x)), inv, vans, feed, toasts, seq };
    }
  }
}

// ── Home: KPIs and the revenue series for each range ──
export const BASE_ESCROW = 152800;
export const KPI: Record<Range, { orders: number; ordersDelta: number; revenue: number; revenueDelta: number; ontime: number; ontimeDelta: number; vs: string }> = {
  today: { orders: 17, ordersDelta: 33.3, revenue: 96240, revenueDelta: 27.3, ontime: 98.2, ontimeDelta: 0.6, vs: 'vs last Wed' },
  '7d': { orders: 161, ordersDelta: 9.1, revenue: 705440, revenueDelta: 4.7, ontime: 97.9, ontimeDelta: 0.4, vs: 'vs prev. week' },
  '30d': { orders: 705, ordersDelta: 12.6, revenue: 2984600, revenueDelta: 11.2, ontime: 98.4, ontimeDelta: 1.1, vs: 'vs prev. 30 days' },
};

export type Series = { labels: string[]; cur: [number, number][]; prev: number[]; legend: [string, string]; ticks: number[]; cumulative: boolean };
const days30 = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 8, 23 + i);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
});
const day30 = (i: number, k: number) => Math.round((96000 + 13000 * Math.sin(i / 4.3) + ((i + 3) % 7 === 0 ? -34000 : 0) + ((i * 7919) % 9000)) * k);
export const SERIES: Record<Range, Series> = {
  today: {
    labels: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
    cur: [[0, 0], [1, 8200], [2, 21600], [3, 39400], [4, 58000], [5, 74500], [6, 88300], [6.33, 96240]],
    prev: [0, 7100, 18900, 33000, 49800, 63200, 74000, 82600, 91000, 99400, 106100, 111800, 115000],
    legend: ['Today', 'Last Wednesday'], ticks: [0, 3, 6, 9, 12], cumulative: true,
  },
  '7d': {
    labels: ['Thu 16', 'Fri 17', 'Sat 18', 'Sun 19', 'Mon 20', 'Tue 21', 'Wed 22'],
    cur: [[0, 102400], [1, 88900], [2, 121300], [3, 64200], [4, 97600], [5, 134800], [6, 96240]],
    prev: [94800, 91200, 110700, 58400, 92300, 118900, 115000],
    legend: ['This week', 'Previous week'], ticks: [0, 1, 2, 3, 4, 5, 6], cumulative: false,
  },
  '30d': {
    labels: days30,
    cur: days30.map((_, i) => [i, i === 29 ? 96240 : day30(i, 1)] as [number, number]),
    prev: days30.map((_, i) => day30(i + 2, 0.9)),
    legend: ['Last 30 days', 'Previous 30 days'], ticks: [0, 7, 14, 21, 29], cumulative: false,
  },
};
