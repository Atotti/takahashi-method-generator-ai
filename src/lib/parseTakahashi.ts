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
  // <answer>タグ内のコンテンツを抽出、なければ入力テキスト全体を使用
  const answerMatch = input.match(/<answer>([\s\S]*?)<\/answer>/);
  const contentToProcess = answerMatch ? answerMatch[1].trim() : input.trim();

  const lines = contentToProcess.split(/\r?\n/);
  const slides: SlideData[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // ハイフンで始まる行の処理
    const slideMatch = trimmed.match(/^- (.*)/);
    if (slideMatch) {
      slides.push({ text: slideMatch[1].trim(), memos: [] });
    }
  }

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
