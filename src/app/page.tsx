"use client";
import { useState, useEffect, KeyboardEvent } from "react";
import { Box, Button, Container, TextField, Typography, CircularProgress, IconButton, LinearProgress } from "@mui/material";
import PresentationMode from "../components/PresentationMode";

import { initWebLLM, transformToTakahashiFormat, getInitializationStatus, waitForInitialization } from "../lib/llmClient";
import { parseTakahashiOutline, SlideData } from "../lib/parseTakahashi";

const MODEL_NAME = "TinySwallow-GRPO-TMethod-experimental";

export default function HomePage() {
  // State管理
  const [freeText, setFreeText] = useState("");
  const [outlineText, setOutlineText] = useState("- スライド1\n  - メモ1");
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runtime, setRuntime] = useState<'wasm' | null>(null);

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
      setIsLoading(true);
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
        try {
          await initWebLLM(MODEL_NAME);

          // 再度状態を確認
          const newStatus = getInitializationStatus();
          if (!newStatus.isInitialized) {
            throw new Error("モデルが初期化されていません。ページを再読み込みしてください。");
          }
          console.log("モデルの初期化が完了しました。変換を開始します。");
        } catch (initErr) {
          console.error("モデル再初期化エラー:", initErr);
          throw new Error("モデルの初期化に失敗しました。ページを再読み込みしてください。");
        }
      }

      console.log("テキスト変換を開始します...");
      const result = await transformToTakahashiFormat(text);
      console.log("テキスト変換が完了しました。");
      setOutlineText(result);
    } catch (err) {
      console.error("変換エラー:", err);
      setError(err instanceof Error ? err.message : "変換処理でエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }

  // アウトラインをパースしてスライド生成
  function handleGenerateSlides() {
    const parsed = parseTakahashiOutline(outlineText);
    setSlides(parsed);
    setCurrentIndex(0);
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

  const currentSlide = slides[currentIndex] || null;

  return (
    <Container maxWidth="md" sx={{ py: 4 }} onKeyDown={handleKeyDown} tabIndex={0}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h4">
            高橋メソッド × WebLLM Demo
          </Typography>
          {runtime && (
            <Box sx={{
              backgroundColor: '#fff3e0',
              color: '#e65100',
              px: 2,
              py: 0.5,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center'
            }}>
              <Typography variant="subtitle1" fontWeight="bold">
                WebAssembly Mode (WebGPU)
              </Typography>
            </Box>
          )}
        </Box>

        {/* ランタイムモードの説明 */}
        {runtime === 'wasm' && (
          <Box sx={{ mb: 2, p: 2, backgroundColor: "#fff3e0", borderRadius: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              WebAssembly モード情報
            </Typography>
            <Typography variant="body2">
              WebAssembly経由でWebGPUを使用しています。
              すべての機能をご利用いただけます。
            </Typography>
          </Box>
        )}
        {/* モデル初期化中の大きなローディング表示 */}
        {isLoading && !error && (
          <Box sx={{ mb: 4, p: 4, backgroundColor: "#e3f2fd", borderRadius: 2, textAlign: "center" }}>
            <CircularProgress size={80} thickness={5} sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              モデルを初期化しています
            </Typography>

            {/* 進捗状況バー */}
            <Box sx={{ width: '100%', mt: 2, mb: 2 }}>
              <Box sx={{ position: 'relative', display: 'inline-flex', width: '100%' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    right: 0,
                    top: -5,
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}
                >
                  {`${Math.round(progress)}%`}
                </Box>
              </Box>
            </Box>

            <Typography variant="body1" color="text.secondary">
              初回の読み込みには時間がかかります。しばらくお待ちください...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              (初期化中でもテキストの入力は可能です)
            </Typography>

            {/* コンソールログ表示 */}
            <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1, textAlign: 'left', maxHeight: '150px', overflow: 'auto' }}>
              <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                {`モデル初期化中 - 進捗: ${progress}%`}
              </Typography>
            </Box>
          </Box>
        )}

        {/* エラーメッセージ */}
        {error && (
          <Box sx={{ mb: 2, p: 2, backgroundColor: "#ffebee", borderRadius: 1 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" color="error" gutterBottom>
                  エラーが発生しました
                </Typography>
                <Typography color="error.dark" sx={{ whiteSpace: "pre-line" }}>
                  {error}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => window.location.reload()}
              >
                ページを再読み込み
              </Button>
            </Box>
          </Box>
        )}

        {/* 1) 雑多な文章入力 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">Step A: フリーテキスト入力</Typography>
          <TextField
            label="フリーテキストを入力"
            placeholder="変換したい文章を入力してください"
            multiline
            minRows={4}
            fullWidth
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            disabled={isLoading}
            sx={{ mb: 1 }}
          />
          <Button
            variant="contained"
            onClick={handleTransform}
            disabled={isLoading || !freeText.trim()}
            startIcon={isLoading && <CircularProgress size={24} color="inherit" />}
            sx={{ py: 1.5, px: 3, fontSize: '1rem' }}
          >
            {isLoading ? "変換中..." : "LLMで高橋メソッド用に変換"}
          </Button>
        </Box>

        {/* 2) アウトライン編集 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">Step B: アウトライン(高橋メソッド形式)</Typography>
          <TextField
            label="アウトライン ( - スライド文 /   - メモ )"
            placeholder="- スライドのタイトル\n  - 補足メモ（任意）"
            multiline
            minRows={6}
            fullWidth
            value={outlineText}
            onChange={(e) => setOutlineText(e.target.value)}
            disabled={isLoading}
            error={!outlineText.includes('-')}
            helperText={!outlineText.includes('-') ? "高橋メソッド形式で入力してください" : ""}
            sx={{ mb: 1 }}
          />
          <Button
            variant="contained"
            onClick={handleGenerateSlides}
            disabled={isLoading || !outlineText.trim() || !outlineText.includes('-')}
          >
            スライドを生成
          </Button>
        </Box>

        {/* 3) スライド表示 */}
        {slides.length > 0 && (
          <>
            {isPresentationMode ? (
              <PresentationMode
                slides={slides}
                currentIndex={currentIndex}
                onNext={handleNextSlide}
                onPrev={handlePrevSlide}
                onExit={() => setIsPresentationMode(false)}
              />
            ) : (
              <Box sx={{ mb: 2, border: "1px solid gray", p: 2, position: "relative" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography variant="h6">Step C: スライドビュー</Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setIsPresentationMode(true)}
                  >
                    プレゼンテーションモード
                  </Button>
                </Box>

                {currentSlide && (
                  <Box
                    sx={{
                      mt: 1,
                      minHeight: 200,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "black",
                      color: "white",
                      fontSize: "2rem",
                      textAlign: "center",
                      p: 2,
                    }}
                  >
                    {currentSlide.text}
                  </Box>
                )}
                <Box sx={{ textAlign: "center", mt: 1 }}>
                  <Button onClick={handlePrevSlide} disabled={currentIndex <= 0}>
                    Prev
                  </Button>
                  <Button onClick={handleNextSlide} disabled={currentIndex >= slides.length - 1}>
                    Next
                  </Button>
                  <Typography variant="body2">
                    {currentIndex + 1}/{slides.length}
                  </Typography>
                </Box>
              </Box>
            )}
          </>
        )}
      </Container>
  );
}
