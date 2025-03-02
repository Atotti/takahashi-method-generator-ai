"use client";
import { useState, useEffect, type KeyboardEvent } from "react";
import { Container, useMediaQuery, useTheme } from "@mui/material";
import PresentationMode from "../components/PresentationMode";

import {
  Header,
  StepIndicator,
  LoadingOverlay,
  TransformingOverlay,
  ErrorMessage,
  TextInputStep,
  OutlineEditStep,
  PreviewStep,
  Footer,
  HeroSection
} from "../components/takahashi";

import { initWebLLM, transformToTakahashiFormat, getInitializationStatus, waitForInitialization } from "../lib/llmClient";
import { parseTakahashiOutline, SlideData } from "../lib/parseTakahashi";

const MODEL_NAME = "TinySwallow-GRPO-TMethod-experimental";

export default function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State管理
  const [freeText, setFreeText] = useState("");
  const [outlineText, setOutlineText] = useState("- スライド1\n  - メモ1");
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false); // テキスト変換中の状態
  const [error, setError] = useState<string | null>(null);
  const [runtime, setRuntime] = useState<'wasm' | null>(null);
  const [activeStep, setActiveStep] = useState<'input' | 'outline' | 'preview'>('input');
  const [streamingContent, setStreamingContent] = useState<string>(""); // ストリーミング中のコンテンツ

  // 進捗状況の状態
  const [progress, setProgress] = useState(0);

  // WebLLM初期化
  useEffect(() => {
    if (typeof window === "undefined") return;

    let isMounted = true;
    let progressInterval: NodeJS.Timeout;

    async function initLLM() {
      try {
        setIsLoading(true);
        setError(null);

        // 進捗状況を定期的に更新
        progressInterval = setInterval(() => {
          if (isMounted) {
            const status = getInitializationStatus();
            setProgress(status.progress);

            // 初期化が完了したら更新を停止
            if (status.isInitialized) {
              clearInterval(progressInterval);
            }
          }
        }, 100);

        // モデル初期化（非同期で実行）
        await initWebLLM(MODEL_NAME);

        // 初期化状態を確認
        const status = getInitializationStatus();
        if (isMounted) {
          if (status.isInitialized) {
            setError(null);
            setIsLoading(false);
            setProgress(100);
          } else {
            setError("モデルの初期化に失敗しました。ページを再読み込みしてください。");
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error("LLM初期化エラー:", err);
        const errorMessage = err instanceof Error ? err.message : "不明なエラーが発生しました";
        if (isMounted) {
          setError(errorMessage);
          setIsLoading(false);
        }
      }
    }

    initLLM();

    // クリーンアップ関数
    return () => {
      isMounted = false;
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, []);

  // LLM変換ボタン
  async function handleTransform() {
    const text = freeText.trim();
    if (!text) {
      setError("テキストを入力してください");
      return;
    }

    try {
      // モデル初期化中かテキスト変換中かを区別
      setIsTransforming(true);
      setError(null);

      // 初期化状態を確認
      const status = getInitializationStatus();
      if (!status.isInitialized && status.isInitializing) {
        // 初期化中の場合は完了を待機
        setError("モデルの初期化中です。しばらくお待ちください...");

        // 初期化完了を待機（最大30秒）
        const initialized = await waitForInitialization(30000);
        if (!initialized) {
          throw new Error("モデルの初期化がタイムアウトしました。ページを再読み込みしてください。");
        }

        setError(null);
      } else if (!status.isInitialized) {
        // 再初期化を試みる
        console.log("モデルが初期化されていません。初期化を試みます...");
        setIsLoading(true); // モデル初期化中
        setIsTransforming(false);

        try {
          await initWebLLM(MODEL_NAME);

          // 再度状態を確認
          const newStatus = getInitializationStatus();
          if (!newStatus.isInitialized) {
            throw new Error("モデルが初期化されていません。ページを再読み込みしてください。");
          }
          console.log("モデルの初期化が完了しました。変換を開始します。");
          setIsLoading(false);
          setIsTransforming(true); // 変換に戻る
        } catch (initErr) {
          console.error("モデル再初期化エラー:", initErr);
          throw new Error("モデルの初期化に失敗しました。ページを再読み込みしてください。");
        }
      }

      console.log("テキスト変換を開始します...");
      // ストリーミングコンテンツを更新するコールバック関数
      const onProgress = (content: string) => {
        setStreamingContent(content);
      };

      const result = await transformToTakahashiFormat(text, onProgress);
      console.log("テキスト変換が完了しました。");
      setOutlineText(result);
      setActiveStep('outline');
      setStreamingContent(""); // リセット
    } catch (err) {
      console.error("変換エラー:", err);
      setError(err instanceof Error ? err.message : "変換処理でエラーが発生しました");
    } finally {
      setIsLoading(false);
      setIsTransforming(false);
    }
  }

  // アウトラインをパースしてスライド生成
  function handleGenerateSlides() {
    const parsed = parseTakahashiOutline(outlineText);
    setSlides(parsed);
    setCurrentIndex(0);
    setActiveStep('preview');
  }

  // スライド操作
  function handleNextSlide() {
    setCurrentIndex((prev) => Math.min(prev + 1, slides.length - 1));
  }

  function handlePrevSlide() {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }

  // キーボードで左右操作したい場合
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight") {
      handleNextSlide();
    } else if (e.key === "ArrowLeft") {
      handlePrevSlide();
    }
  }

  return (
    <>
      <Header runtime={runtime} />

      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 2, md: 4 },
          px: { xs: 2, md: 4 },
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column'
        }}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <HeroSection />

        <StepIndicator
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          outlineHasContent={outlineText.includes('-')}
          slidesExist={slides.length > 0}
        />

        {/* モデル初期化中の大きなローディング表示 */}
        {isLoading && !error && !isTransforming && (
          <LoadingOverlay progress={progress} />
        )}

        {/* テキスト変換中のローディング表示 */}
        {isTransforming && !error && (
          <TransformingOverlay streamingContent={streamingContent} />
        )}

        {/* エラーメッセージ */}
        {error && (
          <ErrorMessage message={error} />
        )}

        {/* コンテンツエリア */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* 1) テキスト入力ステップ */}
          {activeStep === 'input' && (
            <TextInputStep
              freeText={freeText}
              setFreeText={setFreeText}
              isLoading={isLoading || isTransforming}
              onTransform={handleTransform}
            />
          )}

          {/* 2) アウトライン編集ステップ */}
          {activeStep === 'outline' && (
            <OutlineEditStep
              outlineText={outlineText}
              setOutlineText={setOutlineText}
              isLoading={isLoading}
              onGenerateSlides={handleGenerateSlides}
              onBack={() => setActiveStep('input')}
            />
          )}

          {/* 3) プレビューステップ */}
          {activeStep === 'preview' && slides.length > 0 && (
            <PreviewStep
              slides={slides}
              currentIndex={currentIndex}
              onNext={handleNextSlide}
              onPrev={handlePrevSlide}
              onStartPresentation={() => setIsPresentationMode(true)}
              onBackToOutline={() => setActiveStep('outline')}
              onNewText={() => setActiveStep('input')}
            />
          )}
        </div>

        <Footer />
      </Container>

      {/* プレゼンテーションモード */}
      {isPresentationMode && (
        <PresentationMode
          slides={slides}
          currentIndex={currentIndex}
          onNext={handleNextSlide}
          onPrev={handlePrevSlide}
          onExit={() => setIsPresentationMode(false)}
        />
      )}
    </>
  );
}
