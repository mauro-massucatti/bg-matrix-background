// A cena: colunas de caracteres dourados caindo sem parar sobre o preto,
// densas nas bordas e no alto, dissolvendo-se aos poucos rumo ao centro
// (onde fica a leitura) e ao pé da tela (onde fica a caixa de escrita).
// Só SVG e CSS: a cena não roda script nem carrega nada.

const LARGURA = 1600
const ALTURA = 1000
const PASSO_X = 22 // distância entre colunas
const PASSO_Y = 22 // distância entre caracteres de uma coluna
const TAMANHO = 18 // corpo da letra

// Símbolos próprios: algarismos, letras e sinais da escrita jurídica.
const GLIFOS =
  '0123456789ABCDEFHKLMNRSTVXZ§¶†‡∆Ω≡∑∂∫◊¤#%@+=/' +
  // Kanji, muitos do vocabulário jurídico: lei, norma, justiça, direito,
  // contrato, prova, selo, ouro, tempo, luz, céu, terra, caminho, razão...
  '法律正義権利契約証書印判金銀時空光雨雷星月日水火木土山川心力道天地人門理'

// Gerador pseudoaleatório com semente fixa: a cena sai igual a cada carga.
function sorteador(semente        )               {
  let s = semente >>> 0

  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function montar()         {
  const r = sorteador(20261116)
  const sorteio = (min        , max        ) => min + r() * (max - min)
  const glifo = () => GLIFOS[Math.floor(r() * GLIFOS.length)]

  // Oito trilhas de tamanhos diferentes, reaproveitadas por todas as colunas.
  const trilhas           = []

  for (let v = 0; v < 8; v++) {
    const n = 14 + Math.floor(r() * 15)
    const xs = Array.from({ length: n }, () => '0').join(' ')
    const ys = Array.from({ length: n }, (_, i) => String(i * PASSO_Y)).join(' ')
    const texto = Array.from({ length: n }, glifo).join('')
    trilhas.push(`<text id="t${v}" x="${xs}" y="${ys}">${texto}</text>`)
  }

  // As colunas: cada uma com sua velocidade, seu atraso e sua trilha.
  const colunas = []
  // O ritmo de cada coluna e de cada centelha fica no bloco de estilo, numa
  // classe só dela: o app apaga o estilo escrito no próprio elemento.
  const ritmos = []
  let n = 0

  for (let x = 6; x < LARGURA; x += PASSO_X) {
    const camadas = r() < 0.35 ? 2 : 1

    for (let c = 0; c < camadas; c++) {
      const d = sorteio(7, 17)
      const a = (-sorteio(0, 17)).toFixed(2)
      const v = Math.floor(r() * trilhas.length)
      const fundo = c === 1 ? ' f' : ''
      const k = `k${n++}`
      ritmos.push(
        `.${k}{animation-duration:${d.toFixed(2)}s;animation-delay:${a}s}` +
          `.ativo .${k}{animation-duration:${(d * 0.55).toFixed(2)}s}`,
      )
      colunas.push(
        `<g class="c${fundo}" transform="translate(${x} 0)">` +
          `<rect x="-5" y="0" width="${PASSO_X}" height="${ALTURA}"/>` +
          `<use href="#t${v}" class="s ${k}"/>` +
          `</g>`,
      )
    }
  }

  // Centelhas: caracteres soltos que acendem e apagam, como se trocassem.
  const centelhas = []

  for (let i = 0; i < 70; i++) {
    const x = 6 + Math.floor(r() * (LARGURA / PASSO_X)) * PASSO_X
    const y = Math.floor(r() * (ALTURA / PASSO_Y)) * PASSO_Y
    const d = sorteio(1.6, 4.5).toFixed(2)
    const a = (-sorteio(0, 4.5)).toFixed(2)
    const k = `k${n++}`
    ritmos.push(`.${k}{animation-duration:${d}s;animation-delay:${a}s}`)
    centelhas.push(`<text x="${x}" y="${y}" class="${k}">${glifo()}</text>`)
  }

  const estilo = `
text{font-family:ui-monospace,Menlo,Monaco,monospace;font-size:${TAMANHO}px}
.c rect{fill:transparent;pointer-events:all}
.s{fill:url(#trilha);animation:cair 12s linear 0s infinite;will-change:transform}
.f .s{opacity:.38;font-size:${TAMANHO - 5}px}
.c:hover .s{fill:url(#quente);opacity:1}
.centelhas text{fill:#e9c45a;opacity:0;animation:piscar 3s steps(1,end) 0s infinite}
.chuva{opacity:.62;transition:opacity 1.2s}
.ativo .chuva{opacity:1}
${ritmos.join('\n')}
@keyframes cair{from{transform:translateY(-660px)}to{transform:translateY(${ALTURA + 40}px)}}
@keyframes piscar{0%{opacity:0}62%{opacity:.85}70%{opacity:.25}78%{opacity:0}}
.h{mask:url(#mLados)}
.v{mask:url(#mPe)}
@media (max-aspect-ratio:1/1){.h{mask:none}.v{mask:url(#mTopo)}}
@media (prefers-reduced-motion:reduce){.s,.centelhas text{animation-play-state:paused}}
`

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LARGURA} ${ALTURA}" preserveAspectRatio="xMidYMid slice">` +
    `<style>${estilo}</style>` +
    `<defs>` +
    // Trilha: cauda que some no escuro, corpo dourado, cabeça quase branca.
    `<linearGradient id="trilha" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="#5a4410" stop-opacity="0"/>` +
    `<stop offset=".55" stop-color="#9c7a1e" stop-opacity=".55"/>` +
    `<stop offset=".9" stop-color="#d4af37"/>` +
    `<stop offset=".97" stop-color="#f4d77a"/>` +
    `<stop offset="1" stop-color="#fff4d0"/>` +
    `</linearGradient>` +
    `<linearGradient id="quente" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="#b8901f" stop-opacity=".2"/>` +
    `<stop offset=".6" stop-color="#f0c94c"/>` +
    `<stop offset="1" stop-color="#ffffff"/>` +
    `</linearGradient>` +
    // Esmaecimento lateral: cheio nas bordas, nada no centro.
    `<linearGradient id="gLados" x1="0" y1="0" x2="1" y2="0">` +
    `<stop offset="0" stop-color="#fff"/><stop offset=".12" stop-color="#fff"/>` +
    `<stop offset=".19" stop-color="#9a9a9a"/><stop offset=".25" stop-color="#2c2c2c"/>` +
    `<stop offset=".3" stop-color="#000"/><stop offset=".7" stop-color="#000"/>` +
    `<stop offset=".75" stop-color="#2c2c2c"/><stop offset=".81" stop-color="#9a9a9a"/>` +
    `<stop offset=".88" stop-color="#fff"/><stop offset="1" stop-color="#fff"/>` +
    `</linearGradient>` +
    // Esmaecimento do pé: some antes da caixa de escrita.
    `<linearGradient id="gPe" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#fff"/>` +
    `<stop offset=".66" stop-color="#8a8a8a"/><stop offset=".76" stop-color="#262626"/>` +
    `<stop offset=".84" stop-color="#000"/><stop offset="1" stop-color="#000"/>` +
    `</linearGradient>` +
    // Tela em pé (celular): só uma faixa no alto, dissolvendo para baixo.
    `<linearGradient id="gTopo" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="#fff"/><stop offset=".14" stop-color="#fff"/>` +
    `<stop offset=".24" stop-color="#7a7a7a"/><stop offset=".32" stop-color="#1e1e1e"/>` +
    `<stop offset=".38" stop-color="#000"/><stop offset="1" stop-color="#000"/>` +
    `</linearGradient>` +
    `<mask id="mLados" maskUnits="userSpaceOnUse" x="0" y="-700" width="${LARGURA}" height="${ALTURA + 1400}">` +
    `<rect x="0" y="-700" width="${LARGURA}" height="${ALTURA + 1400}" fill="url(#gLados)"/></mask>` +
    `<mask id="mPe" maskUnits="userSpaceOnUse" x="0" y="0" width="${LARGURA}" height="${ALTURA}">` +
    `<rect width="${LARGURA}" height="${ALTURA}" fill="url(#gPe)"/></mask>` +
    `<mask id="mTopo" maskUnits="userSpaceOnUse" x="0" y="0" width="${LARGURA}" height="${ALTURA}">` +
    `<rect width="${LARGURA}" height="${ALTURA}" fill="url(#gTopo)"/></mask>` +
    // Fundo: preto com um calor discreto nos cantos de cima.
    `<radialGradient id="calor" cx=".5" cy="0" r=".9">` +
    `<stop offset="0" stop-color="#120d04"/><stop offset=".6" stop-color="#070603"/><stop offset="1" stop-color="#030302"/>` +
    `</radialGradient>` +
    trilhas.join('') +
    `</defs>` +
    `<rect width="${LARGURA}" height="${ALTURA}" fill="url(#calor)"/>` +
    `<g class="v"><g class="h"><g class="chuva">` +
    colunas.join('') +
    `<g class="centelhas">${centelhas.join('')}</g>` +
    `</g></g></g>` +
    `</svg>`
  )
}

const MODELO = montar()

/** A cena pronta; `ativo` acelera e acende a chuva enquanto o Claude trabalha. */
export function cena(ativo         )         {
  return ativo ? MODELO.replace('<svg ', '<svg class="ativo" ') : MODELO
}

export const TAMANHO_CENA = MODELO.length
