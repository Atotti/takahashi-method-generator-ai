"use client";
import { useState, useEffect, KeyboardEvent } from "react";
import { Box, Button, Container, TextField, Typography, CircularProgress } from "@mui/material";

import { initWebLLM, transformToTakahashiFormat } from "../lib/llmClient";
import { parseTakahashiOutline, SlideData } from "../lib/parseTakahashi";

const MODEL_NAME = "TinySwallow-1.5B-Instruct";

export default function HomePage() {
  // State管理
  const [freeText, setFreeText] = useState("");
  const [outlineText, setOutlineText] = useState("- スライド1\n  - メモ1");
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runtime, setRuntime] = useState<'webgpu' | 'wasm' | null>(null);

  // WebLLM初期化
  useEffect(() => {
    if (typeof window === "undefined") return;

    async function initLLM() {
      try {
        setIsLoading(true);
        setError(null);

        // コンソールログを監視してランタイムを検出
        const originalConsoleLog = console.log;
        console.log = function(...args) {
          originalConsoleLog.apply(console, args);

          // ランタイムの検出
          if (args.length > 0 && typeof args[0] === 'string') {
            if (args[0].includes('実行環境: wasm')) {
              setRuntime('wasm');
              setError(null);
            } else if (args[0].includes('実行環境: webgpu')) {
              setRuntime('webgpu');
              setError(null);
            }
          }
        };

        await initWebLLM(MODEL_NAME);

        // コンソールログを元に戻す
        console.log = originalConsoleLog;
      } catch (err) {
        console.error("LLM初期化エラー:", err);
        const errorMessage = err instanceof Error ? err.message : "不明なエラーが発生しました";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    initLLM();
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
      const result = await transformToTakahashiFormat(text);
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
              backgroundColor: runtime === 'wasm' ? '#fff3e0' : '#e8f5e9',
              color: runtime === 'wasm' ? '#e65100' : '#1b5e20',
              px: 2,
              py: 0.5,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center'
            }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {runtime === 'wasm' ? 'WebAssembly Mode' : 'WebGPU Mode'}
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
              お使いの環境ではWebGPUが利用できないため、WebAssemblyモードで実行しています。
              処理速度は若干低下しますが、すべての機能をご利用いただけます。
            </Typography>
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
            startIcon={isLoading && <CircularProgress size={20} color="inherit" />}
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
          <Box sx={{ mb: 2, border: "1px solid gray", p: 2, position: "relative" }}>
            <Typography variant="h6">Step C: スライドビュー</Typography>

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
      </Container>
  );
}
