import uuid
from datetime import date
from decimal import Decimal
import pytest
from app.modules.payout.service import Payout


def test_payout_model_instantiation_and_calculations():
    payout_id = uuid.uuid4()
    recipient_id = uuid.uuid4()
    start = date(2026, 9, 1)
    end = date(2026, 9, 30)

    gross = Decimal("50000.00")
    commission = Decimal("5000.00")
    net = gross - commission

    payout = Payout(
        id=payout_id,
        recipient_id=recipient_id,
        period_start=start,
        period_end=end,
        gross_amount=gross,
        commission_amount=commission,
        net_amount=net,
        status="pending",
        paid_at=None,
    )

    assert payout.id == payout_id
    assert payout.recipient_id == recipient_id
    assert payout.period_start == start
    assert payout.period_end == end
    assert payout.gross_amount == Decimal("50000.00")
    assert payout.commission_amount == Decimal("5000.00")
    assert payout.net_amount == Decimal("45000.00")
    assert payout.gross_amount - payout.commission_amount == payout.net_amount
    assert payout.status == "pending"
    assert payout.paid_at is None


def test_payout_status_transition_to_paid():
    payout_id = uuid.uuid4()
    recipient_id = uuid.uuid4()
    paid_date = date(2026, 10, 1)

    payout = Payout(
        id=payout_id,
        recipient_id=recipient_id,
        period_start=date(2026, 9, 1),
        period_end=date(2026, 9, 30),
        gross_amount=Decimal("12000.00"),
        commission_amount=Decimal("1200.00"),
        net_amount=Decimal("10800.00"),
        status="paid",
        paid_at=paid_date,
    )

    assert payout.status == "paid"
    assert payout.paid_at == paid_date
