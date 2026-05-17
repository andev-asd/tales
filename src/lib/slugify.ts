const transliterationMap: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'h',
  ґ: 'g',
  д: 'd',
  е: 'e',
  ж: 'zh',
  з: 'z',
  и: 'y',
  і: 'i',
  й: 'i',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'kh',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ь: '',
};

function transliterateChar(char: string, previousChar: string | undefined) {
  const atWordStart = !previousChar || /\s|-|_/.test(previousChar);

  switch (char) {
    case 'є':
      return atWordStart ? 'ye' : 'ie';
    case 'ї':
      return atWordStart ? 'yi' : 'i';
    case 'ю':
      return atWordStart ? 'yu' : 'iu';
    case 'я':
      return atWordStart ? 'ya' : 'ia';
    default:
      return transliterationMap[char] ?? char;
  }
}

export function transliterateUkrainian(value: string) {
  const normalized = value.toLowerCase();

  return normalized
    .split('')
    .map((char, index) => transliterateChar(char, normalized[index - 1]))
    .join('');
}

export function slugifyTitle(value: string) {
  return transliterateUkrainian(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}
