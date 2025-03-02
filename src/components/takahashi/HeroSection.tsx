"use client";

import {
  Box,
  Chip,
  Typography
} from "@mui/material";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export default function HeroSection() {
  return (
    <Box
      sx={{
        textAlign: 'center',
        mb: 6,
        mt: 4,
        animation: 'fadeIn 0.8s ease-out'
      }}
    >
      <Typography
        variant="h2"
        component="h1"
        className="gradient-text"
        sx={{
          fontWeight: 900,
          mb: 2,
          fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
        }}
      >
        高橋メソッド ジェネレーター
      </Typography>
      <Typography
        variant="h6"
        color="text.secondary"
        sx={{
          maxWidth: '800px',
          mx: 'auto',
          mb: 3,
          fontSize: { xs: '1rem', md: '1.25rem' }
        }}
      >
        AIを活用して、あなたのテキストを<span className="accent-gradient-text" style={{ fontWeight: 700 }}>インパクトのある高橋メソッド形式</span>のプレゼンテーションに変換します
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Chip
          icon={<AutoAwesomeIcon fontSize="small" />}
          label="WebLLM搭載"
          color="primary"
          sx={{ fontWeight: 600 }}
        />
        <Chip
          label="ブラウザ内で完結"
          sx={{ fontWeight: 600, backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'primary.main' }}
        />
        <Chip
          label="データ送信なし"
          sx={{ fontWeight: 600, backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'primary.main' }}
        />
      </Box>
    </Box>
  );
}
