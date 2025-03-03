"use client";

import {
  AppBar,
  Box,
  Chip,
  Container,
  IconButton,
  Toolbar,
  Tooltip,
  Typography
} from "@mui/material";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import GitHubIcon from '@mui/icons-material/GitHub';

interface HeaderProps {
  runtime: 'wasm' | null;
}

export default function Header({ runtime }: HeaderProps) {
  return (
    <AppBar
      position="static"
      elevation={0}
      color="transparent"
      sx={{
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              高橋メソッド × WebLLM Demo
            </Typography>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: { xs: 'block', sm: 'none' }
              }}
            >
              高橋メソッド
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', ml: 2 }}>
              <Chip
                label="WebGPU"
                size="small"
                sx={{
                  backgroundColor: 'rgba(37, 99, 235, 0.1)',
                  color: 'primary.main',
                  fontSize: '0.75rem',
                  height: '24px'
                }}
              />
              <Chip
                label="WebAssembly"
                size="small"
                sx={{
                  backgroundColor: 'rgba(37, 99, 235, 0.1)',
                  color: 'primary.main',
                  fontSize: '0.75rem',
                  height: '24px'
                }}
              />
              <Chip
                label="GRPO"
                size="small"
                sx={{
                  backgroundColor: 'rgba(37, 99, 235, 0.1)',
                  color: 'primary.main',
                  fontSize: '0.75rem',
                  height: '24px'
                }}
              />
              <Chip
                label="SLM"
                size="small"
                sx={{
                  backgroundColor: 'rgba(37, 99, 235, 0.1)',
                  color: 'primary.main',
                  fontSize: '0.75rem',
                  height: '24px'
                }}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {runtime && (
              <Chip
                label="WebAssembly Mode"
                color="secondary"
                size="small"
                icon={<AutoAwesomeIcon fontSize="small" />}
                sx={{ fontWeight: 600 }}
              />
            )}
            <Tooltip title="GitHub">
              <IconButton
                color="primary"
                component="a"
                href="https://github.com/Atotti/ai-slide-generator"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHubIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
