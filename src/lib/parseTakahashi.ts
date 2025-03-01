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

      // 先頭ハイフン
      const slideMatch = line.match(/^- (.*)/);
      // インデントありハイフン
      const memoMatch = line.match(/^(\s+)- (.*)/);

      if (slideMatch && !memoMatch) {
        // 新規スライド
        if (currentSlide) {
          slides.push(currentSlide);
        }
        currentSlide = { text: slideMatch[1].trim(), memos: [] };
      } else if (memoMatch) {
        // メモ行
        if (currentSlide) {
          currentSlide.memos.push(memoMatch[2].trim());
        }
      }
    }
    if (currentSlide) slides.push(currentSlide);

    return slides;
  }
