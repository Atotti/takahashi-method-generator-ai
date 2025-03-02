"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  TextField,
  Typography,
  Paper
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useEffect, useState } from "react";
import { parseReasoningAndAnswer } from "@/lib/parseTakahashi";

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
  const [reasoning, setReasoning] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");

  // outlineTextが変更されたときに<reasoning>と<answer>タグを分離
  useEffect(() => {
    const { reasoning, answer } = parseReasoningAndAnswer(outlineText);
    setReasoning(reasoning);
    setAnswer(answer);
  }, [outlineText]);

  // answerが変更されたときにoutlineTextを更新
  const handleAnswerChange = (newAnswer: string) => {
    // reasoningがある場合は<reasoning>タグを保持し、answerのみを更新
    if (reasoning) {
      setOutlineText(`<reasoning>\n${reasoning}\n</reasoning>\n<answer>\n${newAnswer}\n</answer>`);
    } else {
      // reasoningがない場合はanswerのみを設定
      setOutlineText(newAnswer);
    }
  };

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

        {/* 推論プロセス表示エリア */}
        {reasoning && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3,
              backgroundColor: 'rgba(0, 0, 0, 0.03)',
              color: 'text.secondary',
              fontSize: '0.9rem',
              maxHeight: '200px',
              overflow: 'auto'
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              推論プロセス:
            </Typography>
            <Typography
              variant="body2"
              component="pre"
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                lineHeight: 1.5
              }}
            >
              {reasoning}
            </Typography>
          </Paper>
        )}

        {/* アウトライン編集エリア（answerのみ） */}
        <TextField
          label="アウトライン ( - スライド文 )"
          placeholder="- スライドのタイトル\n  - 補足メモ（任意）"
          multiline
          minRows={8}
          fullWidth
          value={answer}
          onChange={(e) => handleAnswerChange(e.target.value)}
          disabled={isLoading}
          error={!answer.includes('-')}
          helperText={!answer.includes('-') ? "高橋メソッド形式で入力してください" : ""}
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
            disabled={isLoading || !answer.trim() || !answer.includes('-')}
            endIcon={<ArrowForwardIcon />}
            sx={{
              px: 4,
              background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)'
            }}
          >
            スライドを生成
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
