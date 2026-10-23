// 목업용 도형 그림. 앱의 3D 뷰어와 같은 면 색(분홍·민트·살구)을 쓴다.
(() => {
const INK = '#5a4450';
const F = { pink: '#f6cfdb', mint: '#cfe8df', peach: '#ffd8c2', lav: '#e2dbf6', sand: '#f3e6c4' };
const s = (body, vb = '0 0 200 200') =>
  `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

const SOLIDS = {
  cylinder: () => s(`<path d="M55 52v96a45 15 0 0 0 90 0V52" fill="${F.mint}"/><path d="M55 148a45 15 0 0 1 90 0" fill="none" stroke-dasharray="5 5" opacity=".55"/><ellipse cx="100" cy="52" rx="45" ry="15" fill="${F.pink}"/>`),
  cone: () => s(`<path d="M100 28L52 150a48 15 0 0 0 96 0Z" fill="${F.peach}"/><path d="M52 150a48 15 0 0 1 96 0" fill="none" stroke-dasharray="5 5" opacity=".55"/>`),
  sphere: () => s(`<circle cx="100" cy="100" r="66" fill="${F.lav}"/><path d="M34 100a66 20 0 0 0 132 0" fill="none"/><path d="M34 100a66 20 0 0 1 132 0" fill="none" stroke-dasharray="5 5" opacity=".55"/>`),
  frustum: () => s(`<path d="M72 50L42 148a58 16 0 0 0 116 0L128 50" fill="${F.peach}"/><path d="M42 148a58 16 0 0 1 116 0" fill="none" stroke-dasharray="5 5" opacity=".55"/><ellipse cx="100" cy="50" rx="28" ry="9" fill="${F.pink}"/>`),
  cuboid: () => s(`<path d="M40 74h86l34-24H74z" fill="${F.pink}"/><path d="M40 74h86v86H40z" fill="${F.mint}"/><path d="M126 74l34-24v86l-34 24z" fill="${F.peach}"/>`),
  cube: () => s(`<path d="M48 70h76l30-22H78z" fill="${F.pink}"/><path d="M48 70h76v76H48z" fill="${F.mint}"/><path d="M124 70l30-22v76l-30 22z" fill="${F.peach}"/>`),
  hexprism: () => s(`<path d="M60 52l20-12h40l20 12-20 12H80z" fill="${F.pink}"/><path d="M60 52l20 12v100l-20-12z" fill="${F.peach}"/><path d="M80 64h40v100H80z" fill="${F.mint}"/><path d="M120 64l20-12v100l-20 12z" fill="${F.peach}"/>`),
  pyramid: () => s(`<path d="M100 30L46 138l40 22z" fill="${F.mint}"/><path d="M100 30l-14 130 70-22z" fill="${F.peach}"/><path d="M46 138l40 22 70-22" fill="none"/><path d="M46 138l54-22 56 22M100 30v86" fill="none" stroke-dasharray="5 5" opacity=".5"/>`),
  combo: () => s(`<path d="M50 40h100L110 112H90z" fill="${F.peach}"/><ellipse cx="100" cy="40" rx="50" ry="13" fill="${F.pink}"/><path d="M90 112v52a10 4 0 0 0 20 0v-52" fill="${F.mint}"/>`),
  chair: () => s(`<rect x="62" y="30" width="76" height="56" rx="10" fill="${F.lav}"/><path d="M52 104h96l8 14H44z" fill="${F.mint}"/><path d="M58 118v54M142 118v54M70 86v18M130 86v18" fill="none"/>`),
};

// 펼치고 접기: 다 펼쳐진 전개도를 위에서 똑바로 내려다본 모습
const NETS = {
  cylinder: () => s(`
    <circle cx="160" cy="40" r="30" fill="${F.pink}"/>
    <rect x="66" y="70" width="188" height="92" fill="${F.mint}"/>
    <circle cx="160" cy="192" r="30" fill="${F.pink}"/>
    <g stroke="none" fill="${INK}" font-family="Noto Sans KR, sans-serif" text-anchor="middle">
      <text x="160" y="45" font-size="13" font-weight="700">밑면</text><text x="160" y="197" font-size="13" font-weight="700">밑면</text>
      <text x="160" y="112" font-size="14" font-weight="700">옆면</text><text x="160" y="132" font-size="11.5">가로 = 밑면의 둘레</text></g>`, '0 0 320 230'),
  cuboid: () => s(`
    <path d="M110 20h70v50h-70z" fill="${F.pink}"/><path d="M40 70h70v80H40z" fill="${F.peach}"/><path d="M110 70h70v80h-70z" fill="${F.mint}"/>
    <path d="M180 70h70v80h-70z" fill="${F.peach}"/><path d="M250 70h50v80h-50z" fill="${F.mint}"/><path d="M110 150h70v50h-70z" fill="${F.pink}"/>`, '0 0 320 220'),
  cube: () => s(`
    <path d="M110 20h60v60h-60z" fill="${F.pink}"/><path d="M50 80h60v60H50z" fill="${F.peach}"/><path d="M110 80h60v60h-60z" fill="${F.mint}"/>
    <path d="M170 80h60v60h-60z" fill="${F.peach}"/><path d="M230 80h60v60h-60z" fill="${F.mint}"/><path d="M110 140h60v60h-60z" fill="${F.pink}"/>`, '0 0 320 220'),
  cone: () => s(`<path d="M160 20L60 150A140 140 0 0 0 260 150Z" fill="${F.peach}"/><circle cx="160" cy="196" r="34" fill="${F.pink}"/>`, '0 0 320 240'),
};

// 면 나누기
const EXPLODE = {
  cylinder: () => s(`<ellipse cx="160" cy="34" rx="45" ry="15" fill="${F.pink}"/><path d="M115 80v80a45 15 0 0 0 90 0V80" fill="${F.mint}"/><path d="M115 80a45 15 0 0 1 90 0" fill="${F.mint}" stroke-dasharray="5 5"/><ellipse cx="160" cy="214" rx="45" ry="15" fill="${F.pink}"/>`, '0 0 320 240'),
};

// 회전 생성: 직사각형을 축 둘레로 돌린다
const GENERATE = {
  cylinder: () => s(`<path d="M160 20v200" stroke-dasharray="7 6"/><path d="M160 50h56v120h-56z" fill="${F.mint}"/>
    <path d="M216 190a56 14 0 1 1-112 0" fill="none" stroke="#984a66" stroke-width="2.4"/><path d="M104 190l-6-8m6 8l9-3" stroke="#984a66" stroke-width="2.4" fill="none"/>
    <text x="232" y="114" stroke="none" fill="${INK}" font-family="Noto Sans KR, sans-serif" font-size="13" font-weight="700">직사각형</text>`, '0 0 320 240'),
};

const NAMES = { cylinder: '원기둥', cone: '원뿔', sphere: '구', frustum: '원뿔대', cuboid: '직육면체', cube: '정육면체', hexprism: '6각기둥', pyramid: '사각뿔', combo: '원뿔 + 원기둥', chair: '여러 도형' };
const KIND = { cylinder: 'rev', cone: 'rev', sphere: 'rev', frustum: 'rev', cuboid: 'poly', cube: 'poly', hexprism: 'poly', pyramid: 'poly', combo: 'mix', chair: 'hold' };

// 분류 아이콘(선 아이콘, 24px)
const ICONS = {
  poly: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M4 8l8-4 8 4v8l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v8"/></svg>',
  rev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><ellipse cx="12" cy="6" rx="7" ry="2.6"/><path d="M5 6v12c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6V6"/></svg>',
  mix: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16l-6 8h-4z"/><path d="M10 12v8h4v-8"/></svg>',
  hold: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke-dasharray="3 2.4"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.4v.5M12 16.8v.2"/></svg>',
  none: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M5 19l2-6 9-9 4 4-9 9z"/><path d="M14 6l4 4"/></svg>',
};

window.Shapes = { SOLIDS, NETS, EXPLODE, GENERATE, NAMES, KIND, ICONS };
})();
