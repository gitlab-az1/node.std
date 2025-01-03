import { assertUnsignedInteger } from './asserts';


export type RandomStringOptions = {
  specialCharacters?: boolean;
  exclude?: readonly string[];
  urlSafe?: boolean;
}

export function randomString(length: number = 32, options?: RandomStringOptions): string {
  assertUnsignedInteger(length);
  let alphabet = `abcdefghijklmnopqrstuvwxyz${'abcdefghijklmnopqrstuvwxyz'.toUpperCase()}1234567890${options?.urlSafe ? '' : '-'}_`;

  if(!options?.urlSafe && options?.specialCharacters) {
    alphabet += '!@#$%&*()+=§;:|\\/ç';
  }

  if(options?.exclude && options.exclude.length > 0) {
    for(let i = 0; i < options.exclude.length; i++) {
      alphabet = alphabet.replace(new RegExp(toRegexp(options.exclude[i]), 'g'), '');
    }
  }

  let output: string = '';

  for(let i = 0; i < length; i++) {
    output += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return output;
}

function toRegexp(char: string): string {
  const needsToScape = [
    '+',
    '.',
    '*',
    '(',
    ')',
    '^',
    '$',
    '/',
  ];

  return needsToScape.includes(char) ? `\\${char}` : char;
}
