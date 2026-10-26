# Story to Film — Autonomous AI Cinema Studio (`epic-automate`)

Turn a written story or script into a consistent, stitched multi-scene film on **Kaggle T4 GPU** using **NVIDIA NIM** (scene planning & safety engineering) and **Kie.ai** (`NanoBanana 2 Lite` for `@tag` reference-consistent scene frames + `Grok Imagine`, `Seedance 2.5/2.0`, `Wan 3.0`, `Kling 3.0` for video generation).

## Live Deployment
- **Web App (Firebase Hosting)**: `https://story-to-film-epic-98.web.app`
- **Firebase Project**: `story-to-film-epic-98`
- **Default Hugging Face Dataset**: `https://huggingface.co/datasets/pearlyoscar/story-to-film-assets`

## Key Capabilities
1. **Multi-User Google Sign-In & Isolated Credentials**:
   - Users sign in with Google (`Firebase Authentication`) and store their private API keys in `/users/{uid}/settings/credentials`.
   - Videos, story drafts, and job history are strictly isolated to each user.
2. **Real-Time Kie.ai Credit Balance & Dynamic Model Cost Estimator**:
   - Click **Check Balance** in the Settings tab (or header bar) to query `GET https://api.kie.ai/api/v1/chat/credit` using your personal Kie.ai API key.
   - Selecting any Image Model, Video Model, Resolution (`1K`/`2K`/`4K`, `360p`/`480p`/`720p`/`1080p`), or Scene Duration (`4s`/`6s`/`8s`/`10s`/`12s`) dynamically updates both the available presets and the live per-scene & full-film credit cost breakdown.
3. **NVIDIA NIM Dynamic Catalog & Kaggle Inference**:
   - Enter your NVIDIA API Key (`nvapi-...`) in Settings and click **Load All NVIDIA Models** to fetch all available models from `https://integrate.api.nvidia.com/v1/models` and save your preferred planner model.
   - Scene planning inference executes directly on the Kaggle T4 worker with a dual-layer **Anti-Flagging Safety Guardrail** so zero prompts get rejected by image/video moderation.
4. **Zero-Pause 4-Stage Pipeline on Kaggle T4**:
   - Stage 1: Story-to-scene breakdown with `@tag` binding on Kaggle via NVIDIA NIM.
   - Stage 2: Reference-consistent starting frame generation on Kie.ai (`nano-banana-2-lite` default).
   - Stage 3: Sequential scene video animation on Kie.ai (`grok-imagine/image-to-video` default) with automatic numbered browser downloads (`1.Scene 1 - Title.mp4`).
   - Stage 4: Coherent full-film normalization & stitching with FFmpeg on Kaggle T4, uploaded to the user's auto-created Hugging Face Dataset with an embedded HTML5 Video Player.
