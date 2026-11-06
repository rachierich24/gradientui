'use client';
// Plan a trial: the live campaign builder that sits under the hero. Pick the product, the cities and the
// kind of café, slide the number of trial kits, and the matched cafés, the suppliers who'll carry the kits
// and a dot field of the cafés reached all update. Sample figures, labelled as such.
import { useMemo, useState } from 'react';
import { fmt, useTween } from './shared';

const PRODUCTS = ['Barista oat milk', 'Cold brew concentrate', 'Hazelnut syrup'];
const CITIES = [
  { id: 'blr', name: 'Bangalore', suppliers: 9 },
  { id: 'bom', name: 'Mumbai', suppliers: 7 },
  { id: 'del', name: 'Delhi NCR', suppliers: 6 },
] as const;
const TYPES = [
  { id: 'specialty', name: 'Specialty coffee' },
  { id: 'chains', name: 'Café chains' },
  { id: 'bakery', name: 'Bakery cafés' },
] as const;
type CityId = (typeof CITIES)[number]['id'];
type TypeId = (typeof TYPES)[number]['id'];
// verified cafés by city and type (sample)
const CAFES: Record<CityId, Record<TypeId, number>> = {
  blr: { specialty: 138, chains: 64, bakery: 52 },
  bom: { specialty: 104, chains: 58, bakery: 41 },
  del: { specialty: 70, chains: 49, bakery: 37 },
};
const DOTS = 140;
const TOTAL = Object.values(CAFES).reduce((s, c) => s + Object.values(c).reduce((a, b) => a + b, 0), 0);

function Toggle<T extends string>({ items, on, flip }: { items: readonly { id: T; name: string }[]; on: T[]; flip: (id: T) => void }) {
  return (
    <div className="brd-chips">
      {items.map((x) => (
        <button key={x.id} type="button" aria-pressed={on.includes(x.id)} onClick={() => flip(x.id)}>
          <i aria-hidden="true" />{x.name}
        </button>
      ))}
    </div>
  );
}

function Builder({ onStart }: { onStart: () => void }) {
  const [product, setProduct] = useState(PRODUCTS[0]);
  const [cities, setCities] = useState<CityId[]>(['blr', 'bom']);
  const [types, setTypes] = useState<TypeId[]>(['specialty']);
  const [kits, setKits] = useState(120);
  // keep at least one city and one type selected
  const flip = <T,>(list: T[], set: (v: T[]) => void) => (id: T) => set(list.includes(id) ? (list.length > 1 ? list.filter((x) => x !== id) : list) : [...list, id]);

  const matched = useMemo(() => cities.reduce((s, c) => s + types.reduce((t, k) => t + CAFES[c][k], 0), 0), [cities, types]);
  const reached = Math.min(kits, matched);
  const suppliers = cities.reduce((s, c) => s + CITIES.find((x) => x.id === c)!.suppliers, 0);
  const m = useTween(matched), r = useTween(reached), sp = useTween(suppliers);
  // the dot field: every dot is a matched café (scaled to the field), lit if it gets a kit
  const shown = Math.round((matched / TOTAL) * DOTS), lit = Math.round((reached / Math.max(1, matched)) * shown);

  return (
    <div className="brd-builder" aria-label="Trial campaign builder">
      <div className="brd-builder-top">
        <span className="brd-live"><i />New trial campaign</span>
        <span className="brd-sample">Sample figures</span>
      </div>

      <div className="brd-field">
        <span className="brd-label">Product</span>
        <div className="brd-seg" role="radiogroup" aria-label="Product">
          {PRODUCTS.map((p) => <button key={p} type="button" role="radio" aria-checked={p === product} onClick={() => setProduct(p)}>{p}</button>)}
        </div>
      </div>
      <div className="brd-field">
        <span className="brd-label">Cities</span>
        <Toggle items={CITIES} on={cities} flip={flip(cities, setCities)} />
      </div>
      <div className="brd-field">
        <span className="brd-label">Cafés</span>
        <Toggle items={TYPES} on={types} flip={flip(types, setTypes)} />
      </div>
      <div className="brd-field">
        <span className="brd-label">Trial kits <b>{kits}</b></span>
        <input type="range" min={20} max={400} step={10} value={kits} onChange={(e) => setKits(+e.target.value)} aria-label="Trial kits" style={{ ['--k' as string]: `${((kits - 20) / 380) * 100}%` }} />
      </div>

      <div className="brd-out">
        <div className="brd-dots" aria-hidden="true">
          {Array.from({ length: DOTS }, (_, i) => <i key={i} className={i < lit ? 'is-lit' : i < shown ? 'is-on' : ''} style={{ transitionDelay: `${(i % 20) * 12}ms` }} />)}
        </div>
        <dl className="brd-stats">
          <div><dt>Verified cafés matched</dt><dd>{fmt(m)}</dd></div>
          <div><dt>Cafés getting a kit</dt><dd className="is-accent">{fmt(r)}</dd></div>
          <div><dt>Suppliers carrying kits</dt><dd>{fmt(sp)}</dd></div>
        </dl>
      </div>

      <button type="button" className="brd-btn brd-btn-accent brd-builder-go" onClick={onStart}>
        Launch {product.toLowerCase()} trial
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
      </button>
    </div>
  );
}

export function BrandPlanner({ onStart }: { onStart: () => void }) {
  return (
    <section className="brd-plan" id="plan" aria-labelledby="brd-plan-title">
      <div className="brd-wrap brd-plan-in">
        <div className="brd-plan-copy">
          <span className="brd-eyebrow"><i />Plan a trial</span>
          <h2 id="brd-plan-title">Pick your cafés. We’ll get the kits there.</h2>
          <p>
            Choose the cities and the kind of café you want to be in. Gradient matches you with verified cafés and the
            suppliers who already deliver to them, so your trial kits ride along with their regular orders.
          </p>
          <ul className="brd-proof">
            <li><b>312</b> verified specialty cafés</li>
            <li><b>3</b> cities: Bangalore, Mumbai, Delhi NCR</li>
            <li><b>0</b> competitor data shared</li>
          </ul>
        </div>
        <Builder onStart={onStart} />
      </div>
    </section>
  );
}
