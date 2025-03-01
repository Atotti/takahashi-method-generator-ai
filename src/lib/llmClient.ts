// lib/llmClient.ts
// WebLLMを初期化＆プロンプト送信するラッパ
import {
  type InitProgressCallback,
  type MLCEngineInterface,
  CreateMLCEngine,
  modelLibURLPrefix,
  modelVersion,
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

// 実行環境の種類を定義
type RuntimeEnvironment = 'webgpu' | 'wasm';

// 現在の実行環境
let currentRuntime: RuntimeEnvironment = 'wasm';

/**
 * WebGPUのサポートを確認し、利用可能な実行環境を決定
 */
async function detectRuntime(): Promise<RuntimeEnvironment> {
  if (typeof window === "undefined") {
    return 'wasm'; // SSR環境ではWasmを使用
  }

  try {
    if (!navigator.gpu) {
      console.log("WebGPUは利用できません。WebAssemblyを使用します。");
      return 'wasm';
    }

    console.log("WebGPUアダプターをチェック中...");
    const adapter = await navigator.gpu.requestAdapter();

    if (!adapter) {
      console.log("WebGPUアダプターを取得できません。WebAssemblyを使用します。");
      return 'wasm';
    }

    // アダプターの情報を表示（デバッグ用）
    if (DEBUG) {
      const info = await adapter.requestAdapterInfo();
      console.log("WebGPUアダプター情報:", info);
    }

    console.log("WebGPUが利用可能です。");
    return 'webgpu';
  } catch (error) {
    console.log("WebGPUの初期化に失敗しました。WebAssemblyを使用します。", error);
    return 'wasm';
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

    // 利用可能な実行環境を検出
    currentRuntime = await detectRuntime();
    console.log(`実行環境: ${currentRuntime}`);

    // モデル設定を構築
    const modelConfig = {
      webgpu: {
        model: "https://huggingface.co/SakanaAI/TinySwallow-1.5B-Instruct-q4f32_1-MLC",
        model_lib: `${modelLibURLPrefix}${modelVersion}/Qwen2-1.5B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm`,
      },
      wasm: {
        model: "https://huggingface.co/SakanaAI/TinySwallow-1.5B-Instruct-q4f32_1-MLC",
        model_lib: `${modelLibURLPrefix}${modelVersion}/Qwen2-1.5B-Instruct-q4f32_1-ctx4k_cs1k-wasm.wasm`,
      },
    };

    const selectedConfig = modelConfig[currentRuntime];
    const appConfig = {
      model_list: [
        {
          model: selectedConfig.model,
          model_id: modelName,
          model_lib: selectedConfig.model_lib,
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
    llmEngine = await CreateMLCEngine(modelName, {
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
      console.log("エラーの詳細:", JSON.stringify(error, null, 2));
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
