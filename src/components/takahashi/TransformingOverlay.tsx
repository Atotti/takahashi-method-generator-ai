"use client";

import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography
} from "@mui/material";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export default function TransformingOverlay() {
  return (
    <Card
      className="glass-card animate-fade-in"
      sx={{ mb: 4, p: 4, textAlign: "center", overflow: "hidden" }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
          <CircularProgress
            size={60}
            thickness={4}
            sx={{
              color: 'secondary.main',
              mr: 2
            }}
          />
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
              テキストを変換中
            </Typography>
            <Typography variant="body1" color="text.secondary">
              AIが高橋メソッド形式に最適化しています...
            </Typography>
          </Box>
        </Box>

        {/* アニメーション付きのアイコン */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mt: 4,
          gap: 2
        }}>
          <Box sx={{
            p: 2,
            borderRadius: '50%',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            animation: 'pulse 2s infinite'
          }}>
            <AutoAwesomeIcon
              sx={{
                fontSize: 40,
                color: 'secondary.main'
              }}
            />
          </Box>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 4,
            fontStyle: 'italic'
          }}
        >
          テキストの長さや複雑さによって処理時間が変わります
        </Typography>
      </CardContent>
    </Card>
  );
}
