FROM jenkins/jenkins:lts-jdk17

USER root

# Jenkins Pipeline 내부에서 docker compose 명령을 실행할 수 있도록
# Docker 공식 APT 저장소를 등록한 뒤 Docker CLI와 Compose Plugin을 설치합니다.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        gnupg \
        lsb-release \
    && install -m 0755 -d /etc/apt/keyrings \
    && curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc \
    && chmod a+r /etc/apt/keyrings/docker.asc \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        docker-ce-cli \
        docker-compose-plugin \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Jenkins 최초 기동 시 필요한 운영 플러그인을 이미지 빌드 단계에서 미리 설치합니다.
# 런타임 다운로드 의존성을 줄여 재현성과 초기 기동 속도를 높입니다.
COPY jenkins/plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

USER jenkins
