"use client";

import {
  Box,
  Divider,
  Typography
} from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        pt: 4,
        pb: 2,
        textAlign: 'center',
        opacity: 0.8
      }}
    >
      <Divider sx={{ mb: 3 }} />
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} 高橋メソッド ジェネレーター | WebLLM技術で実現するブラウザ内AI変換
      </Typography>
    </Box>
  );
}
