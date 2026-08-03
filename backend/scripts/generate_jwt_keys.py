import base64

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa


def encode(value: bytes) -> str:
    return base64.b64encode(value).decode("ascii")


def main() -> None:
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=3072)
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    public_pem = private_key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )

    print(f"JWT_ACCESS_PRIVATE_KEY_B64={encode(private_pem)}")
    print(f"JWT_ACCESS_PUBLIC_KEY_B64={encode(public_pem)}")


if __name__ == "__main__":
    main()
