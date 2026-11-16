# B&GMatrix-Background

Tema do Claude Code para o app desktop e o app de celular: fundo preto com colunas de caracteres dourados (algarismos, letras, sinais como § e ¶ e kanji) caindo sem parar. A chuva é densa nas bordas e no alto e se dissolve num degradê suave antes do centro, onde fica a conversa, e antes da caixa de escrita, que fica sempre limpa. Enquanto o Claude trabalha, a chuva acelera e brilha mais; a coluna sob o cursor acende quando o app deixa o mouse chegar ao fundo.

Só no modo escuro do app (o fundo preto não serve ao modo claro). No terminal e nos editores o tema não aparece.

## Instalação

No prompt de uma sessão do Claude Code no terminal:

```
/plugin install bg-matrix-background --marketplace mauro-massucatti/bg-matrix-background
```

Responda `y` para adicionar o catálogo e escolha o escopo (o de usuário vale para todas as sessões).

Pelo shell:

```bash
claude plugin install bg-matrix-background --marketplace mauro-massucatti/bg-matrix-background
```

No app desktop, onde `/plugin` não roda: clique no + ao lado da caixa de texto, depois em Plugins, Add marketplace com `mauro-massucatti/bg-matrix-background` e Add plugin.

Depois de instalado, deixe o app no modo escuro.

## Arquivos

- `hooks/register.tsx`: cores do tema, fundo animado e o estado "trabalhando".
- `hooks/cena.js`: gera o SVG da chuva (cerca de 34 mil caracteres; o limite do app é 131.072).
- `hooks/make-colors.js`: gerador de paleta do Claude Code, copiado sem alteração.

## Cuidado ao mexer na cena

O app apaga o atributo `style=` dos elementos da cena antes de desenhá-la. Todo ritmo de animação fica em classes declaradas no bloco `<style>` do SVG, nunca em `style=` nem em variáveis CSS.

## Licença

MIT. Veja o arquivo `LICENSE`.
