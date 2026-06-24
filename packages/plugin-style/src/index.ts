/**
 * @fileoverview Optional Unicode style and symbol plugin.
 */

import {
  type TextaviaToolDefinition,
  type ToolRegistry,
  requireText,
} from '@textavia/core';
import { z } from 'zod';

const STYLE_PLUGIN = '@textavia/plugin-style';
const WEB_BASE = 'https://textavia.com/tools';
const EmptyOptions = z.object({});

type Transform = (text: string) => string;

function result(output: string) {
  return { output, outputKind: 'text' as const };
}

function json(output: unknown) {
  return { output, outputKind: 'json' as const };
}

function fromCodePoint(value: number): string {
  return String.fromCodePoint(value);
}

function sequentialMap(
  upperStart: number,
  lowerStart: number,
  digitStart?: number,
): Record<string, string> {
  const map: Record<string, string> = {};
  for (let i = 0; i < 26; i += 1) {
    map[String.fromCharCode(65 + i)] = fromCodePoint(upperStart + i);
    map[String.fromCharCode(97 + i)] = fromCodePoint(lowerStart + i);
  }
  if (digitStart !== undefined) {
    for (let i = 0; i < 10; i += 1) {
      map[String(i)] = fromCodePoint(digitStart + i);
    }
  }
  return map;
}

function applyMap(text: string, map: Readonly<Record<string, string>>): string {
  return [...text].map((char) => map[char] ?? char).join('');
}

const boldMap = sequentialMap(0x1d5d4, 0x1d5ee, 0x1d7ec);
const italicMap = sequentialMap(0x1d608, 0x1d622);
const monospaceMap = sequentialMap(0x1d670, 0x1d68a, 0x1d7f6);
const gothicMap = {
  ...sequentialMap(0x1d504, 0x1d51e),
  C: 'ℭ',
  H: 'ℌ',
  I: 'ℑ',
  R: 'ℜ',
  Z: 'ℨ',
};
const bubbleMap: Record<string, string> = {};
for (let i = 0; i < 26; i += 1) {
  bubbleMap[String.fromCharCode(65 + i)] = fromCodePoint(0x24b6 + i);
  bubbleMap[String.fromCharCode(97 + i)] = fromCodePoint(0x24d0 + i);
}
bubbleMap['0'] = '⓪';
for (let i = 1; i <= 9; i += 1) {
  bubbleMap[String(i)] = fromCodePoint(0x2460 + i - 1);
}

const superscriptMap: Record<string, string> = {
  a: 'ᵃ',
  b: 'ᵇ',
  c: 'ᶜ',
  d: 'ᵈ',
  e: 'ᵉ',
  f: 'ᶠ',
  g: 'ᵍ',
  h: 'ʰ',
  i: 'ⁱ',
  j: 'ʲ',
  k: 'ᵏ',
  l: 'ˡ',
  m: 'ᵐ',
  n: 'ⁿ',
  o: 'ᵒ',
  p: 'ᵖ',
  r: 'ʳ',
  s: 'ˢ',
  t: 'ᵗ',
  u: 'ᵘ',
  v: 'ᵛ',
  w: 'ʷ',
  x: 'ˣ',
  y: 'ʸ',
  z: 'ᶻ',
  A: 'ᴬ',
  B: 'ᴮ',
  D: 'ᴰ',
  E: 'ᴱ',
  G: 'ᴳ',
  H: 'ᴴ',
  I: 'ᴵ',
  J: 'ᴶ',
  K: 'ᴷ',
  L: 'ᴸ',
  M: 'ᴹ',
  N: 'ᴺ',
  O: 'ᴼ',
  P: 'ᴾ',
  R: 'ᴿ',
  T: 'ᵀ',
  U: 'ᵁ',
  W: 'ᵂ',
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
};

const subscriptMap: Record<string, string> = {
  a: 'ₐ',
  e: 'ₑ',
  h: 'ₕ',
  i: 'ᵢ',
  j: 'ⱼ',
  k: 'ₖ',
  l: 'ₗ',
  m: 'ₘ',
  n: 'ₙ',
  o: 'ₒ',
  p: 'ₚ',
  r: 'ᵣ',
  s: 'ₛ',
  t: 'ₜ',
  u: 'ᵤ',
  v: 'ᵥ',
  x: 'ₓ',
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉',
};

const upsideMap: Record<string, string> = {
  a: 'ɐ',
  b: 'q',
  c: 'ɔ',
  d: 'p',
  e: 'ǝ',
  f: 'ɟ',
  g: 'ƃ',
  h: 'ɥ',
  i: 'ᴉ',
  j: 'ɾ',
  k: 'ʞ',
  l: 'l',
  m: 'ɯ',
  n: 'u',
  o: 'o',
  p: 'd',
  q: 'b',
  r: 'ɹ',
  s: 's',
  t: 'ʇ',
  u: 'n',
  v: 'ʌ',
  w: 'ʍ',
  x: 'x',
  y: 'ʎ',
  z: 'z',
  '.': '˙',
  ',': "'",
  '?': '¿',
  '!': '¡',
};

const mirrorMap: Record<string, string> = {
  b: 'd',
  d: 'b',
  p: 'q',
  q: 'p',
  '<': '>',
  '>': '<',
  '(': ')',
  ')': '(',
  '[': ']',
  ']': '[',
  '{': '}',
  '}': '{',
  '/': '\\',
  '\\': '/',
};

function combining(mark: string): Transform {
  return (text) =>
    [...text]
      .map((char) => (/\s/.test(char) ? char : `${char}${mark}`))
      .join('');
}

function wide(text: string): string {
  return [...text]
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 33 && code <= 126) {
        return fromCodePoint(code + 0xfee0);
      }
      return char === ' ' ? '　' : char;
    })
    .join('');
}

function deterministicZalgo(text: string): string {
  const marks = ['\u0301', '\u0302', '\u0303', '\u0334', '\u0337', '\u0323'];
  return [...text]
    .map((char, index) =>
      /\s/.test(char) ? char : `${char}${marks[index % marks.length] ?? ''}`,
    )
    .join('');
}

function pigLatin(text: string): string {
  return text.replace(/[A-Za-z]+/g, (word) => {
    const match = /^([^aeiouAEIOU]*)(.*)$/.exec(word);
    const head = match?.[1] ?? '';
    const tail = match?.[2] ?? word;
    return `${tail}${head || 'w'}ay`;
  });
}

function phonetic(text: string): string {
  return text.replace(/[A-Za-z]+/g, (word) =>
    word.toLowerCase().split('').join('-'),
  );
}

function big(text: string): string {
  return text
    .toUpperCase()
    .split('')
    .map((char) => (char === ' ' ? '   ' : `[${char}]`))
    .join(' ');
}

function wingdings(text: string): string {
  const symbols = ['✈', '✂', '☎', '✉', '☞', '☜', '☝', '☟', '✌', '☯'];
  return [...text]
    .map((char) =>
      /[A-Za-z0-9]/.test(char)
        ? symbols[char.charCodeAt(0) % symbols.length]
        : char,
    )
    .join('');
}

const transforms: Readonly<Record<string, Transform>> = {
  bold: (text) => applyMap(text, boldMap),
  italic: (text) => applyMap(text, italicMap),
  cursive: (text) => applyMap(text, sequentialMap(0x1d49c, 0x1d4b6)),
  gothic: (text) => applyMap(text, gothicMap),
  bubble: (text) => applyMap(text, bubbleMap),
  small: (text) => applyMap(text, superscriptMap),
  strike: combining('\u0336'),
  underline: combining('\u0332'),
  'upside-down': (text) => applyMap([...text].reverse().join(''), upsideMap),
  wide,
  zalgo: deterministicZalgo,
  superscript: (text) => applyMap(text, superscriptMap),
  subscript: (text) => applyMap(text, subscriptMap),
  invisible: (text) => [...text].join('\u200b'),
  slash: (text) => [...text].join('/'),
  stacked: (text) => [...text].join('\n'),
  glitch: deterministicZalgo,
  mirror: (text) => applyMap([...text].reverse().join(''), mirrorMap),
  typewriter: (text) => applyMap(text, monospaceMap),
  aesthetic: wide,
  big,
  wingdings,
  discord: (text) => `**${text}**`,
  instagram: (text) => applyMap(text, italicMap),
  twitter: (text) => applyMap(text, boldMap),
  facebook: (text) => applyMap(text, bubbleMap),
  'pig-latin': pigLatin,
  'phonetic-spelling': phonetic,
};

const SYMBOLS = [
  { symbol: '✓', name: 'check mark', keywords: ['check', 'done', 'tick'] },
  { symbol: '★', name: 'star', keywords: ['star', 'favorite'] },
  { symbol: '→', name: 'right arrow', keywords: ['arrow', 'right'] },
  { symbol: '←', name: 'left arrow', keywords: ['arrow', 'left'] },
  { symbol: '•', name: 'bullet', keywords: ['bullet', 'dot'] },
  { symbol: '∞', name: 'infinity', keywords: ['infinity', 'math'] },
  { symbol: '©', name: 'copyright', keywords: ['copyright'] },
  { symbol: '™', name: 'trademark', keywords: ['trademark'] },
  { symbol: '§', name: 'section', keywords: ['section', 'legal'] },
  { symbol: '¶', name: 'pilcrow', keywords: ['paragraph'] },
] as const;

function styleTool(kind: string): TextaviaToolDefinition {
  return {
    id: `style.${kind}`,
    name: `Style ${kind}`,
    aliases: [`style ${kind}`],
    category: 'style',
    summary: `Apply the ${kind} text style.`,
    description: `Applies the ${kind} text style locally.`,
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/${kind}`,
    optionsSchema: EmptyOptions,
    examples: [
      { title: `Style ${kind}`, command: `txv style ${kind} "Hello"` },
    ],
    stability: 'stable',
    requiresOptionalPlugin: STYLE_PLUGIN,
    execute: (input) =>
      result((transforms[kind] ?? ((text) => text))(requireText(input))),
  };
}

export const styleTools: readonly TextaviaToolDefinition[] = [
  ...Object.keys(transforms).map(styleTool),
  {
    id: 'style.symbols.search',
    name: 'Symbol search',
    aliases: ['symbols search'],
    category: 'style',
    summary: 'Search Unicode symbols.',
    description: 'Searches a small local symbol catalog by name or keyword.',
    inputKind: ['text'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/symbols`,
    optionsSchema: EmptyOptions,
    examples: [
      { title: 'Search symbols', command: 'txv symbols search arrow --json' },
    ],
    stability: 'stable',
    requiresOptionalPlugin: STYLE_PLUGIN,
    execute: (input) => {
      const query = requireText(input).toLowerCase();
      return json(
        SYMBOLS.filter(
          (entry) =>
            entry.name.includes(query) ||
            entry.keywords.some((keyword) => keyword.includes(query)),
        ),
      );
    },
  },
  {
    id: 'style.symbols.list',
    name: 'Symbol list',
    aliases: ['symbols list'],
    category: 'style',
    summary: 'List Unicode symbols.',
    description: 'Lists the local symbol catalog.',
    inputKind: ['generated'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/symbols`,
    optionsSchema: EmptyOptions,
    examples: [{ title: 'List symbols', command: 'txv symbols list --json' }],
    stability: 'stable',
    requiresOptionalPlugin: STYLE_PLUGIN,
    execute: () => json(SYMBOLS),
  },
  {
    id: 'style.symbols.random',
    name: 'Random symbol',
    aliases: ['symbols random'],
    category: 'style',
    summary: 'Pick a random Unicode symbol.',
    description: 'Picks one symbol from the local catalog.',
    inputKind: ['generated'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/symbols`,
    optionsSchema: EmptyOptions,
    examples: [{ title: 'Random symbol', command: 'txv symbols random' }],
    stability: 'stable',
    requiresOptionalPlugin: STYLE_PLUGIN,
    execute: () => {
      const symbol =
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)] ?? SYMBOLS[0];
      return result(symbol.symbol);
    },
  },
];

export function registerStyleTools(registry: ToolRegistry): void {
  for (const tool of styleTools) {
    registry.register(tool);
  }
}

const stylePlugin = {
  name: STYLE_PLUGIN,
  version: '0.1.0',
  register: registerStyleTools,
};

export { stylePlugin };
