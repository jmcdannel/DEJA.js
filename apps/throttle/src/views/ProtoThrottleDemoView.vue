<template>
  <div class="proto-demo-page">
    <section class="intro">
      <h1 class="title">ProtoThrottle Control Demo</h1>
      <p class="subtitle">
        Static mock-up of the ProtoThrottle handheld so the control proportions, finishes, and labelling can be reviewed
        before wiring the UI to live data. The layout below strives to match the latest product reference photo.
      </p>
    </section>

    <section class="demo-stage">
      <div class="proto-throttle" role="img" aria-label="ProtoThrottle handheld controller preview">
        <div class="plate"></div>

        <div class="screw screw--tl"></div>
        <div class="screw screw--tr"></div>
        <div class="screw screw--bl"></div>
        <div class="screw screw--br"></div>

        <div class="upper-controls">
          <div class="button-stack">
            <div class="indicator-button indicator-button--main"></div>
            <div class="indicator-button indicator-button--secondary"></div>
          </div>

          <div class="display-cluster">
            <div class="display-window">
              <div class="display-border"></div>
              <div class="display-screen">
                <div class="lcd-gloss"></div>
                <div class="lcd-grid">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
            <div class="display-scale">
              <span>8</span>
              <span>7</span>
              <span>6</span>
              <span>5</span>
              <span>4</span>
              <span>3</span>
              <span>2</span>
              <span>1</span>
              <span class="idle">IDLE</span>
            </div>
          </div>

          <div class="master-toggle">
            <svg viewBox="0 0 120 220" aria-hidden="true" focusable="false">
              <defs>
                <linearGradient id="toggleStem" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stop-color="#1c1f27" />
                  <stop offset="50%" stop-color="#2f3340" />
                  <stop offset="100%" stop-color="#171921" />
                </linearGradient>
                <linearGradient id="toggleSlot" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stop-color="#1c2028" />
                  <stop offset="100%" stop-color="#08090d" />
                </linearGradient>
                <radialGradient id="toggleKnobGradient" cx="35%" cy="30%" r="70%">
                  <stop offset="0%" stop-color="#f9fafc" />
                  <stop offset="35%" stop-color="#d6d8df" />
                  <stop offset="100%" stop-color="#838894" />
                </radialGradient>
              </defs>
              <rect class="toggle-slot" x="40" y="36" width="40" height="150" rx="18"></rect>
              <rect class="toggle-slot-inner" x="46" y="42" width="28" height="138" rx="14"></rect>
              <path class="toggle-stem" d="M60 38a18 18 0 0 1 18 18v72c0 6.6 5.4 12 12 12h6v34H54v-34h6c6.6 0 12-5.4 12-12V56a12 12 0 0 0-12-12h-6V38z"></path>
              <circle class="toggle-knob" cx="60" cy="44" r="22"></circle>
            </svg>
          </div>
        </div>

        <div class="lever-bank">
          <div class="lever-row lever-row--bell">
            <span class="lever-label">BELL</span>
            <svg class="lever lever--bell" viewBox="0 0 320 120" aria-hidden="true" focusable="false">
              <defs>
                <linearGradient id="slotGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stop-color="#090a0d" />
                  <stop offset="100%" stop-color="#1c1f27" />
                </linearGradient>
                <linearGradient id="leverBody" x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" stop-color="#1c1f27" />
                  <stop offset="45%" stop-color="#2b303a" />
                  <stop offset="100%" stop-color="#12151b" />
                </linearGradient>
                <radialGradient id="leverKnob" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stop-color="#f8f9fb" />
                  <stop offset="35%" stop-color="#d4d6dd" />
                  <stop offset="100%" stop-color="#868b97" />
                </radialGradient>
              </defs>
              <rect class="lever-slot" x="30" y="40" width="220" height="44" rx="18"></rect>
              <rect class="lever-slot-inner" x="40" y="46" width="200" height="32" rx="16"></rect>
              <path class="lever-arm" d="M90 38h120c10 0 18 8 18 18s-8 18-18 18h-54c-8.8 0-16 7.2-16 16v12H90z"></path>
              <circle class="lever-knob" cx="210" cy="74" r="26"></circle>
            </svg>
          </div>

          <div class="lever-row lever-row--throttle">
            <span class="lever-label lever-label--ghost"></span>
            <svg class="lever lever--throttle" viewBox="0 0 340 140" aria-hidden="true" focusable="false">
              <defs>
                <linearGradient id="throttleSlot" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stop-color="#090a0d" />
                  <stop offset="100%" stop-color="#151821" />
                </linearGradient>
                <linearGradient id="throttleBody" x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" stop-color="#151821" />
                  <stop offset="40%" stop-color="#2b303a" />
                  <stop offset="100%" stop-color="#0c0f16" />
                </linearGradient>
                <radialGradient id="throttleKnob" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stop-color="#fefefe" />
                  <stop offset="25%" stop-color="#dcdfe6" />
                  <stop offset="100%" stop-color="#8b909c" />
                </radialGradient>
              </defs>
              <rect class="throttle-slot" x="20" y="44" width="260" height="56" rx="20"></rect>
              <rect class="throttle-slot-inner" x="34" y="52" width="232" height="40" rx="18"></rect>
              <path class="throttle-arm" d="M86 42h134c12 0 22 10 22 22s-10 22-22 22h-66c-9.9 0-18 8.1-18 18v24H86z"></path>
              <circle class="throttle-knob" cx="230" cy="88" r="30"></circle>
            </svg>
            <div class="notch-guide">
              <span>8</span>
              <span>7</span>
              <span>6</span>
              <span>5</span>
              <span>4</span>
              <span>3</span>
              <span>2</span>
              <span>1</span>
              <span class="guide-idle">IDLE</span>
            </div>
          </div>
        </div>

        <div class="dial-bank">
          <div class="dial-module">
            <div class="dial-title">HEADLIGHTS<br />REAR</div>
            <div class="dial-scale">
              <span>OFF</span>
              <span>DIM</span>
              <span>BRT</span>
            </div>
            <svg class="rotary-dial" viewBox="0 0 180 180" aria-hidden="true" focusable="false">
              <defs>
                <linearGradient id="dialFace" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stop-color="#404550" />
                  <stop offset="100%" stop-color="#1e2129" />
                </linearGradient>
                <radialGradient id="dialHighlight" cx="35%" cy="30%" r="65%">
                  <stop offset="0%" stop-color="#f4f5f8" />
                  <stop offset="35%" stop-color="#d7d9df" />
                  <stop offset="100%" stop-color="#9095a1" />
                </radialGradient>
              </defs>
              <circle class="dial-base" cx="90" cy="90" r="74"></circle>
              <circle class="dial-ring" cx="90" cy="90" r="82"></circle>
              <path class="dial-pointer" d="M90 90 42 102" stroke-width="14" stroke-linecap="round"></path>
              <circle class="dial-cap" cx="90" cy="90" r="26"></circle>
            </svg>
          </div>

          <div class="dial-module">
            <div class="dial-title">HEADLIGHTS<br />FRONT</div>
            <div class="dial-scale dial-scale--front">
              <span>DIM</span>
              <span>BRT</span>
              <span>DITCH</span>
              <span>LTS</span>
            </div>
            <svg class="rotary-dial" viewBox="0 0 180 180" aria-hidden="true" focusable="false">
              <circle class="dial-base" cx="90" cy="90" r="74"></circle>
              <circle class="dial-ring" cx="90" cy="90" r="82"></circle>
              <path class="dial-pointer dial-pointer--front" d="M90 90 128 60" stroke-width="14" stroke-linecap="round"></path>
              <circle class="dial-cap" cx="90" cy="90" r="26"></circle>
            </svg>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
:global(body) {
  background: radial-gradient(circle at top, #0f1117 0%, #050609 60%, #030305 100%);
}

.proto-demo-page {
  color: #d9dde7;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  padding: clamp(2rem, 4vw, 3.5rem) clamp(1.5rem, 4vw, 3rem) 4rem;
  display: flex;
  flex-direction: column;
  gap: clamp(2.5rem, 6vw, 4.5rem);
  min-height: 100vh;
}

.intro {
  max-width: 720px;
}

.title {
  font-size: clamp(2rem, 3.3vw, 2.6rem);
  font-weight: 600;
  margin: 0 0 0.75rem;
  letter-spacing: 0.01em;
}

.subtitle {
  line-height: 1.6;
  margin: 0;
  color: rgba(217, 221, 231, 0.72);
  font-size: clamp(1rem, 1.65vw, 1.15rem);
}

.demo-stage {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.proto-throttle {
  position: relative;
  width: clamp(280px, 38vw, 380px);
  padding: clamp(1.75rem, 3vw, 2.5rem) clamp(1.6rem, 3vw, 2.3rem) clamp(2.8rem, 5vw, 4rem);
  border-radius: 22px;
  background: linear-gradient(155deg, #6d7383 0%, #424855 45%, #2d323d 65%, #1f232c 100%);
  box-shadow: 0 30px 60px rgba(3, 5, 9, 0.65), inset 0 2px 6px rgba(255, 255, 255, 0.04);
  display: flex;
  flex-direction: column;
  gap: clamp(1.8rem, 3vw, 2.5rem);
  align-items: stretch;
  isolation: isolate;
}

.proto-throttle::after {
  content: '';
  position: absolute;
  bottom: -34px;
  left: 50%;
  transform: translateX(-50%);
  width: 140px;
  height: 110px;
  background: inherit;
  border-radius: 20px;
  clip-path: polygon(50% 0, 100% 42%, 100% 100%, 0 100%, 0 42%);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  filter: brightness(0.92);
  z-index: -1;
}

.plate {
  position: absolute;
  inset: 8px;
  border-radius: 16px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.04), rgba(10, 12, 18, 0.4));
  box-shadow: inset 0 2px 3px rgba(255, 255, 255, 0.05), inset 0 -4px 8px rgba(0, 0, 0, 0.45);
  pointer-events: none;
}

.screw {
  position: absolute;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #f1f2f5, #a0a6b3 45%, #4f5562 100%);
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.45);
}

.screw::after {
  content: '';
  position: absolute;
  inset: 50% auto auto 50%;
  width: 16px;
  height: 3px;
  background: rgba(44, 50, 60, 0.9);
  transform: translate(-50%, -50%);
  border-radius: 2px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.35);
}

.screw--tl {
  top: 18px;
  left: 22px;
}

.screw--tr {
  top: 18px;
  right: 22px;
}

.screw--bl {
  bottom: 86px;
  left: 32px;
}

.screw--br {
  bottom: 86px;
  right: 32px;
}

.upper-controls {
  position: relative;
  display: grid;
  grid-template-columns: min-content 1fr min-content;
  gap: clamp(1.2rem, 2.6vw, 2.2rem);
  align-items: center;
}

.button-stack {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.indicator-button {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  box-shadow: inset 0 1px 3px rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.45);
  background: radial-gradient(circle at 30% 30%, #f8f9fb, #c2c5cd 45%, #7a7f89 100%);
}

.indicator-button--secondary {
  width: 28px;
  height: 28px;
  background: radial-gradient(circle at 30% 30%, #dfe2e8, #abb0bc 50%, #646874 100%);
}

.display-cluster {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.85rem;
}

.display-window {
  position: relative;
  width: clamp(190px, 50vw, 210px);
  height: clamp(90px, 24vw, 98px);
}

.display-border {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.14), rgba(8, 9, 12, 0.75));
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.15), inset 0 -4px 6px rgba(0, 0, 0, 0.65);
}

.display-screen {
  position: absolute;
  inset: 10px;
  border-radius: 8px;
  background: linear-gradient(160deg, #151819, #090b0c 50%, #181b1c 100%);
  overflow: hidden;
}

.lcd-gloss {
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, rgba(255, 255, 255, 0.12), transparent 40%, transparent 60%, rgba(255, 255, 255, 0.05) 100%);
  opacity: 0.75;
}

.lcd-grid {
  position: absolute;
  inset: 10px 14px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.lcd-grid span {
  border-radius: 6px;
  background: linear-gradient(160deg, rgba(53, 107, 165, 0.5), rgba(10, 35, 52, 0.9));
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.5);
}

.display-scale {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.95rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(233, 236, 246, 0.82);
}

.display-scale .idle {
  letter-spacing: 0.4em;
  margin-left: 0.3rem;
  font-size: 0.9rem;
  color: rgba(233, 236, 246, 0.65);
}

.master-toggle svg {
  width: clamp(84px, 16vw, 108px);
  display: block;
}

.toggle-slot {
  fill: url(#toggleSlot);
  filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.55));
}

.toggle-slot-inner {
  fill: #14171f;
}

.toggle-stem {
  fill: url(#toggleStem);
}

.toggle-knob {
  fill: url(#toggleKnobGradient);
  filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.5));
}

.lever-bank {
  display: flex;
  flex-direction: column;
  gap: clamp(1.2rem, 2vw, 1.6rem);
}

.lever-row {
  display: grid;
  grid-template-columns: minmax(48px, 70px) 1fr minmax(110px, 130px);
  align-items: center;
  gap: clamp(0.8rem, 1.5vw, 1.2rem);
}

.lever-row--bell {
  grid-template-columns: minmax(48px, 70px) 1fr;
}

.lever-label {
  font-size: 0.78rem;
  letter-spacing: 0.36em;
  color: rgba(233, 235, 241, 0.7);
  text-align: center;
}

.lever-label--ghost {
  color: transparent;
}

.lever {
  width: 100%;
  height: auto;
}

.lever-slot {
  fill: url(#slotGradient);
}

.lever-slot-inner {
  fill: #11141b;
}

.lever-arm {
  fill: url(#leverBody);
  filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.5));
}

.lever-knob {
  fill: url(#leverKnob);
  filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.6));
}

.throttle-slot {
  fill: url(#throttleSlot);
}

.throttle-slot-inner {
  fill: #12151c;
}

.throttle-arm {
  fill: url(#throttleBody);
  filter: drop-shadow(0 10px 14px rgba(0, 0, 0, 0.55));
}

.throttle-knob {
  fill: url(#throttleKnob);
  filter: drop-shadow(0 10px 14px rgba(0, 0, 0, 0.55));
}

.notch-guide {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.72rem;
  letter-spacing: 0.28em;
  color: rgba(233, 235, 241, 0.6);
  padding-top: 0.4rem;
}

.guide-idle {
  padding-left: 0.5rem;
  color: rgba(233, 235, 241, 0.45);
}

.dial-bank {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: clamp(1.6rem, 2.4vw, 2rem);
  padding-top: 0.6rem;
}

.dial-module {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.65rem;
  text-align: center;
}

.dial-title {
  font-size: 0.78rem;
  letter-spacing: 0.26em;
  line-height: 1.35;
  color: rgba(233, 235, 241, 0.72);
}

.dial-scale {
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 0.65rem;
  letter-spacing: 0.22em;
  color: rgba(233, 235, 241, 0.55);
}

.dial-scale--front {
  letter-spacing: 0.18em;
}

.rotary-dial {
  width: min(140px, 34vw);
  height: auto;
}

.dial-base {
  fill: url(#dialFace);
  filter: drop-shadow(0 8px 14px rgba(0, 0, 0, 0.55));
}

.dial-ring {
  fill: none;
  stroke: rgba(15, 18, 26, 0.85);
  stroke-width: 10;
}

.dial-pointer {
  fill: none;
  stroke: rgba(17, 19, 27, 0.85);
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5));
}

.dial-pointer--front {
  stroke: rgba(17, 19, 27, 0.88);
}

.dial-cap {
  fill: url(#dialHighlight);
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.55));
}

@media (max-width: 720px) {
  .proto-throttle {
    width: min(86vw, 340px);
  }

  .upper-controls {
    grid-template-columns: min-content 1fr;
    grid-template-rows: auto auto;
  }

  .master-toggle {
    grid-column: 2 / 3;
    justify-self: end;
  }

  .lever-row {
    grid-template-columns: minmax(48px, 70px) 1fr;
  }

  .lever-row--throttle {
    grid-template-columns: minmax(48px, 70px) 1fr;
  }

  .notch-guide {
    order: -1;
    padding-bottom: 0.4rem;
  }

  .dial-bank {
    grid-template-columns: 1fr;
  }
}
</style>
