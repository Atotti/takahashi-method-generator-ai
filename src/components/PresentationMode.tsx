"use client";

import { useEffect, useCallback, useState } from 'react';
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
        sx={{
          fontSize: '15vw',
          fontWeight: 'bold',
          textAlign: 'center',
          width: '90%',
          wordBreak: 'break-word',
          userSelect: 'none',
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
