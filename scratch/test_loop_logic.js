// Simulation of state machine
const completions = [
  "You’d actually fulfill.",
  "Roasted, packed, dispatched.",
  "Ready to pack and ship.",
  "Settled in 24 hours.",
];

let completionIndex = 0;
let charIndex = 0;
let phase = 'streaming';

function step() {
  const target = completions[completionIndex % completions.length];
  if (phase === 'streaming') {
    if (charIndex < target.length) {
      charIndex += 2;
      console.log(`[streaming] "${target.slice(0, charIndex)}"`);
    } else {
      phase = 'holding';
      console.log(`[holding] "${target}"`);
      setTimeout(() => {
        phase = 'exiting';
        console.log(`[exiting] "${target}"`);
        setTimeout(() => {
          completionIndex = (completionIndex + 1) % completions.length;
          charIndex = 0;
          phase = 'streaming';
          console.log(`[next] moving to completionIndex=${completionIndex}`);
        }, 380);
      }, 500);
    }
  }
}

const interval = setInterval(() => {
  step();
  if (completionIndex >= 2 && phase === 'holding') {
    clearInterval(interval);
    console.log('SUCCESS: State machine cleanly transitioned and looped!');
  }
}, 50);
