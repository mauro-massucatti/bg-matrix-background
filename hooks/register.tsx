import { atom, read, update } from 'claude-code'
import type { Register, ThemeSetArgs } from 'claude-code'

import { cena, TAMANHO_CENA } from './cena.js'
import { makeColors } from './make-colors.js'

const NOME = 'bg-matrix-background'

// Enquanto o Claude trabalha, a chuva acelera e acende.
const ativo = atom({ plugin: 'bg-matrix-background', key: 'ativo' } as const, false)

// Preto levemente aquecido nas superfícies, texto em marfim dourado.
const { theme, problems } = makeColors({
  label: 'B&GMatrix-Background',
  only: 'dark',
  roles: { accent: '#d4af37', danger: '#d9534a', success: '#7fae5a', warning: '#e08a3c', pro: '#b48ad6' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0a0905',
        'surface-1': '#13100a',
        'surface-2': '#1a160e',
        'surface-3': '#211c12',
        'text-primary': '#f3e6c4',
        'text-secondary': '#d8c69c',
        'text-muted': '#b5a276',
      },
    },
  },
})

const VISUAL: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: NOME, glass: { blur: 8, tint: '#0a0905', opacity: 0.55 } },
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const recusa = problems.find(linha => linha.startsWith("Desktop won't paint"))

    if (recusa !== undefined) {
      $.ui.toast(recusa)
    }

    if (TAMANHO_CENA > 131072) {
      $.ui.toast(`B&GMatrix-Background: a cena passou do limite (${TAMANHO_CENA} caracteres)`)
    }

    // A sessão sempre abre com a chuva calma, mesmo se a anterior parou no meio.
    await update($, ativo, () => false)

    // No terminal o tema não aparece; fica em silêncio em vez de ocupar a
    // linha de status com o aviso.
    await $.theme.set(VISUAL)

    return next(e)
  })

  // Sem esperar: se o estado falhar, o envio da mensagem segue normal.
  on('prompt.submit', ($, e, next) => {
    update($, ativo, () => true).catch(() => undefined)

    return next(e)
  })

  // Só o fim da resposta principal acalma a chuva; o fim de um subagente, não.
  // Uma interrupção também conta como fim (reason 'aborted').
  on('turn.complete', async ($, e, next) => {
    if (e.agentId === undefined) {
      await update($, ativo, () => false)
    }

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, async ($, e, next) => {
    const minha = e.props.scene === NOME
    const desenha = e.surface === 'desktop' || e.surface === 'mobile'

    if (!minha || !desenha) {
      return next(e)
    }

    const { Svg } = $.ui.resolve(e)
    const trabalhando = await read($, ativo)

    return (
      <Svg
        source={cena(trabalhando)}
        alt="Colunas de caracteres dourados caindo devagar sobre fundo preto"
        isInteractive
      />
    )
  })
}
