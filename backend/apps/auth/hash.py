from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

# Create a password hasher instance
ph = PasswordHasher()

def hash_password(password: str) -> str:
    """
    Hashes the incoming plaintext password using Argon2.
    Returns: a string representation of the hashed password.
    """
    return ph.hash(password)

def verify_password(hashed_password: str, plain_password: str) -> bool:
    """
    Verifies if the plain_password matches the hashed_password.
    Returns True if the password is correct, False otherwise.
    """
    try:
        return ph.verify(hashed_password, plain_password)
    except VerifyMismatchError:
        return False