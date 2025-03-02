// lib/llmClient.ts
// WebLLMを初期化＆プロンプト送信するラッパ
import * as webllm from "@mlc-ai/web-llm";
import {
  type InitProgressCallback,
  type MLCEngineInterface,
} from "@mlc-ai/web-llm";

// WebGPU型定義
declare global {
  interface Navigator {
    gpu?: {
      requestAdapter(): Promise<GPUAdapter | null>;
    };
  }

  interface GPUAdapter {
    requestAdapterInfo(): Promise<GPUAdapterInfo>;
  }

  interface GPUAdapterInfo {
    vendor: string;
    architecture: string;
    device: string;
    description: string;
  }
}

let llmEngine: MLCEngineInterface | null = null;
let isInitializing = false;

// モデル初期化中のエラーをより詳細に表示するためのデバッグフラグ
const DEBUG = true;

// 実行環境はWasmに統一（Wasm経由でWebGPUを使用）
const currentRuntime = 'wasm';

/**
 * WebGPUのサポート情報を表示（デバッグ用）
 */
async function checkWebGPUSupport(): Promise<void> {
  if (typeof window === "undefined") {
    return; // SSR環境ではチェックしない
  }

  try {
    if (!navigator.gpu) {
      console.log("WebGPUは利用できません。Wasm経由で実行します。");
      return;
    }

    console.log("WebGPUアダプターをチェック中...");
    const adapter = await navigator.gpu.requestAdapter();

    if (!adapter) {
      console.log("WebGPUアダプターを取得できません。Wasm経由で実行します。");
      return;
    }

    // アダプターの情報を表示（デバッグ用）
    if (DEBUG) {
      const info = await adapter.requestAdapterInfo();
      console.log("WebGPUアダプター情報:", info);
    }

    console.log("WebGPUが利用可能です。Wasm経由で使用します。");
  } catch (error) {
    console.log("WebGPUの初期化に失敗しました。Wasm経由で実行します。", error);
  }
}

/**
 * TinySwallow 1.5B Instruct モデルを初期化する
 */
export async function initWebLLM(modelName: string) {
  if (typeof window === "undefined") {
    return; // SSR環境での呼び出しは不可
  }

  if (isInitializing) {
    throw new Error("モデルの初期化がすでに実行中です。");
  }

  try {
    isInitializing = true;

    // WebGPUサポート情報を表示（デバッグ用）
    await checkWebGPUSupport();
    console.log(`実行環境: ${currentRuntime} (Wasm経由でWebGPU使用)`);

    // モデル設定を構築（統一版）
    const modelConfig = {
      model: "https://huggingface.co/Atotti/TinySwallow-GRPO-TMethod-experimental-q4f32_1-MLC",
      model_lib: webllm.modelLibURLPrefix + webllm.modelVersion + "/Qwen2-1.5B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
    };
    const appConfig = {
      model_list: [
        {
          model: modelConfig.model,
          model_id: modelName,
          model_lib: modelConfig.model_lib,
        },
      ],
    };

    if (DEBUG) {
      console.log("モデル設定:", JSON.stringify(appConfig, null, 2));
    }

    const updateEngineInitProgressCallback: InitProgressCallback = (progress) => {
      console.log(`モデル初期化中 (${currentRuntime}):`, progress);
    };

    // エンジン作成＆モデル読み込み
    llmEngine = await webllm.CreateMLCEngine(modelName, {
      appConfig: appConfig,
      initProgressCallback: updateEngineInitProgressCallback,
    });

    if (!llmEngine || !llmEngine.chat) {
      throw new Error("モデルの初期化に失敗しました。");
    }

    console.log(`モデルの初期化が完了しました！(${currentRuntime})`);
  } catch (error: unknown) {
    console.error("モデルの初期化中にエラーが発生:", error);
    if (DEBUG) {
      console.log("エラーの詳細:", error instanceof Error ? error.message : String(error));
    }
    throw error;
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

  const systemPrompt = `
Respond in the following format:
<reasoning>
...
</reasoning>
<answer>
- ...
- ...
- ...
...
</answer>
あなたは高橋メソッドに基づくプレゼン資料作成のエキスパートです。
以下のルールに従って、入力された文章を高橋メソッド形式に変換してください：
###Rules###
以下のルールを必ず守って出力してください：
- 1スライドに書けるのは1メッセージのみです。
- 出力するテキストは最大15文字以内で、極力短くすること。
- 各スライドは必ず1つの短い文、または単語で構成してください。
- スライドの枚数は制限しないので、テンポよく簡潔に表現してください。
- 装飾的な記号や句読点は極力避け、シンプルな言葉を使ってください。
- ユーザーが提示したテーマを元に、インパクトがあり直感的に伝わるスライド群を生成してください。
- 出力形式は "- スライドに表示したいテキスト" という形式で出力してください。
- "- "に続く文字は、スライドに表示されるテキストとして扱われます。表示させないテキストは出力しないでください。
`;

  const userPrompt = `【入力文章】
${rawText}

【出力】
入力文章をプレゼンする高橋メソッドに基づくプレゼン資料を作成してください。スライドは可能な限り内容を網羅した大量のスライドにしてください。
`;

  try {
    const response = await llmEngine.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      top_p: 0.95,
      presence_penalty: 0.5,
      max_tokens: 1024,
    });

    const content = response.choices[0].message.content?.trim();
    if (!content) {
      throw new Error("LLMからの応答が空でした");
    }

    // 出力形式の検証 - 少なくとも1つの「- スライドテキスト」形式の行があるかチェック
    const slideLineRegex = /^- .+$/m;
    if (!slideLineRegex.test(content)) {
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
