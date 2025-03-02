// lib/llmClient.ts
// WebLLMを初期化＆プロンプト送信するラッパ
import * as webllm from "@mlc-ai/web-llm";
import {
  type InitProgressCallback,
  type MLCEngineInterface,
} from "@mlc-ai/web-llm";

let llmEngine: MLCEngineInterface | null = null;
let isInitializing = false;
let isInitialized = false;
let initPromise: Promise<void> | null = null;
let loadingProgress = 0; // 0-100の範囲で進捗状況を表す

// モデル初期化中のエラーをより詳細に表示するためのデバッグフラグ
const DEBUG = true;

// 初期化状態を取得する関数
export function getInitializationStatus(): { isInitializing: boolean; isInitialized: boolean; progress: number } {
  return { isInitializing, isInitialized, progress: loadingProgress };
}

// 初期化が完了するまで待機する関数
export async function waitForInitialization(timeoutMs = 30000): Promise<boolean> {
  if (isInitialized) return true;
  if (!isInitializing) return false;

  if (!initPromise) return false;

  try {
    // タイムアウト付きで初期化の完了を待つ
    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => reject(new Error("モデル初期化のタイムアウト")), timeoutMs);
    });

    await Promise.race([initPromise, timeoutPromise]);
    return isInitialized;
  } catch (error) {
    console.error("初期化待機中にエラー:", error);
    return false;
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
    if (initPromise) {
      console.log("モデルの初期化がすでに実行中です。完了を待機します...");
      try {
        await initPromise;
        return;
      } catch (error) {
        console.error("初期化の待機中にエラー:", error);
        // 初期化に失敗した場合は再試行
      }
    } else {
      throw new Error("モデルの初期化がすでに実行中です。");
    }
  }

  if (isInitialized && llmEngine) {
    console.log("モデルはすでに初期化されています。");
    return;
  }

  isInitializing = true;
  isInitialized = false;
  loadingProgress = 0;

  // 初期化プロセスを追跡するPromiseを作成
  initPromise = (async () => {
    try {
      console.log("Wasm経由でモデルを初期化します...");

      // 指定されたモデルのみを使用
      const appConfig = {
        model_list: [
          {
            model: "https://huggingface.co/Atotti/TinySwallow-GRPO-TMethod-experimental-q4f32_1-MLC",
            model_id: modelName,
            model_lib: webllm.modelLibURLPrefix + webllm.modelVersion + "/Qwen2-1.5B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
          },
        ],
      };

      if (DEBUG) {
        console.log("モデル設定:", JSON.stringify(appConfig, null, 2));
      }

      const updateEngineInitProgressCallback: InitProgressCallback = (progress) => {
        // 進捗状況を0-100の範囲に変換
        if (progress.progress !== undefined) {
          // 進捗状況を0-100の範囲に変換（0.1刻みで更新）
          const newProgress = Math.round(progress.progress * 1000) / 10;

          // 進捗状況が変化した場合のみ更新
          if (newProgress !== loadingProgress) {
            loadingProgress = newProgress;
            console.log(`モデル初期化中 - 進捗: ${loadingProgress}%`);
          }
        }

        // 進捗状況に応じたメッセージ
        if (progress.text) {
          console.log(`初期化ステップ: ${progress.text}`);

          // 特定のステップでの進捗状況の更新
          if (progress.text.includes('Loading model')) {
            console.log('モデルファイルをダウンロード中...');
          } else if (progress.text.includes('Instantiating WebGPU')) {
            console.log('WebGPUを初期化中...');
          } else if (progress.text.includes('Loading weights')) {
            console.log('モデルの重みを読み込み中...');
          }
        }

        // 進捗状況が100%に近づいたら初期化完了とみなす
        if (progress.progress && progress.progress >= 0.99) {
          loadingProgress = 100;
          console.log("モデルの初期化がほぼ完了しました。");
        }
      };

      // エンジン作成＆モデル読み込み
      console.log("指定されたモデルの初期化を開始します...");
      llmEngine = await webllm.CreateMLCEngine(modelName, {
        appConfig: appConfig,
        initProgressCallback: updateEngineInitProgressCallback,
      });

      if (!llmEngine || !llmEngine.chat) {
        throw new Error("モデルの初期化に失敗しました。");
      }

      console.log("モデルの初期化が完了しました！");
      isInitialized = true;
    } catch (error: unknown) {
      console.error("モデルの初期化中にエラーが発生:", error);
      if (DEBUG) {
        console.log("エラーの詳細:", error instanceof Error ? error.message : String(error));
      }
      isInitialized = false;
      llmEngine = null;
      throw error;
    } finally {
      isInitializing = false;
    }
  })();

  // 初期化プロセスの完了を待つ
  try {
    await initPromise;
  } catch (error) {
    console.error("初期化プロセスでエラーが発生:", error);
    throw error;
  }
}

/**
 * 入力テキストを「高橋メソッド用フォーマット」に変換する
 */
export async function transformToTakahashiFormat(rawText: string): Promise<string> {
  // 初期化が完了していない場合は待機
  if (!isInitialized || !llmEngine) {
    if (isInitializing && initPromise) {
      console.log("モデルの初期化を待機中...");
      const initialized = await waitForInitialization();
      if (!initialized || !llmEngine) {
        throw new Error("モデルの初期化に失敗しました。ページを再読み込みしてください。");
      }
    } else {
      throw new Error("LLM engineが初期化されていません。initWebLLMを先に実行してください。");
    }
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
- スライドの枚数は多いほど良いです。
- スライドの内容は、直感的に理解できるようにシンプルにしてください。
- 装飾的な記号や句読点は極力避け、シンプルな言葉を使ってください。
- ユーザーが提示したテーマを元に、インパクトがあり直感的に伝わるスライド群を生成してください。
- 出力形式は "- スライドに表示したいテキスト" という形式で出力してください。
- "- "に続く文字は、スライドに表示されるテキストとして扱われます。表示させないテキストは出力しないでください。
`;

  const userPrompt = `【入力文章】
${rawText}

【出力】
入力文章を説明する高橋メソッドに基づくスライドを50個以上作成してください。
スライドは内容を網羅した大量のスライドにしてください。
`;

  try {
    const response = await llmEngine.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      top_p: 0.95,
      presence_penalty: 1.2,
      max_tokens: 4096,
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
