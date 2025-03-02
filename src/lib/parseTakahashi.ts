export interface SlideData {
  text: string;
  memos: string[];
}

export interface ParsedLLMResponse {
  reasoning: string;
  answer: string;
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

/**
 * LLMの応答から<reasoning>と<answer>タグの内容を抽出する
 */
export function parseReasoningAndAnswer(content: string): ParsedLLMResponse {
  const reasoningMatch = content.match(/<reasoning>([\s\S]*?)<\/reasoning>/);
  const answerMatch = content.match(/<answer>([\s\S]*?)<\/answer>/);

  return {
    reasoning: reasoningMatch ? reasoningMatch[1].trim() : "",
    answer: answerMatch ? answerMatch[1].trim() : content.trim()
  };
}
