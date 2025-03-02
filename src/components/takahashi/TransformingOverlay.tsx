"use client";

import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  Paper
} from "@mui/material";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { parseReasoningAndAnswer } from "@/lib/parseTakahashi";
import { useEffect, useState } from "react";

interface TransformingOverlayProps {
  streamingContent?: string;
}

export default function TransformingOverlay({ streamingContent }: TransformingOverlayProps) {
  const [parsedContent, setParsedContent] = useState<{ reasoning: string; answer: string }>({
    reasoning: "",
    answer: ""
  });

  useEffect(() => {
    if (streamingContent) {
      const parsed = parseReasoningAndAnswer(streamingContent);
      setParsedContent(parsed);
    }
  }, [streamingContent]);

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

        {/* ストリーミングコンテンツの表示 */}
        {streamingContent && (
          <Box sx={{ mt: 4, textAlign: 'left' }}>
            {parsedContent.reasoning && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 2,
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
                  {parsedContent.reasoning}
                </Typography>
              </Paper>
            )}

            {parsedContent.answer && (
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  backgroundColor: 'background.paper',
                  maxHeight: '3000px',
                  overflow: 'auto'
                }}
              >
                <Typography
                  variant="body2"
                  component="pre"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    lineHeight: 1.5
                  }}
                >
                  {parsedContent.answer}
                </Typography>
              </Paper>
            )}
          </Box>
        )}

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
