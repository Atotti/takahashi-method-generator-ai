"use client";
import { useState, useEffect, KeyboardEvent } from "react";
import { Box, Button, Container, TextField, Typography } from "@mui/material";

import { initWebLLM, transformToTakahashiFormat } from "../lib/llmClient";
import { parseTakahashiOutline, SlideData } from "../lib/parseTakahashi";

export default function HomePage() {
  // 雑に書かれたテキスト
  const [freeText, setFreeText] = useState("");
  // 高橋メソッド用フォーマットのテキスト
  const [outlineText, setOutlineText] = useState("- スライド1\n  - メモ1");
  // パース結果のスライド一覧
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // WebLLM初期化（クライアントサイドのみ）
  useEffect(() => {
    // SSR避け:
    if (typeof window !== "undefined") {
      initWebLLM("Llama-2-7b-chat-q4f32_1")
        .catch((err) => console.error("LLM init failed:", err));
    }
  }, []);

  // LLM変換ボタン
  async function handleTransform() {
    if (!freeText.trim()) {
      alert("フリーテキストが空です");
      return;
    }
    try {
      const result = await transformToTakahashiFormat(freeText.trim());
      setOutlineText(result);
    } catch (err) {
      console.error(err);
      alert("LLM変換に失敗しました");
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
        <Typography variant="h4" gutterBottom>
          高橋メソッド × WebLLM Demo
        </Typography>

        {/* 1) 雑多な文章入力 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">Step A: フリーテキスト入力</Typography>
          <TextField
            label="雑なアウトライン/文章"
            multiline
            minRows={4}
            fullWidth
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            sx={{ mb: 1 }}
          />
          <Button variant="contained" onClick={handleTransform}>
            LLMで高橋メソッド用に変換
          </Button>
        </Box>

        {/* 2) アウトライン編集 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">Step B: アウトライン(高橋メソッド形式)</Typography>
          <TextField
            label="アウトライン ( - スライド文 /   - メモ )"
            multiline
            minRows={6}
            fullWidth
            value={outlineText}
            onChange={(e) => setOutlineText(e.target.value)}
            sx={{ mb: 1 }}
          />
          <Button variant="contained" onClick={handleGenerateSlides}>
            スライド生成
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
