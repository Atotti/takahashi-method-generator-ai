"use client";

import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  Typography
} from "@mui/material";

interface LoadingOverlayProps {
  progress: number;
}

export default function LoadingOverlay({ progress }: LoadingOverlayProps) {
  return (
    <Card
      className="glass-card animate-fade-in"
      sx={{ mb: 4, p: 4, textAlign: "center", overflow: "hidden" }}
    >
      <CardContent sx={{ p: 4 }}>
        <CircularProgress size={80} thickness={5} sx={{ mb: 2 }} />
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
          モデルを初期化しています
        </Typography>

        {/* 進捗状況バー */}
        <Box sx={{ width: '100%', mt: 3, mb: 3 }}>
          <Box sx={{ position: 'relative', display: 'inline-flex', width: '100%' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: 'rgba(37, 99, 235, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)'
                  }
                }}
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

        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          初回の読み込みには時間がかかります。しばらくお待ちください...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          (初期化中でもテキストの入力は可能です)
        </Typography>

        {/* コンソールログ表示 */}
        <Box sx={{
          mt: 3,
          p: 2,
          backgroundColor: 'rgba(0, 0, 0, 0.03)',
          borderRadius: 2,
          textAlign: 'left',
          maxHeight: '150px',
          overflow: 'auto',
          border: '1px solid rgba(0, 0, 0, 0.05)'
        }}>
          <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
            {`モデル初期化中 - 進捗: ${progress}%`}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
