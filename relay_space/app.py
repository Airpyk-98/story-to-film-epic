#!/usr/bin/env python3
"""
Story to Film - Epic Automate Cloud Relay & Multi-User Kaggle Dispatcher
========================================================================
Provides CORS-enabled endpoints for the Firebase Web App:
  1. POST /api/nvidia/models       -> Fetches all available AI models from NVIDIA NIM using user's key
  2. POST /api/kie/credits         -> Fetches real-time Kie.ai credit balance (`GET /api/v1/chat/credit`)
  3. POST /api/hf/ensure-dataset   -> Auto-creates `<hf_username>/<dataset_name>` on user's HF account
  4. POST /api/hf/upload-reference -> Uploads `@tag` reference image to user's HF dataset & returns URL
  5. POST /api/kaggle/launch       -> Pushes T4 GPU kernel (`NvidiaTeslaT4`) to user's own Kaggle account
"""

import io
import os
import re
import json
import time
import base64
import shutil
import tempfile
import subprocess
import urllib.parse
from typing import List, Optional, Dict, Any

import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from huggingface_hub import HfApi

app = FastAPI(title="Story to Film Cloud Relay", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

EXECUTOR_TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), "kaggle_executor.py")


class NvidiaModelsRequest(BaseModel):
    nvidia_api_key: str


class KieCreditsRequest(BaseModel):
    kie_api_key: str


class HfDatasetRequest(BaseModel):
    hf_username: str
    hf_token: str
    dataset_name: Optional[str] = "story-to-film-assets"


class HfUploadRefRequest(BaseModel):
    hf_username: str
    hf_token: str
    dataset_name: Optional[str] = "story-to-film-assets"
    tag: str
    filename: str
    file_base64: str


class KaggleLaunchRequest(BaseModel):
    job_id: str
    firebase_project_id: Optional[str] = "story-to-film-epic-98"
    kaggle_username: str
    kaggle_key: str
    nvidia_api_key: str
    nvidia_model: str
    kie_api_key: str
    hf_username: str
    hf_token: str
    hf_dataset_name: Optional[str] = "story-to-film-assets"
    story: str
    reference_tags: List[Dict[str, Any]] = []
    image_model: Optional[str] = "nano-banana-2-lite"
    image_resolution: Optional[str] = "1K"
    video_model: Optional[str] = "grok-imagine/image-to-video"
    aspect_ratio: Optional[str] = "16:9"
    scene_duration: Optional[int] = 6
    video_quality: Optional[str] = "720p"
    video_mode: Optional[str] = "normal"
    retry_scenes_only: Optional[bool] = False
    existing_scenes: Optional[List[Dict[str, Any]]] = []


@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "Story to Film Cloud Relay",
        "version": "1.1.0",
        "endpoints": [
            "/api/nvidia/models",
            "/api/kie/credits",
            "/api/hf/ensure-dataset",
            "/api/hf/upload-reference",
            "/api/kaggle/launch",
        ],
    }


@app.post("/api/nvidia/models")
def get_nvidia_models(req: NvidiaModelsRequest):
    api_key = (req.nvidia_api_key or "").strip()
    if not api_key:
        raise HTTPException(status_code=400, detail="NVIDIA API key is required.")

    try:
        resp = requests.get(
            "https://integrate.api.nvidia.com/v1/models",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Accept": "application/json",
            },
            timeout=15,
        )
        if resp.status_code != 200:
            raise HTTPException(
                status_code=resp.status_code,
                detail=f"NVIDIA API returned {resp.status_code}: {resp.text[:250]}",
            )

        data = resp.json().get("data", [])
        excluded_keywords = ("embed", "rerank", "guard", "parse", "deplot", "kosmos", "paligemma", "clip")
        models = []
        for item in data:
            mid = item.get("id", "")
            if mid and not any(k in mid.lower() for k in excluded_keywords):
                models.append(mid)

        models.sort()
        return {"status": "ok", "count": len(models), "models": models}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to query NVIDIA models: {e}")


@app.post("/api/kie/credits")
def get_kie_credits(req: KieCreditsRequest):
    api_key = (req.kie_api_key or "").strip()
    if not api_key:
        raise HTTPException(status_code=400, detail="Kie.ai API key is required.")

    try:
        resp = requests.get(
            "https://api.kie.ai/api/v1/chat/credit",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Accept": "application/json",
            },
            timeout=15,
        )
        data = resp.json() if resp.content else {}
        if resp.status_code != 200 or data.get("code") not in (200, None):
            msg = data.get("msg") or resp.text[:200] or f"HTTP {resp.status_code}"
            raise HTTPException(status_code=400, detail=f"Kie.ai Credit Check Error: {msg}")

        credits_val = data.get("data")
        return {
            "status": "ok",
            "credits": credits_val,
            "raw": data,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check Kie.ai balance: {e}")


@app.post("/api/hf/ensure-dataset")
def ensure_hf_dataset(req: HfDatasetRequest):
    hf_user = (req.hf_username or "").strip()
    hf_token = (req.hf_token or "").strip()
    ds_name = (req.dataset_name or "story-to-film-assets").strip().strip("/")

    if not hf_token:
        raise HTTPException(status_code=400, detail="Hugging Face token is required.")

    try:
        api = HfApi(token=hf_token)
        if not hf_user:
            who = api.whoami()
            hf_user = who.get("name", "")
        repo_id = ds_name if "/" in ds_name else f"{hf_user}/{ds_name}"
        api.create_repo(repo_id=repo_id, repo_type="dataset", private=False, exist_ok=True)
        return {
            "status": "ok",
            "repo_id": repo_id,
            "dataset_url": f"https://huggingface.co/datasets/{repo_id}",
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Hugging Face dataset creation failed: {e}")


@app.post("/api/hf/upload-reference")
def upload_reference_image(req: HfUploadRefRequest):
    hf_user = (req.hf_username or "").strip()
    hf_token = (req.hf_token or "").strip()
    ds_name = (req.dataset_name or "story-to-film-assets").strip().strip("/")
    clean_tag = re.sub(r"[^a-zA-Z0-9_-]", "", (req.tag or "ref").strip()) or "ref"

    if not hf_token:
        raise HTTPException(status_code=400, detail="Hugging Face Write token is required to upload reference images.")

    try:
        api = HfApi(token=hf_token)
        if not hf_user:
            who = api.whoami()
            hf_user = who.get("name", "")
        repo_id = ds_name if "/" in ds_name else f"{hf_user}/{ds_name}"
        api.create_repo(repo_id=repo_id, repo_type="dataset", private=False, exist_ok=True)

        b64_data = req.file_base64 or ""
        if "," in b64_data:
            b64_data = b64_data.split(",", 1)[1]
        raw_bytes = base64.b64decode(b64_data)

        ext = os.path.splitext(req.filename or "image.png")[1].lower()
        if ext not in (".png", ".jpg", ".jpeg", ".webp"):
            ext = ".png"

        remote_path = f"references/{clean_tag}_{int(time.time() * 1000)}{ext}"
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp_f:
            tmp_f.write(raw_bytes)
            tmp_file_path = tmp_f.name

        try:
            api.upload_file(
                path_or_fileobj=tmp_file_path,
                path_in_repo=remote_path,
                repo_id=repo_id,
                repo_type="dataset",
            )
        finally:
            try:
                os.remove(tmp_file_path)
            except Exception:
                pass
        quoted_remote = "/".join(urllib.parse.quote(part) for part in remote_path.split("/"))
        resolve_url = f"https://huggingface.co/datasets/{repo_id}/resolve/main/{quoted_remote}"
        return {
            "status": "ok",
            "tag": clean_tag,
            "repo_id": repo_id,
            "url": resolve_url,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to upload reference image to HF Dataset: {e}")


@app.post("/api/kaggle/launch")
def launch_kaggle_worker(req: KaggleLaunchRequest):
    kg_user = (req.kaggle_username or "").strip()
    kg_key = (req.kaggle_key or "").strip()
    if not kg_user or not kg_key:
        raise HTTPException(status_code=400, detail="Kaggle Username and API Token are required.")

    if not os.path.exists(EXECUTOR_TEMPLATE_PATH):
        raise HTTPException(status_code=500, detail="kaggle_executor.py template missing on relay.")

    temp_dir = tempfile.mkdtemp(prefix=f"stf_{req.job_id}_")
    kaggle_cfg_dir = tempfile.mkdtemp(prefix=f"kgcfg_{req.job_id}_")
    try:
        with open(EXECUTOR_TEMPLATE_PATH, "r", encoding="utf-8") as f:
            script_code = f.read()

        job_config = req.model_dump() if hasattr(req, "model_dump") else req.dict()
        escaped_json = json.dumps(job_config, ensure_ascii=True)
        script_code = script_code.replace(
            '"__JOB_CONFIG_JSON_PLACEHOLDER__"',
            repr(escaped_json),
        )
        # Ensure pure ASCII in script_code so Windows cp1252 open() inside Kaggle CLI never fails
        script_code_ascii = script_code.encode("ascii", "backslashreplace").decode("ascii")

        worker_py_path = os.path.join(temp_dir, "kaggle_executor.py")
        with open(worker_py_path, "w", encoding="utf-8") as f:
            f.write(script_code_ascii)

        kernel_slug = "story-to-film-worker"
        kernel_meta = {
            "id": f"{kg_user}/{kernel_slug}",
            "title": "Story to Film Worker",
            "code_file": "kaggle_executor.py",
            "language": "python",
            "kernel_type": "script",
            "is_private": "true",
            "enable_gpu": "true",
            "enable_tpu": "false",
            "machine_shape": "NvidiaTeslaT4",
            "enable_internet": "true",
            "dataset_sources": [],
            "competition_sources": [],
            "kernel_sources": [],
            "model_sources": [],
        }

        meta_path = os.path.join(temp_dir, "kernel-metadata.json")
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(kernel_meta, f, indent=2)

        # Write isolated kaggle.json in kaggle_cfg_dir so stale ~/.kaggle/access_token never conflicts
        kj_path = os.path.join(kaggle_cfg_dir, "kaggle.json")
        with open(kj_path, "w", encoding="utf-8") as f:
            json.dump({"username": kg_user, "key": kg_key}, f)

        if kg_key.startswith("KGAT_"):
            tok_path = os.path.join(kaggle_cfg_dir, "access_token")
            with open(tok_path, "w", encoding="utf-8") as f:
                f.write(kg_key)

        env = os.environ.copy()
        env["PYTHONUTF8"] = "1"
        env["PYTHONIOENCODING"] = "utf-8"
        env["KAGGLE_CONFIG_DIR"] = kaggle_cfg_dir
        env["KAGGLE_USERNAME"] = kg_user
        env["KAGGLE_KEY"] = kg_key
        if kg_key.startswith("KGAT_"):
            env["KAGGLE_API_TOKEN"] = kg_key

        cmd = ["kaggle", "kernels", "push", "-p", temp_dir]
        res = subprocess.run(cmd, env=env, capture_output=True, text=True, timeout=60)
        output_str = ((res.stdout or "") + "\n" + (res.stderr or "")).strip()

        if res.returncode != 0 or "error" in output_str.lower() and "successfully pushed" not in output_str.lower():
            raise HTTPException(
                status_code=400,
                detail=f"Kaggle Kernel Push Failed: {output_str[:400]}",
            )

        return {
            "status": "ok",
            "kernel_id": f"{kg_user}/{kernel_slug}",
            "kernel_url": f"https://www.kaggle.com/code/{kg_user}/{kernel_slug}",
            "cli_output": output_str,
        }
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)
        shutil.rmtree(kaggle_cfg_dir, ignore_errors=True)
