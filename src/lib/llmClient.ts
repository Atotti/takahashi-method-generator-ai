// lib/llmClient.ts
// WebLLMを初期化＆プロンプト送信するラッパ
import {
  type MLCEngine,
  type InitProgressCallback,
  type Chat,
  type MLCEngineInterface,
  CreateMLCEngine,
  modelLibURLPrefix,
  modelVersion,
} from "@mlc-ai/web-llm";

// WebGPU型定義
declare global {
  interface Navigator {
    gpu: {
      requestAdapter(): Promise<any>;
    };
  }
}

let llmEngine: MLCEngineInterface | null = null;
let isInitializing = false;

/**
 * WebGPUのサポートを確認
 */
async function checkWebGPUSupport(): Promise<boolean> {
  if (!navigator.gpu) {
    throw new Error("このブラウザはWebGPUをサポートしていません。Chrome 113以降を使用してください。");
  }

  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error("WebGPUアダプターの取得に失敗しました。GPUドライバーを更新してください。");
    }
    return true;
  } catch (error) {
    console.error("WebGPUの初期化エラー:", error);
    throw new Error("WebGPUの初期化に失敗しました。ハードウェアアクセラレーションが有効か確認してください。");
  }
}

/**
 * TinySwallow 1.5B Instruct モデルを初期化する
 */
export async function initWebLLM() {
  if (typeof window === "undefined") {
    // SSR環境での呼び出しは不可
    return;
  }
  if (isInitializing) {
    // TODO: UIに進捗を表示する
    throw new Error("モデルの初期化がすでに実行中です。");
  }

  try {
    isInitializing = true;

    // WebGPU サポート確認
    await checkWebGPUSupport();

    console.log("TinySwallowモデルを WebLLM で初期化中...");

    const appConfig = {
      model_list: [
        {
          model: "https://huggingface.co/SakanaAI/TinySwallow-1.5B-Instruct-q4f32_1-MLC",
          model_id: "TinySwallow-1.5B",
          model_lib:
          // https://github.com/mlc-ai/binary-mlc-llm-libs/tree/main/web-llm-models/v0_2_48
              modelLibURLPrefix +
              modelVersion +
              "/Qwen2-1.5B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        },
      ],
    };

    const updateEngineInitProgressCallback: InitProgressCallback = (progress) => {
      // TODO: UIに進捗を表示する
      console.log("モデル初期化中:", progress);
    };

    // エンジン作成＆モデル読み込み
    llmEngine = await CreateMLCEngine("TinySwallow-1.5B", {
      appConfig: appConfig,
      initProgressCallback: updateEngineInitProgressCallback,
    });

    if (!llmEngine || !llmEngine.chat) {
      throw new Error("TinySwallow 1.5B モデルの初期化に失敗しました。");
    }
    console.log("TinySwallow 1.5B モデルの初期化が完了しました！");
  } catch (e: unknown) {
    console.error("TinySwallowモデルの初期化中にエラーが発生:", e);
    throw e;
  } finally {
    isInitializing = false;
  }
}

/**
 * 入力テキストを「高橋メソッド用フォーマット」に変換する
 */
export async function transformToTakahashiFormat(rawText: string): Promise<string> {
  if (!llmEngine) {
    throw new Error("LLM engineが初期化されていません。initWebLLMを先に実行してください。");
  }

  const systemPrompt = `あなたは高橋メソッドに基づくプレゼン資料作成のエキスパートです。
以下のルールに従って、入力された文章を高橋メソッド形式に変換してください：

1. 各スライドは1つの重要なアイデアだけを含む
2. キーワードや短いフレーズを使用（1行10文字以内が理想）
3. 階層構造を意識し、論理的な流れを作る
4. 必要に応じて補足メモを追加

出力形式：
- スライド文（簡潔に）
  - メモ（必要な場合のみ）
`;

  const userPrompt = `【入力文章】
${rawText}

【出力形式】
高橋メソッド形式で、各スライドの内容を「- スライド文」「  - メモ文」の形式で出力してください。
メモは補足が必要な場合のみ付けてください。`;

  try {
    const response = await llmEngine.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3, // より一貫性のある出力のために温度を下げる
      max_tokens: 1024, // より長い文章に対応
    });

    const content = response.choices[0].message.content?.trim();
    if (!content) {
      throw new Error("LLMからの応答が空でした");
    }

    // 出力形式の検証
    if (!content.includes('-')) {
      throw new Error("高橋メソッド形式への変換に失敗しました");
    }

    console.log("LLM Output:\n", content);
    return content;
  } catch (error: unknown) {
    console.error("変換処理でエラーが発生:", error);
    const errorMessage = error instanceof Error ? error.message : "不明なエラーが発生しました";
    throw new Error(`高橋メソッド形式への変換に失敗しました: ${errorMessage}`);
  }
}
