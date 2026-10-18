"""
not_your_penelope.py
====================

Date of creation: 2026-10-17

Models unilateral devotion, deterministic deadlines, and resource reclamation over infinite waiting.
"""

import asyncio
from dataclasses import dataclass
from enum import Enum
from typing import Literal, Optional


class PeerLocation(str, Enum):
    CIRCE_ISLAND = "CirceIsland"
    ITHACA = "Ithaca"


@dataclass
class DistantPeer:
    """Represents the remote state and location of the distant peer."""

    location: PeerLocation
    is_unidirectional: bool


@dataclass
class WebOfTime:
    """State of the fabric woven during process execution."""

    owner: Literal["self", "absent_peer"] = "self"
    threads_count: int = 0
    is_unraveled_at_night: bool = False


class TerminalResolution(str, Enum):
    """Resulting status of the boundary assertion."""

    RECLAIMED = "RECLAIMED"
    DISCONNECTED = "DISCONNECTED"


async def assert_reciprocity(
    peer: DistantPeer,
    deadline_ms: float,
    return_signal: Optional[asyncio.Event] = None,
) -> TerminalResolution:
    """
    Executes the boundary protocol between self-preservation and waiting.

    :param peer: The target peer currently engaged elsewhere.
    :param deadline_ms: Maximum duration permitted before permanent socket closure.
    :param return_signal: Optional synchronization signal for mutual presence.
    :return: Final state of the local process.
    """
    fabric = WebOfTime(
        owner="self",
        threads_count=0,
        is_unraveled_at_night=False,
    )

    loop = asyncio.get_running_loop()
    deadline_seconds = deadline_ms / 1000.0
    end_time = loop.time() + deadline_seconds

    while True:
        remaining = end_time - loop.time()
        if remaining <= 0:
            # Stop waiting, retain woven threads for self, close channel
            fabric.owner = "self"
            fabric.is_unraveled_at_night = False
            return TerminalResolution.RECLAIMED

        if return_signal and return_signal.is_set():
            if (
                peer.location == PeerLocation.ITHACA
                and not peer.is_unidirectional
            ):
                return TerminalResolution.DISCONNECTED

        # Weave thread strictly into local state
        fabric.threads_count += 1
        await asyncio.sleep(min(0.01, max(0.0, remaining)))
