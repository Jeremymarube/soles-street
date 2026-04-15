import os

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address


def get_rate_limit_storage_uri():
    return os.getenv("RATE_LIMIT_STORAGE_URI", "memory://").strip() or "memory://"


limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per hour"],
    storage_uri=get_rate_limit_storage_uri(),
)
