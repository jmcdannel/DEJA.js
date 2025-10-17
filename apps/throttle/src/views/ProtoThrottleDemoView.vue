<template>
  <div class="proto-demo-page">
    <div class="intro">
      <h1 class="title">ProtoThrottle Control Demo</h1>
      <p class="subtitle">
        This is a static preview of the ProtoThrottle-inspired control layout. It is intended to help visualize the
        interface before wiring it up to live locomotive data.
      </p>
    </div>

    <div class="demo-stage">
      <div class="proto-throttle">
        <div class="proto-body">
          <div class="panel-top">
            <div class="panel-top__left">
              <div class="toggle toggle--red">
                <span class="toggle__label">Drive Hold</span>
                <span class="toggle__hint">(Latching)</span>
              </div>
              <div class="toggle">
                <span class="toggle__label">Menu</span>
              </div>
              <div class="toggle">
                <span class="toggle__label">Select</span>
                <span class="toggle__hint">Button</span>
              </div>
            </div>

            <div class="panel-top__center">
              <div class="battery-indicator">Battery</div>
              <div class="battery-indicator">Charge Level</div>
            </div>

            <div class="panel-top__right">
              <div class="toggle">
                <span class="toggle__label">Horn</span>
                <span class="toggle__hint">Handle</span>
              </div>
            </div>
          </div>

          <div class="indicator-row">
            <div class="indicator indicator--blue">
              <span class="indicator__label">Drive</span>
              <span class="indicator__hint">Hold</span>
            </div>
            <div class="indicator">
              <span class="indicator__label">Bell</span>
              <span class="indicator__hint">Button</span>
            </div>
            <div class="indicator">
              <span class="indicator__label">Light</span>
              <span class="indicator__hint">Toggle</span>
            </div>
          </div>

          <div class="lcd">
            <div class="lcd__screen">
              <div class="lcd__heading">SD71 703</div>
              <div class="lcd__subheading">44.5 S 20 N</div>
              <div class="lcd__footer">87654321 • IDLE</div>
            </div>
          </div>

          <div class="control-deck">
            <div class="control-column">
              <div class="handle-block">
                <div class="handle handle--brake">
                  <span class="handle__title">Brake</span>
                  <span class="handle__subtitle">Handle</span>
                </div>
                <div class="handle-label">Dynamic Brake</div>
                <div class="handle-description">(off as shown)</div>
              </div>
            </div>

            <div class="control-column control-column--center">
              <div class="handle-block handle-block--throttle">
                <div class="handle handle--throttle">
                  <span class="handle__title">Throttle</span>
                </div>
                <div class="notches">0 1 2 3 4 5 6 7 8</div>
              </div>
              <div class="reverser">
                <span class="reverser__title">Reverser</span>
                <span class="reverser__hint">(direction)</span>
              </div>
            </div>

            <div class="control-column">
              <div class="handle-block">
                <div class="handle handle--reverser">
                  <span class="handle__title">Reverser</span>
                  <span class="handle__subtitle">Swap</span>
                </div>
                <div class="switch-cluster">
                  <div class="switch">
                    <span class="switch__label">DIM</span>
                    <span class="switch__hint">= Reverser Swap</span>
                  </div>
                  <div class="switch">
                    <span class="switch__label">BRT</span>
                    <span class="switch__hint">= Lights On</span>
                  </div>
                  <div class="switch">
                    <span class="switch__label">DITCH</span>
                    <span class="switch__hint">= Mars Light</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="panel-footer">
            <div class="footer-item">
              <span class="footer-item__label">Locomotive</span>
              <span class="footer-item__hint">Consist #</span>
            </div>
            <div class="footer-item">
              <span class="footer-item__label">Throttle</span>
              <span class="footer-item__hint">Address</span>
            </div>
            <div class="footer-item">
              <span class="footer-item__label">Bell</span>
              <span class="footer-item__hint">(latching)</span>
            </div>
          </div>
        </div>

        <div class="lanyard-loop">
          <div class="lanyard-hole"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.proto-demo-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 3rem 1.5rem 4rem;
  align-items: center;
  color: #e4edff;
}

.intro {
  max-width: 720px;
  text-align: center;
}

.title {
  font-size: clamp(2rem, 3vw, 3rem);
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.subtitle {
  font-size: clamp(1rem, 1.5vw, 1.125rem);
  color: rgba(228, 237, 255, 0.78);
  line-height: 1.6;
}

.demo-stage {
  width: 100%;
  display: flex;
  justify-content: center;
}

.proto-throttle {
  background: radial-gradient(circle at 20% 20%, rgba(94, 125, 173, 0.45), rgba(33, 45, 73, 0.7)), #1f2a3f;
  padding: 1.5rem 1.5rem 2.25rem;
  border-radius: 2.5rem;
  box-shadow: 0 30px 60px rgba(11, 17, 27, 0.65), inset 0 0 0 2px rgba(255, 255, 255, 0.06);
  position: relative;
}

.proto-body {
  width: clamp(280px, 48vw, 420px);
  background: linear-gradient(180deg, #3f5d86 0%, #2d3f5b 70%, #26334a 100%);
  border-radius: 1.75rem;
  padding: 1.75rem 1.75rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  position: relative;
  box-shadow: inset 0 0 0 3px rgba(10, 13, 24, 0.55);
}

.proto-body::after {
  content: '';
  position: absolute;
  inset: 1rem;
  border-radius: 1.25rem;
  border: 1px dashed rgba(12, 18, 34, 0.45);
  pointer-events: none;
}

.panel-top {
  display: grid;
  grid-template-columns: 1.25fr 1fr 0.75fr;
  gap: 1rem;
  align-items: start;
}

.panel-top__left,
.panel-top__right {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.panel-top__center {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(216, 229, 255, 0.7);
  background: rgba(17, 27, 43, 0.45);
  padding: 0.6rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(88, 124, 176, 0.25);
  box-shadow: inset 0 0 12px rgba(9, 13, 22, 0.35);
}

.battery-indicator {
  letter-spacing: 0.14em;
}

.toggle,
.indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  background: rgba(24, 36, 56, 0.65);
  border-radius: 1rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid rgba(84, 116, 166, 0.4);
  box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.25), 0 6px 14px rgba(0, 0, 0, 0.4);
  text-transform: uppercase;
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  color: rgba(235, 243, 255, 0.85);
}

.toggle--red {
  background: linear-gradient(180deg, #a72c3d 0%, #691423 100%);
  border-color: rgba(255, 145, 164, 0.35);
}

.toggle__label {
  font-weight: 600;
}

.toggle__hint {
  font-size: 0.58rem;
  opacity: 0.75;
}

.indicator-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.indicator {
  padding-block: 0.8rem;
}

.indicator--blue {
  background: linear-gradient(180deg, #3aa9ff 0%, #1f6eb4 100%);
  border-color: rgba(144, 213, 255, 0.35);
  color: #062338;
  box-shadow: inset 0 4px 10px rgba(14, 73, 129, 0.35), 0 8px 16px rgba(5, 20, 43, 0.45);
}

.indicator__label {
  font-weight: 700;
}

.indicator__hint {
  font-size: 0.58rem;
  letter-spacing: 0.04em;
  opacity: 0.6;
}

.lcd {
  background: rgba(9, 14, 23, 0.55);
  border-radius: 1.25rem;
  padding: 0.6rem;
  border: 1px solid rgba(109, 140, 188, 0.4);
  box-shadow: inset 0 10px 18px rgba(4, 9, 16, 0.55);
}

.lcd__screen {
  background: linear-gradient(180deg, #92d8ff 0%, #6bb8d1 100%);
  color: #062338;
  border-radius: 0.9rem;
  padding: 0.9rem 1.1rem;
  text-align: center;
  box-shadow: inset 0 0 18px rgba(255, 255, 255, 0.35);
  font-family: 'Share Tech Mono', 'Roboto Mono', monospace;
}

.lcd__heading {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.16em;
}

.lcd__subheading {
  font-size: 0.95rem;
  letter-spacing: 0.1em;
  margin: 0.4rem 0 0.6rem;
}

.lcd__footer {
  font-size: 0.82rem;
  letter-spacing: 0.24em;
}

.control-deck {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
}

.control-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.control-column--center {
  align-items: center;
}

.handle-block {
  background: rgba(15, 23, 38, 0.65);
  border-radius: 1rem;
  padding: 1rem;
  border: 1px solid rgba(62, 89, 135, 0.45);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  box-shadow: inset 0 6px 12px rgba(0, 0, 0, 0.25);
}

.handle-block--throttle {
  width: 100%;
}

.handle {
  background: linear-gradient(180deg, rgba(71, 98, 138, 0.95) 0%, rgba(27, 41, 64, 0.95) 100%);
  border-radius: 2.25rem;
  width: 100%;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border: 2px solid rgba(118, 155, 210, 0.4);
  box-shadow: inset 0 10px 18px rgba(0, 0, 0, 0.45);
  position: relative;
  overflow: hidden;
}

.handle::after {
  content: '';
  position: absolute;
  inset: 12px;
  border-radius: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 6px 12px rgba(0, 0, 0, 0.35);
}

.handle__title {
  position: relative;
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.handle__subtitle {
  position: relative;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.7;
}

.handle--throttle {
  background: linear-gradient(180deg, #f5c55f 0%, #d48224 100%);
  color: #2b1904;
  border-color: rgba(255, 212, 124, 0.55);
}

.handle--brake {
  background: linear-gradient(180deg, #4d7db5 0%, #2b4a76 100%);
}

.handle--reverser {
  background: linear-gradient(180deg, #d55858 0%, #962f2f 100%);
  border-color: rgba(255, 178, 178, 0.35);
}

.handle-label {
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.7rem;
  opacity: 0.75;
}

.handle-description {
  font-size: 0.62rem;
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.notches {
  font-size: 0.75rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  opacity: 0.65;
}

.reverser {
  background: rgba(18, 27, 42, 0.6);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  text-align: center;
  border: 1px solid rgba(62, 89, 135, 0.45);
  box-shadow: inset 0 4px 10px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.reverser__title {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 600;
}

.reverser__hint {
  font-size: 0.62rem;
  opacity: 0.6;
  letter-spacing: 0.08em;
}

.switch-cluster {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  width: 100%;
}

.switch {
  background: rgba(17, 25, 40, 0.7);
  border-radius: 0.75rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid rgba(67, 96, 143, 0.4);
  box-shadow: inset 0 6px 12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.switch__label {
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.16em;
}

.switch__hint {
  font-size: 0.6rem;
  opacity: 0.6;
  letter-spacing: 0.06em;
}

.panel-footer {
  margin-top: 0.5rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  background: rgba(12, 18, 32, 0.65);
  border-radius: 0.9rem;
  padding: 0.8rem 1rem;
  border: 1px solid rgba(50, 74, 112, 0.45);
}

.footer-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.62rem;
  opacity: 0.75;
}

.footer-item__label {
  font-weight: 600;
  letter-spacing: 0.12em;
}

.lanyard-loop {
  position: absolute;
  bottom: -1.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 80px;
  background: linear-gradient(180deg, rgba(60, 83, 122, 0.85) 0%, rgba(30, 42, 64, 0.85) 100%);
  border-radius: 0 0 2.5rem 2.5rem;
  border: 2px solid rgba(8, 11, 19, 0.7);
  border-top: none;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 1rem;
  box-shadow: 0 18px 35px rgba(0, 0, 0, 0.55);
}

.lanyard-hole {
  width: 46px;
  height: 18px;
  border-radius: 999px;
  background: rgba(10, 14, 22, 0.8);
  border: 1px solid rgba(110, 140, 190, 0.45);
  box-shadow: inset 0 3px 6px rgba(0, 0, 0, 0.45);
}

@media (max-width: 600px) {
  .proto-body {
    padding: 1.5rem 1.25rem 2.2rem;
  }

  .panel-top {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .panel-top__center {
    grid-column: span 2;
  }

  .control-deck {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .control-column:last-child {
    grid-column: span 2;
  }

  .panel-footer {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
