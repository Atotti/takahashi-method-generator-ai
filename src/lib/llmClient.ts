// lib/llmClient.ts
// WebLLMを初期化＆プロンプト送信するラッパ
import type { MLCEngine } from "@mlc-ai/web-llm";

let llmEngine: MLCEngine | null = null;

/**
 * WebLLMモデルを初期化し、使える状態にする
 */
export async function initWebLLM(modelName: string) {
  if (typeof window === "undefined") {
    // SSR環境では実行不可
    return;
  }
  const { CreateMLCEngine } = await import("@mlc-ai/web-llm");

  console.log("Initializing WebLLM with model:", modelName);
  llmEngine = await CreateMLCEngine(modelName, {
    initProgressCallback: (progress) => {
      console.log("Model loading progress:", progress);
    },
  });
  console.log("LLM Engine initialized!");
}

/**
 * 入力テキストを「高橋メソッド用フォーマット」に変換する
 */
export async function transformToTakahashiFormat(rawText: string): Promise<string> {
  if (!llmEngine) {
    throw new Error("LLM engine is not initialized. Call initWebLLM first.");
  }
  const systemPrompt = `あなたはプレゼン資料作成のアシスタントです。
ユーザーが入力した文章を、高橋メソッド向けに短いスライド文へ要約し、
「- スライド文」「  - メモ文」形式で書き直してください。
メモ文は必要に応じて付けてください。
`;
  const userPrompt = `【ユーザーの文章】
${rawText}
【出力形式例】
- タイトル
  - メモ
- 次のスライド
  - 補足メモ
`;

  const response = await llmEngine.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 512,
  });

  const content = response.choices[0].message.content ? response.choices[0].message.content.trim() : "";
  console.log("LLM Output:\n", content);
  return content;
}
