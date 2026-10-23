// Loads the self-hosted Gradient 365 scripts in public/g365/js.
// Shared libraries (three.js, kit…) load once per page no matter how many sections ask for them;
// `fresh` scripts run again on every call because they build DOM for the section that mounted.
const JS = '/g365/js/';
// Bump when public/g365/js changes so browsers refetch; otherwise the files cache normally.
const BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID ?? '3';
const cache: Record<string, Promise<void>> = {};

function inject(file: string) {
  return new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `${JS}${file}?v=${BUILD_ID}`;
    s.async = false;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`failed to load ${file}`));
    document.body.appendChild(s);
  });
}

export async function loadG365(shared: string[], fresh: string[] = []) {
  for (const f of shared) await (cache[f] ??= inject(f));
  for (const f of fresh) await inject(f);
}

export const G365_LIBS = ['three.min.js', 'kit.js'];
