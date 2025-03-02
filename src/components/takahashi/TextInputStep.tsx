"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  TextField,
  Typography
} from "@mui/material";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

interface TextInputStepProps {
  freeText: string;
  setFreeText: (text: string) => void;
  isLoading: boolean;
  onTransform: () => void;
}

export default function TextInputStep({
  freeText,
  setFreeText,
  isLoading,
  onTransform
}: TextInputStepProps) {
  return (
    <Card className="glass-card animate-fade-in" sx={{ mb: 4 }}>
      <CardContent sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Chip
            label="STEP 1"
            color="primary"
            size="small"
            sx={{ mr: 2, fontWeight: 600 }}
          />
          <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
            テキスト入力
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          変換したいテキストを入力してください。長文でも短文でも、AIが高橋メソッド形式に最適化します。
        </Typography>

        <TextField
          label="フリーテキストを入力"
          placeholder="変換したい文章を入力してください"
          multiline
          minRows={6}
          fullWidth
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          disabled={isLoading}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
            }
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={onTransform}
            disabled={isLoading || !freeText.trim()}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
            sx={{
              py: 1.5,
              px: 4,
              fontSize: '1rem',
              background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
              boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
              '&:hover': {
                boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {isLoading ? "変換中..." : "高橋メソッド形式に変換"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
