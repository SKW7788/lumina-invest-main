pipeline {
    agent any

    // 파이프라인 운영 안정성을 위한 공통 옵션입니다.
    options {
        ansiColor('xterm')
        buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '10'))
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }

    // GitHub Webhook push 이벤트가 들어오면 파이프라인을 실행합니다.
    triggers {
        githubPush()
    }

    // Docker BuildKit과 Compose 빌드 캐시를 사용합니다.
    environment {
        COMPOSE_DOCKER_CLI_BUILD = '1'
        COMPOSE_PROJECT_NAME = 'lumina-invest-main'
        DOCKER_BUILDKIT = '1'
    }

    stages {
        stage('Checkout') {
            steps {
                // Jenkins에 설정된 SCM 정보를 기준으로 소스 코드를 가져옵니다.
                checkout scm
            }
        }

        stage('docker compose config') {
            steps {
                // 앱 Compose 파일의 문법과 병합 결과를 검증합니다.
                sh 'docker compose -f docker-compose.yml config --quiet'
            }
        }

        stage('Docker Compose Down') {
            steps {
                sh '''
                    docker compose -f docker-compose.yml down --remove-orphans || true
                '''
            }
        }

        stage('docker compose build') {
            steps {
                // 최신 베이스 이미지를 확인하면서 앱 이미지를 빌드합니다.
                sh 'docker compose -f docker-compose.yml build --pull'
            }
        }

        stage('docker compose up -d') {
            steps {
                // 앱 스택을 백그라운드로 배포합니다.
                sh 'docker compose -f docker-compose.yml up -d'
            }
        }

        stage('Health Check') {
            steps {
                // 앱 컨테이너가 정상 응답할 때까지 최대 150초 동안 재시도합니다.
                sh '''
                    for i in $(seq 1 30); do
                        if curl -fsS http://fin-ai-app:8000/api/health; then
                            exit 0
                        fi
                        sleep 5
                    done
                    exit 1
                '''
            }
        }
    }

    post {
        success {
            // 성공 결과를 Jenkins 콘솔에 남깁니다.
            echo 'Lumina AI Investment Platform deployment succeeded.'
        }
        failure {
            // 실패 결과를 Jenkins 콘솔에 남깁니다.
            echo 'Lumina AI Investment Platform deployment failed.'
        }
        always {
            // 빌드가 끝난 뒤 워크스페이스를 정리해 디스크 사용량을 줄입니다.
            cleanWs(deleteDirs: true, disableDeferredWipeout: true)
        }
    }
}
