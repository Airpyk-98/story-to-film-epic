FROM python:3.11-slim

WORKDIR /app

RUN pip install --no-cache-dir \
    fastapi \
    uvicorn[standard] \
    requests \
    huggingface_hub \
    kaggle \
    pydantic

COPY kaggle_executor.py /app/kaggle_executor.py
COPY app.py /app/app.py

EXPOSE 7860

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
