"""
VigiRail — User store.

Demo credentials live here as PBKDF2 hashes (never plaintext).  In production
this module is the seam where you swap in a real identity provider or database
table — everything else in the app depends only on the shapes below:

    UserRecord = {password_hash, role, full_name}

Regenerate a hash after changing a password::

    python -c "from app.core.security import hash_password; print(hash_password('new-password'))"
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class UserRecord:
    username: str
    password_hash: str
    role: str
    full_name: str


# Role vocabulary used across the API and UI.
ROLE_ADMIN = "Admin"
ROLE_ENGINEER = "Engineer"
ROLE_OPERATOR = "Operator"
ROLE_INSPECTOR = "Inspector"
ALL_ROLES = (ROLE_ADMIN, ROLE_ENGINEER, ROLE_OPERATOR, ROLE_INSPECTOR)

USERS: dict[str, UserRecord] = {
    "admin": UserRecord(
        username="admin",
        password_hash=(
            "pbkdf2_sha256$260000$ae5357490eb6dd50e4affffabf5c76a4$"
            "1667dafa73587acbd92c0baf47a970b7db96aa49f9883946571c4a675edaf3f2"
        ),
        role=ROLE_ADMIN,
        full_name="System Administrator",
    ),
    "engineer": UserRecord(
        username="engineer",
        password_hash=(
            "pbkdf2_sha256$260000$583c50fe32643601667b3c8dba26c37f$"
            "067618a3e933023bd0960db6d4ea6279464cf96b0b6dee63faf37ff093c78817"
        ),
        role=ROLE_ENGINEER,
        full_name="Rahul Sharma",
    ),
    "operator": UserRecord(
        username="operator",
        password_hash=(
            "pbkdf2_sha256$260000$6bef61f170f71cc985b795c8a82185e0$"
            "2844c126a41a91fc398f344bd8f2beeaac2ffb75263a300cc5dce43b4ea2c888"
        ),
        role=ROLE_OPERATOR,
        full_name="Priya Singh",
    ),
    "inspector": UserRecord(
        username="inspector",
        password_hash=(
            "pbkdf2_sha256$260000$3f525bed9ec8ce7e30f315be13c0c400$"
            "dd3c5e30af8174e56de719b4e7261e5f875976786abd1024a635a6cae4da439b"
        ),
        role=ROLE_INSPECTOR,
        full_name="Dr. Amit Kumar",
    ),
}

# Trains assigned to the Operator role (mirrors the UI's "assigned fleet").
OPERATOR_ASSIGNED_TRAINS = ("12951", "12002")


def get_user(username: str) -> UserRecord | None:
    return USERS.get(username)
