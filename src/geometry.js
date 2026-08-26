// SMARTPHONE FIXTURE PLATE ASADA-01A — 84 × 143 mm. All dimensions in mm.
//
// Fixture coordinates, origin at the plate's BOTTOM-LEFT corner:
//   window   left 20.5, bottom 87, 43 wide × 33 tall  (top edge at 120), R4
//   buttons  Ø27, centres (22, 43.5) and (62, 43.5) — 40 apart
export const PLATE = {
  w: 84,
  h: 143,
  win: { left: 20.5, bottom: 87, w: 43, h: 33, r: 4 },
  btn: { d: 27, cy: 43.5, cx: [22, 62] },
}

// iPhone 16e active display.
export const SCREEN_MM = { w: 64.6, h: 139.8 }

// The display sits centred behind the plate, so the plate overhangs it by this
// much on each side. Vertical registration is the one thing the drawing can't
// give us — it depends on how the phone seats in the case — so the calibration
// offsets exist to take up whatever slack is left.
const DX = (PLATE.w - SCREEN_MM.w) / 2 // 9.70 mm of plate left of the screen
const DY = (PLATE.h - SCREEN_MM.h) / 2 // 1.60 mm of plate below the screen

// plate x (from plate left)   -> screen x (from screen left)
const sx = (x) => x - DX
// plate y (from plate bottom) -> screen y (from screen TOP)
const sy = (y) => SCREEN_MM.h - (y - DY)

// Calibration nudges are in mm, positive = right / down for both groups.
export const DEFAULT_CALIB = { winDx: 0, winDy: 0, btnDx: 0, btnDy: 0 }

export function layout(width, height, calib) {
  const s = width / SCREEN_MM.w // pt per mm

  const win = {
    left: (sx(PLATE.win.left) + calib.winDx) * s,
    top: (sy(PLATE.win.bottom + PLATE.win.h) + calib.winDy) * s,
    width: PLATE.win.w * s,
    height: PLATE.win.h * s,
    radius: PLATE.win.r * s,
  }

  // Ø27 on 40 mm centres spans 67 mm across a 64.6 mm display, so ~1.2 mm of
  // each disc falls past the screen edge. Drawn full size regardless: the disc
  // has to fill the plate's hole, and the screen can't light that last sliver.
  const btnR = (PLATE.btn.d / 2) * s
  const cy = (sy(PLATE.btn.cy) + calib.btnDy) * s
  const cxL = (sx(PLATE.btn.cx[0]) + calib.btnDx) * s
  const cxR = (sx(PLATE.btn.cx[1]) + calib.btnDx) * s

  return {
    s,
    win,
    btnR,
    left: { cx: cxL, cy },
    right: { cx: cxR, cy },
    needlePivot: { x: width / 2, y: height - 4 * s },
    needleLen: cy - win.top - win.height + win.height * 0.25,
  }
}
