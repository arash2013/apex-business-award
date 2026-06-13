import os

__version__ = "0.1.0"

# Injected at build time via Docker ARG / Railway env var
GIT_SHA = os.getenv("GIT_SHA", "dev")
