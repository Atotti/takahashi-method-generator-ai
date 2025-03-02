"use client";

import { useEffect, useCallback, useState, useRef } from 'react';
import { Box, LinearProgress } from '@mui/material';
import { SlideData } from '../lib/parseTakahashi';

interface PresentationModeProps {
  slides: SlideData[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onExit: () => void;
}

export default function PresentationMode({
  slides,
  currentIndex,
  onNext,
  onPrev,
  onExit
}: PresentationModeProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState('15vw');
  const textContainerRef = useRef<HTMLDivElement>(null);

  // フォントサイズの動的調整
  useEffect(() => {
    const calculateOptimalFontSize = () => {
      const container = textContainerRef.current;
      if (!container) return;

      const text = slides[currentIndex]?.text || '';

      // コンテナの高さと幅を取得
      const containerHeight = container.clientHeight;
      const containerWidth = container.clientWidth;

      // 一時的なテスト要素を作成して実際の表示サイズをチェック
      const testElement = document.createElement('div');
      testElement.style.position = 'absolute';
      testElement.style.visibility = 'hidden';
      testElement.style.width = `${containerWidth}px`;
      testElement.style.whiteSpace = 'pre-wrap';
      testElement.style.wordBreak = 'normal';
      testElement.style.textAlign = 'center';
      testElement.textContent = text;
      document.body.appendChild(testElement);

      // 二分探索で最適なサイズを見つける
      let min = 10;  // 最小フォントサイズ（vw）
      let max = 40;  // 最大フォントサイズ（vw）
      let optimal = min;

      while (min <= max) {
        const mid = Math.floor((min + max) / 2);
        const vwToPx = (mid * window.innerWidth) / 100;
        testElement.style.fontSize = `${vwToPx}px`;

        if (testElement.offsetHeight <= containerHeight * 0.9 &&
            testElement.offsetWidth <= containerWidth * 0.9) {
          optimal = mid;
          min = mid + 1;
        } else {
          max = mid - 1;
        }
      }

      document.body.removeChild(testElement);
      setFontSize(`${optimal}vw`);
    };

    calculateOptimalFontSize();

    const resizeObserver = new ResizeObserver(calculateOptimalFontSize);
    if (textContainerRef.current) {
      resizeObserver.observe(textContainerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [currentIndex, slides]);

  // フルスクリーン状態の監視
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement) {
        onExit();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [onExit]);

  // キーボードイベントの処理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        onNext();
      } else if (e.key === 'ArrowLeft') {
        onPrev();
      } else if (e.key === 'Escape') {
        // ESCキーはブラウザが自動的にフルスクリーンを終了するため、
        // ここでは特別な処理は不要
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onNext, onPrev]);

  // マウスクリックの処理
  const handleClick = useCallback((e: React.MouseEvent) => {
    const { clientX, currentTarget } = e;
    const { width } = currentTarget.getBoundingClientRect();
    const isRightHalf = clientX > width / 2;

    if (isRightHalf) {
      onNext();
    } else {
      onPrev();
    }
  }, [onNext, onPrev]);

  // フルスクリーン開始
  useEffect(() => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    }
  }, []);

  const progress = ((currentIndex + 1) / slides.length) * 100;

  return (
    <Box
      onClick={handleClick}
      sx={{
        width: '100vw',
        height: '100vh',
        backgroundColor: 'black',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        cursor: 'none',
        overflow: 'hidden',
      }}
    >
      <Box
        ref={textContainerRef}
        sx={{
          fontWeight: 'bold',
          textAlign: 'center',
          width: '90%',
          height: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          wordBreak: 'normal',
          whiteSpace: 'pre-wrap',
          userSelect: 'none',
          fontSize: fontSize,
          transition: 'font-size 0.2s ease',
        }}
      >
        {slides[currentIndex]?.text}
      </Box>

      {/* プログレスバー */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          opacity: 0.3,
        }}
      >
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: 'white',
            },
            height: 2,
          }}
        />
      </Box>
    </Box>
  );
}
