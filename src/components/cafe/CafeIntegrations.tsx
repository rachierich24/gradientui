// Section 03 — the tools behind the counter the café portal connects to (same logos as the main site's
// integrations section). A simple first pass.
const TOOLS = [
  { nm: 'Petpooja', ct: 'POS', img: '/logos/integrations/petpooja.jpeg' },
  { nm: 'UrbanPiper', ct: 'POS', img: '/logos/integrations/urbanpiper.jpeg' },
  { nm: 'Tally', ct: 'Accounting', img: '/logos/integrations/tally.jpeg' },
  { nm: 'Zoho Books', ct: 'Accounting', img: '/logos/integrations/zoho-books.jpeg' },
  { nm: 'Razorpay', ct: 'Payments', img: '/logos/integrations/razorpay.jpeg' },
  { nm: 'WhatsApp', ct: 'Order updates', img: '/logos/integrations/whatsapp.svg' },
  { nm: 'GST Portal', ct: 'Compliance', img: '/logos/integrations/gst.svg', dark: true },   // a white mark: needs a dark tile
  { nm: 'Google Sheets', ct: 'Reports', img: '/logos/integrations/google-sheets.png' },
];

export function CafeIntegrations() {
  return (
    <section className="cafe-sec" id="integrations" aria-labelledby="cafe-integ-h">
      <div className="cafe-wrap">
        <p className="cafe-eyebrow">Integrations</p>
        <h2 className="cafe-h2" id="cafe-integ-h">Works with the tools behind your counter.</h2>
        <p className="cafe-lead">Orders flow into your POS stock, bills land in your books, and payments settle without re-typing a thing.</p>
        <div className="cafe-integ">
          {TOOLS.map((t) => (
            <div className="cafe-integ-tile" key={t.nm}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.img} alt="" width={40} height={40} loading="lazy" className={'dark' in t ? 'on-dark' : undefined} />
              <span><b>{t.nm}</b><small>{t.ct}</small></span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
