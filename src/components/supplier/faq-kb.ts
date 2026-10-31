// The supplier help desk: the answers the FAQ section ("Ask anything") gives, and the search that finds
// them. Shared by the section (looping questions, offline fallback) and /api/supplier-faq, which answers
// from these entries only. To teach it something new, add an entry; `also` holds other ways people ask.
// Keep answers to what Gradient actually offers; anything we can't promise goes to the team instead.

export type Topic = 'Getting started' | 'Orders' | 'Payments' | 'Delivery' | 'Pricing' | 'Accounting' | 'Crates' | 'Support';
export type Entry = { id: string; topic: Topic; q: string; a: string; also: string[] };

export const KB: Entry[] = [
  {
    id: 'join', topic: 'Getting started', q: 'How do I join Gradient as a supplier?',
    a: 'Apply from this page with your GSTIN, FSSAI licence and business bank account. Once our team has verified them, you upload your catalogue, set your prices and start taking café orders. Most suppliers finish onboarding in under two hours.',
    also: ['sign up', 'register', 'get started', 'onboarding', 'how long does onboarding take', 'become a supplier', 'apply'],
  },
  {
    id: 'documents', topic: 'Getting started', q: 'What documents do I need to sign up?',
    a: 'Your GSTIN, an FSSAI licence if you sell food or beverages, and the details of the business bank account you want to be paid into. That is all we need to verify you.',
    also: ['kyc', 'paperwork', 'gst number', 'fssai', 'verification', 'requirements'],
  },
  {
    id: 'fees', topic: 'Pricing', q: 'How much does Gradient charge suppliers?',
    a: 'Pricing depends on your categories and order volume, so our supplier team shares it with you during onboarding. Leave your question below and we will send you the details.',
    also: ['commission', 'fees', 'cost', 'charges', 'subscription', 'is it free', 'take rate', 'price of gradient'],
  },
  {
    id: 'paid', topic: 'Payments', q: 'When do I get paid?',
    a: 'Cafés pay when they place the order and the money is held in escrow. When your driver delivers and the café signs the electronic proof of delivery (ePOD), it is released to your bank account at 9:00 am the next working day (T+1).',
    also: ['payment', 'settlement', 'payout', 'money', 'how fast', 'escrow', 'release', 't+1', 'bank transfer'],
  },
  {
    id: 'unpaid', topic: 'Payments', q: 'What if a café doesn’t pay?',
    a: 'That cannot happen on Gradient: every order is paid into escrow before you dispatch it, so there is no credit to chase and no bad debt. You see the money waiting in escrow before the van leaves.',
    also: ['bad debt', 'credit', 'default', 'defaulter', 'doesnt pay', 'dont pay', 'not paying', 'outstanding', 'dues', 'risk'],
  },
  {
    id: 'fleet', topic: 'Delivery', q: 'Do I have to change my delivery vans or drivers?',
    a: 'No. Deliver with your own vans and drivers, who use the Gradient driver app for proof of delivery, with your existing logistics partners, or with Gradient’s delivery partners. You can mix all three.',
    also: ['delivery', 'logistics', 'fleet', 'van', 'driver', 'own drivers', 'own vans', '3pl', 'shipping', 'dispatch', 'courier'],
  },
  {
    id: 'epod', topic: 'Delivery', q: 'What is an ePOD?',
    a: 'An electronic proof of delivery. The café signs on the driver’s phone when the goods arrive, which confirms the delivery and releases your payment from escrow. No paper challans to lose.',
    also: ['proof of delivery', 'signature', 'challan', 'delivery confirmation'],
  },
  {
    id: 'orders', topic: 'Orders', q: 'How do cafés find me and order from me?',
    a: 'Your catalogue is listed in the Gradient marketplace, where 340+ cafés order their supplies. They order from your catalogue at your prices, reorder in a tap, and every order lands in your portal ready to pack.',
    also: ['customers', 'new cafes', 'marketplace', 'discover', 'more sales', 'buyers', 'reach', 'grow'],
  },
  {
    id: 'whatsapp', topic: 'Orders', q: 'Can my cafés still order on WhatsApp?',
    a: 'Yes. Orders that come in on WhatsApp are captured into the same order book as marketplace orders, and payment reminders go out on WhatsApp too, so nothing lives only in a chat.',
    also: ['whatsapp', 'phone orders', 'chat', 'messages', 'calls'],
  },
  {
    id: 'tiers', topic: 'Pricing', q: 'Can I charge different prices to different cafés?',
    a: 'Yes. Create private price tiers, for example one for multi-outlet chains and one for independent cafés, and assign cafés to them. Each café only ever sees its own prices.',
    also: ['pricing', 'discount', 'chain pricing', 'custom price', 'price list', 'rates', 'wholesale price', 'bulk'],
  },
  {
    id: 'catalogue', topic: 'Pricing', q: 'How do I manage my catalogue and stock?',
    a: 'Add products, pack sizes and prices in the portal and update stock whenever it changes. Changes show to cafés straight away, so they never order something you have run out of.',
    also: ['inventory', 'products', 'sku', 'stock', 'out of stock', 'catalog', 'listing', 'upload'],
  },
  {
    id: 'accounting', topic: 'Accounting', q: 'Does Gradient work with Tally or Zoho Books?',
    a: 'Yes. Invoices are pushed to Tally Prime, Zoho Books or QuickBooks as they are raised, and payments are matched to the right invoice, so there is no double entry.',
    also: ['tally', 'zoho', 'quickbooks', 'accounting software', 'ledger', 'erp', 'integration', 'sync', 'reconciliation'],
  },
  {
    id: 'gst', topic: 'Accounting', q: 'Are invoices GST compliant?',
    a: 'Yes. Gradient raises GST e-invoices with an IRN when an order is dispatched, so every sale is ready for your GST return without extra work.',
    also: ['gst', 'e-invoice', 'irn', 'tax', 'invoice', 'billing', 'returns', 'compliance'],
  },
  {
    id: 'crates', topic: 'Crates', q: 'How does returnable crate tracking work?',
    a: 'Each returnable crate gets a QR tag. It is scanned out with an order and scanned back in when the driver collects it on the next run, so you always know which café has how many of your crates.',
    also: ['crates', 'returnables', 'packaging', 'qr', 'rfid', 'containers', 'empties'],
  },
  {
    id: 'reports', topic: 'Orders', q: 'What reports do I get?',
    a: 'Your portal shows sales, orders, cafés served and payments in one place, by day, week or month, along with which products are selling best.',
    also: ['analytics', 'dashboard', 'reports', 'insights', 'sales data', 'performance'],
  },
  {
    id: 'where', topic: 'Support', q: 'Where does Gradient operate?',
    a: 'Gradient works with cafés across India, with supplier teams in Bangalore and Mumbai.',
    also: ['cities', 'city', 'location', 'india', 'bangalore', 'bengaluru', 'mumbai', 'delhi', 'pune', 'hyderabad', 'chennai', 'kolkata', 'serviceable', 'area', 'region'],
  },
  {
    id: 'human', topic: 'Support', q: 'Can I talk to someone?',
    a: 'Of course. Our supplier success team in Bangalore and Mumbai can walk you through onboarding or anything custom. Ask below with your email and they will get back to you.',
    also: ['contact', 'support', 'call', 'help', 'sales team', 'speak', 'human', 'demo'],
  },
];

// ── search ──────────────────────────────────────────────────────────────────
const STOP = new Set('a an and are as at be by can could do does for from get got have how i if in into is it its me my need of on or our should so that the their them then there they this to us use want was we what when where which who why will with would you your'.split(' '));
// words that mean the same thing here, folded to one
const SAME: Record<string, string> = {
  paid: 'payment', pay: 'payment', payout: 'payment', settle: 'payment', settlement: 'payment', money: 'payment', fund: 'payment',
  charge: 'fee', commission: 'fee', cost: 'fee', price: 'pricing', rate: 'pricing',
  van: 'delivery', driver: 'delivery', deliver: 'delivery', ship: 'delivery', dispatch: 'delivery', logistic: 'delivery', fleet: 'delivery',
  signup: 'join', register: 'join', onboard: 'join', apply: 'join',
  cafe: 'cafe', café: 'cafe', restaurant: 'cafe', customer: 'cafe', buyer: 'cafe',
  invoice: 'invoice', bill: 'invoice', tally: 'accounting', zoho: 'accounting', quickbook: 'accounting',
  stock: 'inventory', sku: 'catalogue', catalog: 'catalogue', product: 'catalogue',
  crate: 'crate', returnable: 'crate',
};
const stem = (w: string) => w.replace(/(ing|ed|es|s)$/, '') || w;
export function words(text: string) {
  return text.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9+ ]/g, ' ').split(/\s+/)
    .filter((w) => w && !STOP.has(w)).map((w) => SAME[w] ?? SAME[stem(w)] ?? stem(w));
}

const DOCS = KB.map((e) => ({ e, head: words(`${e.q} ${e.also.join(' ')}`), body: words(e.a) }));
const IDF = (() => {
  const df = new Map<string, number>();
  for (const d of DOCS) for (const w of new Set([...d.head, ...d.body])) df.set(w, (df.get(w) ?? 0) + 1);
  return (w: string) => Math.log(1 + DOCS.length / (df.get(w) ?? 0.5));
})();

/** Entries that answer the question, best first, with a 0–1 confidence. */
export function search(question: string, limit = 3) {
  const qs = [...new Set(words(question))];
  if (!qs.length) return [];
  const top = qs.reduce((s, w) => s + IDF(w), 0);
  return DOCS.map(({ e, head, body }) => {
    const s = qs.reduce((sum, w) => sum + (head.includes(w) ? IDF(w) : body.includes(w) ? IDF(w) * 0.45 : 0), 0);
    return { entry: e, score: s / top, hits: qs.filter((w) => head.includes(w)).length };
  }).filter((r) => r.score > 0).sort((a, b) => b.score - a.score || b.hits - a.hits).slice(0, limit);
}
/** A match is good enough to answer with on its own above this. */
export const CONFIDENT = 0.42;
