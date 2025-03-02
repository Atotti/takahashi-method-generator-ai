"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  TextField,
  Typography
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface OutlineEditStepProps {
  outlineText: string;
  setOutlineText: (text: string) => void;
  isLoading: boolean;
  onGenerateSlides: () => void;
  onBack: () => void;
}

export default function OutlineEditStep({
  outlineText,
  setOutlineText,
  isLoading,
  onGenerateSlides,
  onBack
}: OutlineEditStepProps) {
  return (
    <Card className="glass-card animate-fade-in" sx={{ mb: 4 }}>
      <CardContent sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Chip
            label="STEP 2"
            color="primary"
            size="small"
            sx={{ mr: 2, fontWeight: 600 }}
          />
          <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
            アウトライン編集
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          生成されたアウトラインを確認・編集できます。各行が1つのスライドになります。
        </Typography>

        <TextField
          label="アウトライン ( - スライド文 )"
          placeholder="- スライドのタイトル\n  - 補足メモ（任意）"
          multiline
          minRows={8}
          fullWidth
          value={outlineText}
          onChange={(e) => setOutlineText(e.target.value)}
          disabled={isLoading}
          error={!outlineText.includes('-')}
          helperText={!outlineText.includes('-') ? "高橋メソッド形式で入力してください" : ""}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              fontFamily: 'monospace'
            }
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={onBack}
            startIcon={<ArrowBackIcon />}
            sx={{ px: 3 }}
          >
            戻る
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={onGenerateSlides}
            disabled={isLoading || !outlineText.trim() || !outlineText.includes('-')}
            endIcon={<ArrowForwardIcon />}
            sx={{
              px: 4,
              background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
            }}
          >
            スライドを生成
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
