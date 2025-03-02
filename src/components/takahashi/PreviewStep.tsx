"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Typography
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RefreshIcon from '@mui/icons-material/Refresh';
import PresentationIcon from '@mui/icons-material/Slideshow';
import { SlideData } from "../../lib/parseTakahashi";

interface PreviewStepProps {
  slides: SlideData[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onStartPresentation: () => void;
  onBackToOutline: () => void;
  onNewText: () => void;
}

export default function PreviewStep({
  slides,
  currentIndex,
  onNext,
  onPrev,
  onStartPresentation,
  onBackToOutline,
  onNewText
}: PreviewStepProps) {
  const currentSlide = slides[currentIndex] || null;

  return (
    <Card className="glass-card animate-fade-in" sx={{ mb: 4 }}>
      <CardContent sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Chip
            label="STEP 3"
            color="primary"
            size="small"
            sx={{ mr: 2, fontWeight: 600 }}
          />
          <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
            プレビュー
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          生成されたスライドをプレビューできます。プレゼンテーションモードで全画面表示も可能です。
        </Typography>

        <Box sx={{ mb: 3, position: "relative" }}>
          <Box
            sx={{
              minHeight: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "black",
              color: "white",
              fontSize: { xs: "1.5rem", sm: "2rem", md: "3rem" },
              fontWeight: 700,
              textAlign: "center",
              p: 4,
              borderRadius: 2,
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
            }}
          >
            {currentSlide?.text}
          </Box>

          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            mt: 3,
            flexWrap: 'wrap'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={onPrev}
                disabled={currentIndex <= 0}
                startIcon={<ArrowBackIcon />}
                sx={{ minWidth: '120px' }}
              >
                前へ
              </Button>

              <Typography variant="body2" sx={{
                px: 2,
                py: 1,
                borderRadius: 2,
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fontWeight: 600
              }}>
                {currentIndex + 1}/{slides.length}
              </Typography>

              <Button
                variant="outlined"
                onClick={onNext}
                disabled={currentIndex >= slides.length - 1}
                endIcon={<ArrowForwardIcon />}
                sx={{ minWidth: '120px' }}
              >
                次へ
              </Button>
            </Box>

            <Button
              variant="contained"
              color="secondary"
              onClick={onStartPresentation}
              startIcon={<PresentationIcon />}
              sx={{
                ml: { xs: 0, sm: 2 },
                background: 'linear-gradient(90deg, #fb923c, #ea580c)',
              }}
            >
              プレゼンテーションモード
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={onBackToOutline}
            startIcon={<ArrowBackIcon />}
          >
            アウトラインに戻る
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={onNewText}
            startIcon={<RefreshIcon />}
            sx={{
              background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
            }}
          >
            新しいテキストで作成
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
