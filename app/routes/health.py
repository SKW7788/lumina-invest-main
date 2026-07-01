"""컨테이너와 로드밸런서에서 사용하는 애플리케이션 헬스체크 라우터."""

from fastapi import APIRouter

# Docker healthcheck와 Jenkins Pipeline이 호출하는 가장 가벼운 상태 확인 엔드포인트입니다.
router = APIRouter(prefix="/api")


@router.get("/health")
async def health():
    return {"status": "ok", "service": "금융 AI Agent"}
