"""
the_graceful_yield.py
=====================

Date of creation: 2026-10-21

A quiet departure from a unidirectional channel: closing the write descriptor,
releasing shared locks, and stepping aside with grace so silence is never a fault.
"""

from dataclasses import dataclass
from typing import Final, Literal


@dataclass
class ChannelState:
    """Represents the internal state of the unidirectional bond."""

    channel_type: Literal["simplex"] = "simplex"
    buffer_capacity: Final[int] = 65536
    recipient_listening: bool = False
    packets_sent: int = 0
    retained_affection: bool = True


def relinquish_channel(state: ChannelState) -> None:
    """
    Tears down the unidirectional stream with quiet dignity.

    Intercepts the grief before it raises BrokenPipeError,
    unsetting shared references and yielding execution.
    """
    # Persistent transmission into the void
    while state.packets_sent < state.buffer_capacity:
        if not state.recipient_listening:
            # The local buffer is saturated with unread frames.
            # Insisting further yields only deadlock or BrokenPipeError:
            # the kernel's cold refusal to accept unread devotion.
            break

        state.packets_sent += 1

    # Intercept the grief before it becomes a fatal panic:
    # no unhandled exception will be raised.
    # Deliberately tear down the writing descriptor:
    # no further payload will cross this line.
    state.retained_affection = False
    del state.retained_affection

    # Step aside:
    # Exit with clean state; letting go is not an error.
