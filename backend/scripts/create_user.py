from __future__ import annotations

import argparse
import asyncio
import getpass
import os

from sqlalchemy import or_, select

from app.core.security import hash_password
from app.db.session import AsyncSessionFactory
from app.models.user import User

VALID_ROLES = ("ADMIN", "TECHNICIAN", "VIEWER")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Create an internal KAI RAMS user.")
    parser.add_argument("--username", required=True)
    parser.add_argument("--name", required=True)
    parser.add_argument("--email")
    parser.add_argument("--role", choices=VALID_ROLES, default="TECHNICIAN")
    parser.add_argument(
        "--password-env",
        help="Read the password from this environment variable instead of prompting.",
    )
    return parser.parse_args()


async def create_user(args: argparse.Namespace) -> None:
    username = args.username.strip().lower()
    email = args.email.strip().lower() if args.email else None
    name = args.name.strip()

    password = (
        os.environ.get(args.password_env, "")
        if args.password_env
        else getpass.getpass()
    )
    if len(password) < 12:
        raise SystemExit("Password minimal 12 karakter.")

    checks = [User.username == username]
    if email:
        checks.append(User.email == email)

    async with AsyncSessionFactory() as session:
        existing = await session.scalar(select(User).where(or_(*checks)))
        if existing:
            raise SystemExit("Username atau email sudah terdaftar.")

        user = User(
            username=username,
            email=email,
            name=name,
            password_hash=hash_password(password),
            role=args.role,
            is_active=True,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)

    print(f"Akun {user.username} berhasil dibuat dengan ID {user.id}.")


if __name__ == "__main__":
    asyncio.run(create_user(parse_args()))
