---
title: Story To Film Cloud Relay
emoji: 🎬
colorFrom: indigo
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# Story to Film - Epic Automate Cloud Relay

Provides CORS-enabled endpoints for the **Story to Film** Firebase Web App:
- `POST /api/nvidia/models` — Loads all available AI models from `https://integrate.api.nvidia.com/v1/models` using the user's NVIDIA API key.
- `POST /api/hf/ensure-dataset` — Automatically creates the user's Hugging Face Dataset repository if it does not exist.
- `POST /api/hf/upload-reference` — Uploads `@tag` reference images to the user's Hugging Face Dataset and returns direct URLs for Kie.ai & Kaggle.
- `POST /api/kaggle/launch` — Pushes the Story to Film T4 GPU worker kernel directly to the user's own Kaggle account.
