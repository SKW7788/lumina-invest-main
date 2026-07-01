"""증권사 Open API 추상 베이스."""
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any


@dataclass
class TokenInfo:
    """증권사 API 인증 토큰과 만료 시각을 담는 공통 DTO입니다."""
    access_token: str
    expires_in: int  # seconds
    token_type: str = "Bearer"


@dataclass
class PriceInfo:
    """종목 현재가 조회 결과를 표준화한 DTO입니다."""
    symbol: str
    name: str
    current: float
    open: float
    high: float
    low: float
    volume: int
    change: float
    change_pct: float


@dataclass
class BalanceItem:
    """계좌 잔고에 포함된 개별 종목 보유 정보를 표현합니다."""
    symbol: str
    name: str
    quantity: int
    avg_price: float
    current_price: float
    eval_amount: float
    gain_loss: float
    gain_pct: float


@dataclass
class AccountBalance:
    """현금과 보유 종목 목록을 포함한 계좌 잔고 응답 DTO입니다."""
    total_eval: float
    total_buy: float
    total_gain: float
    holdings: list[BalanceItem]
    cash: float = 0.0  # 예수금 (주문 가능 현금)


class BrokerClient(ABC):
    """모든 증권사 클라이언트가 구현해야 하는 공통 인터페이스입니다."""
    """모든 증권사 클라이언트의 공통 인터페이스."""

    @abstractmethod
    async def get_token(self) -> TokenInfo: ...

    @abstractmethod
    async def get_price(self, symbol: str) -> PriceInfo: ...

    @abstractmethod
    async def get_balance(self, account_no: str) -> AccountBalance: ...

    @abstractmethod
    async def place_order(
        self, account_no: str, symbol: str, side: str, quantity: int, price: float
    ) -> dict[str, Any]: ...

    @abstractmethod
    async def get_daily_ohlcv(
        self, symbol: str, start: str, end: str
    ) -> list[dict]: ...
