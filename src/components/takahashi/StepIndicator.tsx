"use client";

import {
  Box,
  Button,
  Divider,
  Paper,
  Typography
} from "@mui/material";

type StepType = 'input' | 'outline' | 'preview';

interface StepIndicatorProps {
  activeStep: StepType;
  setActiveStep: (step: StepType) => void;
  outlineHasContent: boolean;
  slidesExist: boolean;
}

export default function StepIndicator({
  activeStep,
  setActiveStep,
  outlineHasContent,
  slidesExist
}: StepIndicatorProps) {
  return (
    <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid var(--card-border)',
          backgroundColor: 'var(--card-bg)'
        }}
      >
        <Button
          onClick={() => setActiveStep('input')}
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: 0,
            backgroundColor: activeStep === 'input' ? 'primary.main' : 'transparent',
            color: activeStep === 'input' ? 'white' : 'text.primary',
            '&:hover': {
              backgroundColor: activeStep === 'input' ? 'primary.dark' : 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            1. テキスト入力
          </Typography>
        </Button>
        <Divider orientation="vertical" flexItem />
        <Button
          onClick={() => outlineHasContent ? setActiveStep('outline') : null}
          disabled={!outlineHasContent}
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: 0,
            backgroundColor: activeStep === 'outline' ? 'primary.main' : 'transparent',
            color: activeStep === 'outline' ? 'white' : 'text.primary',
            '&:hover': {
              backgroundColor: activeStep === 'outline' ? 'primary.dark' : 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            2. アウトライン編集
          </Typography>
        </Button>
        <Divider orientation="vertical" flexItem />
        <Button
          onClick={() => slidesExist ? setActiveStep('preview') : null}
          disabled={!slidesExist}
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: 0,
            backgroundColor: activeStep === 'preview' ? 'primary.main' : 'transparent',
            color: activeStep === 'preview' ? 'white' : 'text.primary',
            '&:hover': {
              backgroundColor: activeStep === 'preview' ? 'primary.dark' : 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            3. プレビュー
          </Typography>
        </Button>
      </Paper>
    </Box>
  );
}
