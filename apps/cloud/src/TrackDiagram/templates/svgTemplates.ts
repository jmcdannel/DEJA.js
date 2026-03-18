export function turnoutForkSvg(id: string, x: number, y: number, rotation: number): string {
  return `<g id="${id}" transform="translate(${x},${y}) rotate(${rotation})">
  <g><path d="M0,0 L30,0" style="fill:none;stroke:rgb(129,128,128);stroke-width:3px;"/></g>
  <g><path d="M0,0 L25,-20" style="fill:none;stroke:rgb(129,128,128);stroke-width:3px;"/></g>
</g>`
}

export function turnoutLabelSvg(id: string, x: number, y: number, label: string): string {
  return `<g id="lbl${id}" transform="translate(${x},${y})">
  <circle cx="0" cy="0" r="13" style="fill:rgb(255,0,234);fill-opacity:0.21;"/>
  <text x="-10" y="4" style="font-family:sans-serif;font-weight:500;font-size:8px;fill:white;">${label}</text>
</g>`
}

export function routeMarkerSvg(id: string, x: number, y: number, label: string, color: string = 'rgb(143,217,38)'): string {
  const width = Math.max(40, label.length * 9 + 12)
  const halfW = width / 2
  const r = 4
  return `<g id="${id}" transform="translate(${x},${y})">
  <path d="M${halfW},${-8}C${halfW},${-8 - r} ${halfW - r},${-12} ${halfW - r},${-12}L${-(halfW - r)},${-12}C${-halfW},${-12} ${-halfW},${-8 - r} ${-halfW},${-8}L${-halfW},${8 - r}C${-halfW},${8} ${-(halfW - r)},${12} ${-(halfW - r)},${12}L${halfW - r},${12}C${halfW},${12} ${halfW},${8} ${halfW},${8 - r}Z" style="fill:${color};fill-opacity:0.42;"/>
  <text x="${-halfW + 6}" y="4" style="font-family:sans-serif;font-weight:500;font-size:13px;fill:white;">${label}</text>
</g>`
}

export function backgroundSvg(width: number, height: number): string {
  return `<g id="Background"><rect x="0" y="0" width="${width}" height="${height}" style="fill:rgb(0,0,0);"/></g>`
}
