"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Typography
} from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';

interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <Card
      sx={{ mb: 4, overflow: "hidden", borderLeft: '4px solid #ef4444' }}
      className="animate-fade-in"
    >
      <CardContent sx={{ p: 3, backgroundColor: "rgba(239, 68, 68, 0.05)" }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ color: "#b91c1c", fontWeight: 600 }} gutterBottom>
              エラーが発生しました
            </Typography>
            <Typography sx={{ color: "#ef4444", whiteSpace: "pre-line" }}>
              {message}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
            sx={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
          >
            再読み込み
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
