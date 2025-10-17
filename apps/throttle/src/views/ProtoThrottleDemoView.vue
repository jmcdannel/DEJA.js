<template>
  <div class="proto-demo-page">
    <section class="intro">
      <h1 class="title">ProtoThrottle Control Demo</h1>
      <p class="subtitle">
        This mock-up recreates the ProtoThrottle handheld controller so we can validate layout decisions before wiring it
        to real data. The markup is static but the controls are built using scalable vectors so the device proportions can
        be refined later without rewriting the view.
      </p>
    </section>

    <section class="demo-stage">
      <div class="proto-throttle" role="img" aria-label="ProtoThrottle handheld controller preview">
        <div class="proto-shadow"></div>
        <div class="proto-shell">
          <header class="proto-head">
            <div class="head-cluster">
              <div class="switch-block">
                <span class="switch-label">Drive Hold</span>
                <svg class="toggle-switch" viewBox="0 0 120 110" aria-hidden="true" focusable="false">
                  <rect class="toggle-base" x="8" y="36" width="104" height="48" rx="10"></rect>
                  <rect class="toggle-slot" x="25" y="40" width="70" height="40" rx="12"></rect>
                  <path class="toggle-guard" d="M25 42h70l-6 18 6 18H25z"></path>
                  <circle class="toggle-knob" cx="38" cy="60" r="18"></circle>
                </svg>
                <span class="switch-hint">Latching toggle</span>
              </div>
              <div class="switch-block">
                <span class="switch-label">Menu</span>
                <svg class="toggle-switch toggle-switch--momentary" viewBox="0 0 120 110" aria-hidden="true" focusable="false">
                  <rect class="toggle-base" x="8" y="36" width="104" height="48" rx="10"></rect>
                  <rect class="toggle-slot" x="25" y="40" width="70" height="40" rx="12"></rect>
                  <circle class="toggle-knob toggle-knob--pressed" cx="82" cy="60" r="16"></circle>
                </svg>
                <span class="switch-hint">Momentary</span>
              </div>
            </div>
            <div class="status-cluster">
              <div class="battery-meter">
                <span class="battery-label">Battery</span>
                <div class="battery-shell">
                  <div class="battery-level"></div>
                  <span class="battery-cap"></span>
                </div>
              </div>
              <div class="horn-block">
                <span class="switch-label">Horn</span>
                <svg class="toggle-switch toggle-switch--horn" viewBox="0 0 120 110" aria-hidden="true" focusable="false">
                  <rect class="toggle-base" x="8" y="36" width="104" height="48" rx="10"></rect>
                  <rect class="toggle-slot" x="25" y="40" width="70" height="40" rx="12"></rect>
                  <path class="toggle-guard" d="M25 42h70l-6 18 6 18H25z"></path>
                  <circle class="toggle-knob" cx="82" cy="60" r="18"></circle>
                </svg>
                <span class="switch-hint">Handle</span>
              </div>
            </div>
          </header>

          <div class="indicator-panel">
            <div class="indicator indicator--drive">
              <span class="indicator-label">Drive</span>
              <span class="indicator-hint">Hold</span>
            </div>
            <div class="indicator">
              <span class="indicator-label">Bell</span>
              <span class="indicator-hint">Active</span>
            </div>
            <div class="indicator">
              <span class="indicator-label">Light</span>
              <span class="indicator-hint">Head</span>
            </div>
          </div>

          <section class="lcd-cluster">
            <div class="lcd-screen">
              <div class="lcd-heading">SD70ACe 703</div>
              <div class="lcd-subheading">44.5 MPH • 20 AMPS</div>
              <div class="lcd-footer">87654321 — IDLE</div>
            </div>
          </section>

          <section class="control-bank">
            <div class="lever-column">
              <div class="lever-module">
                <header class="module-header">
                  <span class="module-title">Dynamic Brake</span>
                  <span class="module-subtitle">Handle</span>
                </header>
                <svg class="lever" viewBox="0 0 140 220" aria-hidden="true" focusable="false">
                  <rect class="lever-slot" x="60" y="38" width="20" height="140" rx="10"></rect>
                  <rect class="lever-track" x="54" y="38" width="32" height="140" rx="12"></rect>
                  <path class="lever-arm" d="M70 30a18 18 0 0 1 18 18v82c0 4.4 3.6 8 8 8h6v16h-44v-16h6c4.4 0 8-3.6 8-8V48a18 18 0 0 1 18-18z"></path>
                  <circle class="lever-knob" cx="70" cy="30" r="22"></circle>
                  <rect class="lever-base" x="30" y="174" width="80" height="24" rx="6"></rect>
                </svg>
                <footer class="module-footer">
                  <span class="module-hint">Off as shown</span>
                </footer>
              </div>
            </div>

            <div class="lever-column lever-column--center">
              <div class="lever-module">
                <header class="module-header">
                  <span class="module-title">Throttle</span>
                  <span class="module-subtitle">Notches</span>
                </header>
                <svg class="lever lever--throttle" viewBox="0 0 140 220" aria-hidden="true" focusable="false">
                  <rect class="lever-slot" x="60" y="36" width="20" height="144" rx="10"></rect>
                  <rect class="lever-track lever-track--lit" x="54" y="36" width="32" height="144" rx="12"></rect>
                  <path class="lever-arm" d="M70 32a18 18 0 0 1 18 18v96c0 4.4 3.6 8 8 8h6v16h-44v-16h6c4.4 0 8-3.6 8-8V50a18 18 0 0 1 18-18z"></path>
                  <circle class="lever-knob lever-knob--throttle" cx="70" cy="32" r="24"></circle>
                  <rect class="lever-base" x="28" y="180" width="84" height="26" rx="6"></rect>
                </svg>
                <div class="notch-track">
                  <span>Idle</span>
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                  <span>6</span>
                  <span>7</span>
                  <span>8</span>
                </div>
              </div>

              <div class="lever-module reverser-module">
                <header class="module-header">
                  <span class="module-title">Reverser</span>
                  <span class="module-subtitle">Direction</span>
                </header>
                <div class="reverser-slot">
                  <div class="reverser-label">Rev</div>
                  <svg class="reverser-dial" viewBox="0 0 200 120" aria-hidden="true" focusable="false">
                    <path class="dial-plate" d="M20 100h160a8 8 0 0 0 8-8V36a8 8 0 0 0-8-8H20a8 8 0 0 0-8 8v56a8 8 0 0 0 8 8z"></path>
                    <path class="dial-arc" d="M42 88a58 58 0 0 1 116 0" stroke-width="10" stroke-linecap="round"></path>
                    <circle class="dial-pivot" cx="100" cy="88" r="18"></circle>
                    <path class="dial-pointer" d="M100 88 120 44" stroke-width="10" stroke-linecap="round"></path>
                  </svg>
                  <div class="reverser-label">Fwd</div>
                </div>
              </div>
            </div>

            <div class="lever-column">
              <div class="lever-module">
                <header class="module-header">
                  <span class="module-title">Lighting</span>
                  <span class="module-subtitle">Cluster</span>
                </header>
                <div class="dial-stack">
                  <div class="dial-block">
                    <span class="dial-label">DIM</span>
                    <svg class="rotary-dial" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
                      <circle class="rotary-face" cx="60" cy="60" r="52"></circle>
                      <circle class="rotary-bezel" cx="60" cy="60" r="58"></circle>
                      <path class="rotary-pointer" d="M60 60 60 18" stroke-width="10" stroke-linecap="round"></path>
                      <circle class="rotary-cap" cx="60" cy="60" r="18"></circle>
                    </svg>
                    <span class="dial-hint">Reverser swap</span>
                  </div>
                  <div class="dial-block">
                    <span class="dial-label">BRT</span>
                    <svg class="rotary-dial" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
                      <circle class="rotary-face" cx="60" cy="60" r="52"></circle>
                      <circle class="rotary-bezel" cx="60" cy="60" r="58"></circle>
                      <path class="rotary-pointer rotary-pointer--right" d="M60 60 94 60" stroke-width="10" stroke-linecap="round"></path>
                      <circle class="rotary-cap" cx="60" cy="60" r="18"></circle>
                    </svg>
                    <span class="dial-hint">Lights on</span>
                  </div>
                  <div class="dial-block">
                    <span class="dial-label">DITCH</span>
                    <svg class="rotary-dial" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
                      <circle class="rotary-face" cx="60" cy="60" r="52"></circle>
                      <circle class="rotary-bezel" cx="60" cy="60" r="58"></circle>
                      <path class="rotary-pointer rotary-pointer--down" d="M60 60 60 98" stroke-width="10" stroke-linecap="round"></path>
                      <circle class="rotary-cap" cx="60" cy="60" r="18"></circle>
                    </svg>
                    <span class="dial-hint">Mars light</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <footer class="proto-foot">
            <div class="foot-block">
              <span class="foot-label">Locomotive</span>
              <span class="foot-hint">Consist #</span>
            </div>
            <div class="foot-block">
              <span class="foot-label">Throttle</span>
              <span class="foot-hint">Address</span>
            </div>
            <div class="foot-block">
              <span class="foot-label">Bell</span>
              <span class="foot-hint">Latching</span>
            </div>
          </footer>
        </div>
        <div class="lanyard">
          <span class="lanyard-ring"></span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
:global(body) {
  background: radial-gradient(circle at 15% 10%, #24364e, #101623 55%, #06080f 100%);
}

.proto-demo-page {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding: 3rem 1.5rem 4rem;
  align-items: center;
  color: #e4edff;
  font-family: "Inter", "Segoe UI", sans-serif;
}

.intro {
  max-width: 760px;
  text-align: center;
  display: grid;
  gap: 0.75rem;
}

.title {
  font-size: clamp(2.2rem, 4vw, 3.5rem);
  font-weight: 700;
  letter-spacing: 0.02em;
}

.subtitle {
  font-size: clamp(1rem, 1.6vw, 1.125rem);
  color: #c4d1eb;
}

.demo-stage {
  width: min(960px, 100%);
  display: flex;
  justify-content: center;
  padding: clamp(1rem, 4vw, 2rem);
}

.proto-throttle {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.proto-shadow {
  position: absolute;
  width: 420px;
  height: 740px;
  border-radius: 48% / 22%;
  background: radial-gradient(circle at 50% 20%, rgba(12, 21, 37, 0.6), rgba(8, 12, 21, 0.95) 65%, rgba(2, 3, 7, 0) 100%);
  filter: blur(18px);
  transform: translateY(26px);
  z-index: 0;
}

.proto-shell {
  position: relative;
  z-index: 1;
  width: clamp(320px, 55vw, 420px);
  min-height: clamp(620px, 82vh, 720px);
  background: linear-gradient(160deg, #2f3f56 0%, #1f2937 40%, #121926 100%);
  border-radius: 40px;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.05), inset 0 -8px 28px rgba(0, 0, 0, 0.8), inset 0 18px 32px rgba(255, 255, 255, 0.07);
  padding: clamp(1.75rem, 4vw, 2.25rem) clamp(1.25rem, 3vw, 2rem);
  display: flex;
  flex-direction: column;
  gap: clamp(1.5rem, 3vw, 2.4rem);
}

.proto-shell::before,
.proto-shell::after {
  content: "";
  position: absolute;
  inset: 18px;
  border-radius: 28px;
  pointer-events: none;
}

.proto-shell::before {
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.proto-shell::after {
  border: 1px solid rgba(0, 0, 0, 0.3);
  mix-blend-mode: overlay;
}

.proto-head {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: clamp(1rem, 3vw, 1.75rem);
  align-items: start;
}

.head-cluster {
  display: flex;
  gap: 0.9rem;
}

.switch-block {
  display: grid;
  gap: 0.4rem;
  background: linear-gradient(180deg, rgba(39, 54, 76, 0.95), rgba(21, 30, 45, 0.95));
  border-radius: 16px;
  padding: 0.75rem 0.9rem 0.9rem;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06), inset 0 0 12px rgba(0, 0, 0, 0.45);
  min-width: 120px;
  text-align: center;
}

.switch-label {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #f4f8ff;
}

.switch-hint {
  font-size: 0.7rem;
  color: #93a2c7;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.toggle-switch {
  width: 100%;
  height: auto;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.45));
}

.toggle-base {
  fill: url(#toggleBaseGradient);
}

.toggle-slot {
  fill: #101722;
  stroke: rgba(16, 26, 37, 0.8);
  stroke-width: 2;
}

.toggle-guard {
  fill: rgba(18, 25, 36, 0.95);
}

.toggle-knob {
  fill: url(#knobGradient);
  stroke: rgba(255, 255, 255, 0.35);
  stroke-width: 2;
}

.toggle-knob--pressed {
  fill: url(#knobGradientPressed);
  stroke: rgba(255, 255, 255, 0.3);
}

.toggle-switch--momentary .toggle-slot {
  stroke: rgba(23, 35, 49, 0.7);
}

.toggle-switch--horn .toggle-knob {
  fill: url(#knobGradientHorn);
}

.status-cluster {
  display: flex;
  gap: clamp(1rem, 2.5vw, 2.25rem);
  align-items: stretch;
}

.battery-meter {
  display: grid;
  gap: 0.55rem;
  place-items: center;
  padding: 0.75rem 1rem;
  background: linear-gradient(180deg, rgba(17, 27, 39, 0.92), rgba(10, 16, 24, 0.92));
  border-radius: 16px;
  min-width: 120px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06), inset 0 0 16px rgba(0, 0, 0, 0.55);
}

.battery-label {
  font-size: 0.8rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #c7d8ff;
}

.battery-shell {
  position: relative;
  width: 120px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(180deg, #1a2536, #0d1420);
  box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.battery-level {
  position: absolute;
  inset: 4px;
  border-radius: 8px;
  background: linear-gradient(90deg, #19f5a2, #26c5f5);
}

.battery-cap {
  position: absolute;
  right: -10px;
  top: 10px;
  width: 10px;
  height: 16px;
  border-radius: 2px;
  background: linear-gradient(180deg, #bfc4cb, #727a86);
}

.horn-block {
  display: grid;
  gap: 0.4rem;
  background: linear-gradient(180deg, rgba(39, 54, 76, 0.95), rgba(21, 30, 45, 0.95));
  border-radius: 16px;
  padding: 0.75rem 0.9rem 0.9rem;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06), inset 0 0 12px rgba(0, 0, 0, 0.45);
  min-width: 120px;
  text-align: center;
}

.indicator-panel {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.9rem;
  padding: 0.85rem 1rem;
  background: linear-gradient(180deg, rgba(13, 20, 34, 0.92), rgba(5, 8, 13, 0.92));
  border-radius: 18px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 0 18px rgba(0, 0, 0, 0.65);
}

.indicator {
  padding: 0.7rem 0.6rem;
  background: radial-gradient(circle at 30% 30%, rgba(51, 73, 112, 0.9), rgba(18, 24, 38, 0.9));
  border-radius: 14px;
  text-align: center;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04), inset 0 -4px 12px rgba(0, 0, 0, 0.5);
}

.indicator--drive {
  background: radial-gradient(circle at 30% 30%, rgba(57, 103, 191, 0.9), rgba(22, 34, 60, 0.9));
}

.indicator-label {
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.06em;
}

.indicator-hint {
  font-size: 0.75rem;
  color: #94a3c7;
}

.lcd-cluster {
  display: flex;
  justify-content: center;
}

.lcd-screen {
  width: 92%;
  padding: 1.1rem 1.5rem;
  border-radius: 22px;
  background: linear-gradient(180deg, #2b3e58, #101722);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 0 24px rgba(0, 0, 0, 0.75);
  display: grid;
  gap: 0.6rem;
  text-align: center;
  color: #e8f3ff;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.lcd-heading {
  font-size: clamp(1rem, 2vw, 1.4rem);
  font-weight: 700;
}

.lcd-subheading {
  font-size: clamp(0.85rem, 1.8vw, 1.05rem);
  color: #9bc3ff;
}

.lcd-footer {
  font-size: clamp(0.75rem, 1.4vw, 0.95rem);
  color: #7ea0d8;
}

.control-bank {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(1rem, 3vw, 1.8rem);
}

.lever-column {
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 2vw, 1.6rem);
  align-items: center;
}

.lever-module {
  width: 100%;
  background: linear-gradient(180deg, rgba(25, 35, 49, 0.95), rgba(10, 15, 23, 0.95));
  border-radius: 22px;
  padding: 1.1rem 1.3rem 1.5rem;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04), inset 0 0 30px rgba(0, 0, 0, 0.7);
  display: grid;
  gap: 0.8rem;
  justify-items: center;
}

.module-header {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  text-align: center;
  display: grid;
  gap: 0.3rem;
}

.module-title {
  font-weight: 600;
  color: #eff6ff;
}

.module-subtitle {
  font-size: 0.72rem;
  color: #8fa3c8;
}

.lever {
  width: clamp(160px, 18vw, 180px);
  height: auto;
}

.lever-slot {
  fill: #050b16;
}

.lever-track {
  fill: url(#leverTrackGradient);
  stroke: rgba(35, 48, 69, 0.8);
  stroke-width: 3;
}

.lever-track--lit {
  fill: url(#leverTrackGradientLit);
}

.lever-arm {
  fill: url(#leverArmGradient);
  stroke: rgba(255, 255, 255, 0.18);
  stroke-width: 2;
}

.lever-knob {
  fill: url(#leverKnobGradient);
  stroke: rgba(255, 255, 255, 0.28);
  stroke-width: 2;
}

.lever-knob--throttle {
  fill: url(#leverKnobGradientThrottle);
}

.lever-base {
  fill: url(#leverBaseGradient);
  stroke: rgba(0, 0, 0, 0.65);
  stroke-width: 2;
}

.module-footer {
  font-size: 0.75rem;
  color: #8b9fbe;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.notch-track {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(9, minmax(0, 1fr));
  gap: 0.25rem;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #93a6c7;
}

.reverser-module {
  padding-bottom: 1.2rem;
}

.reverser-slot {
  width: 100%;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.75rem;
  background: radial-gradient(circle at 50% 0%, rgba(38, 52, 74, 0.6), rgba(12, 18, 28, 0.95));
  border-radius: 18px;
  padding: 0.9rem 0.9rem 1.1rem;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 14px 28px rgba(0, 0, 0, 0.55);
}

.reverser-label {
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #b9c8e6;
}

.reverser-dial {
  width: 100%;
  height: auto;
}

.dial-plate {
  fill: url(#dialPlateGradient);
}

.dial-arc {
  fill: none;
  stroke: url(#dialArcGradient);
}

.dial-pivot {
  fill: url(#dialPivotGradient);
  stroke: rgba(255, 255, 255, 0.18);
  stroke-width: 2;
}

.dial-pointer {
  fill: none;
  stroke: url(#dialPointerGradient);
}

.dial-stack {
  display: grid;
  gap: 1rem;
  width: 100%;
}

.dial-block {
  display: grid;
  justify-items: center;
  gap: 0.4rem;
  background: linear-gradient(180deg, rgba(29, 41, 58, 0.95), rgba(10, 16, 24, 0.95));
  border-radius: 18px;
  padding: 0.9rem 1rem 1.1rem;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 14px 28px rgba(0, 0, 0, 0.55);
}

.dial-label {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

.rotary-dial {
  width: clamp(120px, 18vw, 140px);
  height: auto;
}

.rotary-face {
  fill: url(#rotaryFaceGradient);
  stroke: rgba(0, 0, 0, 0.65);
  stroke-width: 4;
}

.rotary-bezel {
  fill: none;
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 4;
}

.rotary-pointer {
  fill: none;
  stroke: url(#rotaryPointerGradient);
}

.rotary-pointer--right {
  transform: rotate(90deg);
  transform-origin: 60px 60px;
}

.rotary-pointer--down {
  transform: rotate(180deg);
  transform-origin: 60px 60px;
}

.rotary-cap {
  fill: url(#rotaryCapGradient);
  stroke: rgba(255, 255, 255, 0.18);
  stroke-width: 2;
}

.dial-hint {
  font-size: 0.72rem;
  color: #8fa4c8;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.proto-foot {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.9rem;
  background: linear-gradient(180deg, rgba(17, 25, 40, 0.94), rgba(7, 10, 17, 0.94));
  border-radius: 18px;
  padding: 1rem 1.2rem;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 12px 24px rgba(0, 0, 0, 0.6);
}

.foot-block {
  text-transform: uppercase;
  text-align: center;
  display: grid;
  gap: 0.35rem;
}

.foot-label {
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.12em;
}

.foot-hint {
  font-size: 0.7rem;
  color: #97adcf;
  letter-spacing: 0.16em;
}

.lanyard {
  position: absolute;
  bottom: -32px;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0));
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.lanyard-ring {
  display: inline-block;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 6px solid rgba(140, 156, 180, 0.7);
  background: rgba(17, 24, 34, 0.9);
  box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.6), 0 8px 24px rgba(0, 0, 0, 0.6);
}

@media (max-width: 960px) {
  .control-bank {
    grid-template-columns: 1fr;
  }

  .lever-column {
    flex-direction: row;
    justify-content: center;
  }

  .lever-module {
    max-width: 320px;
  }

  .reverser-slot {
    grid-template-columns: 1fr;
    justify-items: center;
  }

  .reverser-label {
    display: none;
  }
}
</style>

<svg width="0" height="0" aria-hidden="true" focusable="false" class="svg-defs">
  <defs>
    <linearGradient id="toggleBaseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#3f516d" />
      <stop offset="100%" stop-color="#1b2434" />
    </linearGradient>
    <linearGradient id="knobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f4f5f7" />
      <stop offset="50%" stop-color="#aeb6c6" />
      <stop offset="100%" stop-color="#838b9c" />
    </linearGradient>
    <linearGradient id="knobGradientPressed" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c9d3e2" />
      <stop offset="100%" stop-color="#5d6a7c" />
    </linearGradient>
    <linearGradient id="knobGradientHorn" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffe19c" />
      <stop offset="100%" stop-color="#c37a24" />
    </linearGradient>
    <linearGradient id="leverTrackGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#202d40" />
      <stop offset="100%" stop-color="#0e141f" />
    </linearGradient>
    <linearGradient id="leverTrackGradientLit" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#20304a" />
      <stop offset="50%" stop-color="#1a7cff" />
      <stop offset="100%" stop-color="#0e1521" />
    </linearGradient>
    <linearGradient id="leverArmGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a4b2c6" />
      <stop offset="50%" stop-color="#6d7b8f" />
      <stop offset="100%" stop-color="#424c5c" />
    </linearGradient>
    <linearGradient id="leverKnobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc" />
      <stop offset="100%" stop-color="#a0acbe" />
    </linearGradient>
    <linearGradient id="leverKnobGradientThrottle" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f2d27f" />
      <stop offset="100%" stop-color="#c0822a" />
    </linearGradient>
    <linearGradient id="leverBaseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#121a28" />
      <stop offset="100%" stop-color="#05080f" />
    </linearGradient>
    <linearGradient id="dialPlateGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1f2c3f" />
      <stop offset="100%" stop-color="#0d141f" />
    </linearGradient>
    <linearGradient id="dialArcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#16caff" />
      <stop offset="100%" stop-color="#1f7bff" />
    </linearGradient>
    <linearGradient id="dialPivotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#adbdd6" />
      <stop offset="100%" stop-color="#5e6c83" />
    </linearGradient>
    <linearGradient id="dialPointerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f8d47e" />
      <stop offset="100%" stop-color="#c07829" />
    </linearGradient>
    <linearGradient id="rotaryFaceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#232f43" />
      <stop offset="100%" stop-color="#0c1018" />
    </linearGradient>
    <linearGradient id="rotaryPointerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f8d27d" />
      <stop offset="100%" stop-color="#c27e28" />
    </linearGradient>
    <linearGradient id="rotaryCapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#adb5c4" />
      <stop offset="100%" stop-color="#6a7589" />
    </linearGradient>
  </defs>
</svg>
