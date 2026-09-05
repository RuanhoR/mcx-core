interface LuckBlockLoreParsed {
  type: 'good' | 'bad';
  num: number;
}

export class LoreParser {
  public static parseLuckBlockLore(lore: string): LuckBlockLoreParsed {
    const slice = lore.slice(2);
    const num = parseInt(slice);
    if (isNaN(num) || num > 100 || num < -100) {
      throw new TypeError('[LuckParser]: Invaild LuckNum');
    }
    return {
      type: num > 0 ? 'good' : 'bad',
      num: num,
    };
  }
  public static generateLuckBlockLore(parsed: LuckBlockLoreParsed) {
    if (parsed.num > 100 || parsed.num < -100) {
      throw new TypeError('[LuckParser]: Invaild LuckNum');
    }
    return `${parsed.num > 0 ? '§a' : '§c'}${parsed.num}`;
  }
}
