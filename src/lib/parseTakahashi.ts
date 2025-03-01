export interface SlideData {
    text: string;
    memos: string[];
  }

  /**
   * アウトライン文字列をパースし、SlideData[] に変換する
   */
  export function parseTakahashiOutline(input: string): SlideData[] {
    const lines = input.split(/\r?\n/);
    const slides: SlideData[] = [];
    let currentSlide: SlideData | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // ハイフンで始まる行（インデントの有無に関わらず）
      const slideMatch = line.match(/^(?:\s*)- (.*)/);

      if (slideMatch) {
        // 新規スライド
        if (currentSlide) {
          slides.push(currentSlide);
        }
        currentSlide = { text: slideMatch[1].trim(), memos: [] };
      }
    }
    if (currentSlide) slides.push(currentSlide);

    return slides;
  }
