FROM python:3.12-slim

WORKDIR /app

# 런타임에 필요한 최소 시스템 패키지만 설치합니다.
# curl은 healthcheck와 외부 API 점검에, libgomp1은 LightGBM 같은 ML 라이브러리에 필요합니다.
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libgomp1 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Amazon DocumentDB/RDS TLS 연결을 대비해 AWS CA 번들을 컨테이너 신뢰 저장소에 추가합니다.
RUN curl -fsSL https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem \
    -o /usr/local/share/ca-certificates/rds-global-bundle.crt \
    && update-ca-certificates

# requirements.txt를 먼저 복사하면 Docker layer cache가 의존성 설치 단계에 재사용됩니다.
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드, 정적 파일, 프롬프트 리소스를 이미지에 포함합니다.
COPY app/ ./app/
COPY public/ ./public/
COPY prompts/ ./prompts/

# 런타임 데이터 디렉터리입니다.
# docker-compose.yml에서 CSV 입력 디렉터리를 /app/data/csv로 읽기 전용 마운트합니다.
RUN mkdir -p data && chmod -R 777 data

EXPOSE 8000

ENV PYTHONUNBUFFERED=1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
