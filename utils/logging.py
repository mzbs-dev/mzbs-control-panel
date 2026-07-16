import logging
import os
from datetime import datetime, timedelta

LOG_DIR = "logs"
os.makedirs(LOG_DIR, exist_ok=True)

_log_filename = os.path.join(LOG_DIR, f"control_panel_{datetime.now():%Y%m%d}.log")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    handlers=[
        logging.FileHandler(_log_filename),
        logging.StreamHandler(),
    ],
)

logger = logging.getLogger("mzbs_control_panel")


def cleanup_old_logs(days: int = 14) -> None:
    """Delete log files older than `days` from LOG_DIR."""
    cutoff = datetime.now() - timedelta(days=days)
    for filename in os.listdir(LOG_DIR):
        path = os.path.join(LOG_DIR, filename)
        if not os.path.isfile(path):
            continue
        modified = datetime.fromtimestamp(os.path.getmtime(path))
        if modified < cutoff:
            try:
                os.remove(path)
                logger.info("Removed old log file: %s", filename)
            except OSError as exc:
                logger.warning("Could not remove log file %s: %s", filename, exc)
