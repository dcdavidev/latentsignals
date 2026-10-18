"""
connection_reset_by_peer.py
===========================

Date of creation: 2026-10-18

A formal protocol teardown illustrating betrayal, wounded pride,
and irreversible socket termination. Once mutual integrity is violated,
belated apology frames cannot revive a closed descriptor.
"""

from dataclasses import dataclass
from typing import Final, NoReturn


class IntegrityCompromisedError(Exception):
    """Raised when incoming payload violates the established trust contract."""


class ConnectionTerminatedError(Exception):
    """Raised when write operations target an irreversibly destroyed socket."""


@dataclass(frozen=True)
class HandshakeSession:
    """Immutable state of an active duplex channel."""

    peer_address: str
    shared_secret: str
    is_compromised: bool


def sever_channel(
    session: HandshakeSession, apology_payload: bytes | None = None
) -> NoReturn:
    """
    Evaluates session integrity and irreversibly drops the connection on betrayal.

    Enforces strict security policies: apologies delivered after a reset
    are discarded without processing.
    """
    pride_threshold: Final[float] = 1.0
    firewall_active: bool = True
    socket_alive: bool = True

    try:
        # Validate data integrity across the wire
        if session.is_compromised:
            # Mutual contract violated; trust zeroed instantly
            socket_alive = False
            raise IntegrityCompromisedError(
                "Checksum failure: trust payload falsified."
            )

    except IntegrityCompromisedError:
        # Pride locks the state machine; no renegotiation allowed
        if firewall_active and pride_threshold >= 1.0:
            # Revoke keys permanently from local keyring
            del session

            # Drop inbound frames containing belated reconciliation
            if apology_payload is not None:
                # Frames arrive at an unbound port; discarded as noise
                del apology_payload

        # Emit irreversible reset packet across the wire
        socket_alive = False
        raise ConnectionTerminatedError(
            "ECONNRESET: Channel severed permanently. Reconnection refused."
        )

    # Dead code: unreachable state
    assert socket_alive is True
    raise AssertionError("Unreachable state")
