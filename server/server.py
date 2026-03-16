#!/usr/bin/env python3
"""
KPI Analysis Tool — Mode B Server
Real-time log monitoring, WebSocket broadcast, threshold alerting.

Usage:
    pip install websockets
    python3 server.py [--config config.json]

Browser:
    http://server-ip:3000/?ws=ws://server-ip:8765
"""

import asyncio
import json
import logging
import os
import re
import smtplib
import subprocess
import sys
import time
from datetime import datetime
from email.mime.text import MIMEText
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from threading import Thread

try:
    import websockets
except ImportError:
    print("ERROR: 'websockets' library not found. Run: pip install websockets")
    sys.exit(1)

logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(levelname)s %(message)s", datefmt="%Y-%m-%d %H:%M:%S")
log = logging.getLogger("kpi-server")

# ── Config ────────────────────────────────────────────────────────────────────

DEFAULT_CONFIG = {
    "http_port": 3000,
    "websocket_port": 8765,
    "parser": {"mode": "logPipe", "pattern": ""},
    "log_sources": {"local": [], "remote": []},
    "poll_interval_seconds": 10,
    "remote_sync_interval_seconds": 60,
    "thresholds": {},
    "alerts": {
        "email": {"enabled": False, "smtp_host": "", "smtp_port": 587, "username": "", "password": "", "recipients": []},
        "log_file": "./alerts.log"
    }
}


def load_config(path="config.json"):
    cfg = dict(DEFAULT_CONFIG)
    try:
        with open(path) as f:
            user_cfg = json.load(f)
        # Deep merge top-level keys
        for k, v in user_cfg.items():
            if isinstance(v, dict) and isinstance(cfg.get(k), dict):
                cfg[k] = {**cfg[k], **v}
            else:
                cfg[k] = v
        log.info(f"Config loaded from '{path}'")
    except FileNotFoundError:
        log.warning(f"Config file '{path}' not found — using defaults.")
    except json.JSONDecodeError as e:
        log.error(f"Config parse error: {e} — using defaults.")
    return cfg


# ── Log Parsing ───────────────────────────────────────────────────────────────

MONTHS = {"jan":"01","feb":"02","mar":"03","apr":"04","may":"05","jun":"06",
          "jul":"07","aug":"08","sep":"09","oct":"10","nov":"11","dec":"12"}
DAY_PAT = re.compile(r'\b(mon|tue|wed|thu|fri|sat|sun)\b', re.IGNORECASE)


def parse_log_line(line, config):
    """Parse one log line into {timestamp, tokens} or None."""
    line = re.sub(r'[^\x20-\x7E]', '', line).strip()
    if not line:
        return None
    pattern = config["parser"].get("pattern", "")
    if pattern and pattern not in line:
        return None

    mode = config["parser"].get("mode", "logPipe")

    if mode == "logPipe":
        parts = line.split("|")
        if len(parts) < 5:
            return None
        timestamp = f"{parts[0].strip()}|{parts[1].strip()}"
        tokens = {}
        kv = parts[4].split(",")
        for i in range(0, len(kv) - 1, 2):
            k = kv[i].strip()
            try:
                v = float(kv[i + 1])
            except (ValueError, IndexError):
                v = 0.0
            if k:
                tokens[k] = v
        return {"timestamp": timestamp, "tokens": tokens} if tokens else None

    elif mode == "flatCsv":
        parts = line.split(",")
        if len(parts) < 3:
            return None
        timestamp = f"{parts[0].strip()},{parts[1].strip()}"
        tokens = {}
        for i in range(2, len(parts)):
            try:
                v = float(parts[i])
            except ValueError:
                v = 0.0
            tokens[f"Col_{i}"] = v
        return {"timestamp": timestamp, "tokens": tokens}

    return None


# ── Threshold Checking ────────────────────────────────────────────────────────

def check_thresholds(row, thresholds):
    """Return list of breach dicts for metrics exceeding configured thresholds."""
    breaches = []
    for metric, thresh in thresholds.items():
        val = row["tokens"].get(metric)
        if val is None:
            continue
        if "critical" in thresh and val >= thresh["critical"]:
            breaches.append({"severity": "critical", "metric": metric, "value": val,
                             "threshold": thresh["critical"], "timestamp": row["timestamp"]})
        elif "warn" in thresh and val >= thresh["warn"]:
            breaches.append({"severity": "warn", "metric": metric, "value": val,
                             "threshold": thresh["warn"], "timestamp": row["timestamp"]})
    return breaches


# ── Alerting ──────────────────────────────────────────────────────────────────

def write_alert_log(breach, log_path):
    """Append breach to alerts.log for backtracing."""
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    severity = breach["severity"].upper().ljust(8)
    line = (f"[{ts}] {severity} | Metric: {breach['metric']} | "
            f"Value: {breach['value']} | Threshold: {breach['threshold']} | "
            f"At: {breach['timestamp']}\n")
    try:
        with open(log_path, "a") as f:
            f.write(line)
    except OSError as e:
        log.error(f"Alert log write failed: {e}")


def send_email_alert(breach, email_cfg):
    """Send threshold breach alert via SMTP."""
    if not email_cfg.get("enabled"):
        return
    if not email_cfg.get("recipients"):
        return
    subject = f"[KPI ALERT] {breach['severity'].upper()} — {breach['metric']}"
    body = (f"Threshold breach detected.\n\n"
            f"Severity  : {breach['severity'].upper()}\n"
            f"Metric    : {breach['metric']}\n"
            f"Value     : {breach['value']}\n"
            f"Threshold : {breach['threshold']}\n"
            f"Timestamp : {breach['timestamp']}\n\n"
            f"-- KPI Analysis Tool Server")
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = email_cfg["username"]
    msg["To"] = ", ".join(email_cfg["recipients"])
    try:
        with smtplib.SMTP(email_cfg["smtp_host"], email_cfg["smtp_port"], timeout=10) as s:
            s.starttls()
            s.login(email_cfg["username"], email_cfg["password"])
            s.sendmail(email_cfg["username"], email_cfg["recipients"], msg.as_string())
        log.info(f"Email alert sent for metric '{breach['metric']}'")
    except Exception as e:
        log.error(f"Email send failed: {e}")


# ── File Watching ─────────────────────────────────────────────────────────────

async def tail_local_file(path, pos, config, clients, alert_cfg, thresholds):
    """Read new lines from a local file since last position. Returns new position."""
    try:
        stat = os.stat(path)
        if stat.st_size <= pos:
            return pos  # No new data or file was rotated (size shrank — reset below)
        if stat.st_size < pos:
            pos = 0  # File rotated/truncated
        with open(path, "r", errors="replace") as f:
            f.seek(pos)
            new_lines = f.readlines()
            pos = f.tell()
        rows = []
        for line in new_lines:
            row = parse_log_line(line, config)
            if row:
                rows.append(row)
                breaches = check_thresholds(row, thresholds)
                for b in breaches:
                    write_alert_log(b, alert_cfg.get("log_file", "./alerts.log"))
                    send_email_alert(b, alert_cfg.get("email", {}))
                    await broadcast(clients, {"type": "alert", **b})
                    log.warning(f"BREACH: {b['severity'].upper()} {b['metric']}={b['value']} (>={b['threshold']})")
        if rows:
            await broadcast(clients, {"type": "data", "source": os.path.basename(path), "rows": rows})
            log.info(f"Pushed {len(rows)} row(s) from '{path}'")
    except FileNotFoundError:
        log.warning(f"File not found: '{path}'")
    except OSError as e:
        log.error(f"File read error for '{path}': {e}")
    return pos


def sync_remote_file(src, local_dir):
    """Sync a remote log file via rsync. Returns local path."""
    os.makedirs(local_dir, exist_ok=True)
    remote = f"{src['user']}@{src['host']}:{src['path']}"
    local_path = os.path.join(local_dir, f"{src['host']}_{os.path.basename(src['path'])}")
    cmd = ["rsync", "-az", "--no-motd", remote, local_path]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.returncode != 0:
            log.error(f"rsync failed for {remote}: {result.stderr.strip()}")
        else:
            log.debug(f"rsync OK: {remote} → {local_path}")
    except subprocess.TimeoutExpired:
        log.error(f"rsync timeout for {remote}")
    except FileNotFoundError:
        log.error("rsync not found — install rsync on this server")
    return local_path


# ── WebSocket Broadcasting ────────────────────────────────────────────────────

async def broadcast(clients, message):
    """Send JSON message to all connected WebSocket clients."""
    if not clients:
        return
    payload = json.dumps(message)
    dead = set()
    for ws_client in clients:
        try:
            await ws_client.send(payload)
        except Exception:
            dead.add(ws_client)
    clients -= dead


async def ws_handler(websocket, clients):
    """Register a new WebSocket client and keep it alive."""
    clients.add(websocket)
    log.info(f"WS client connected: {websocket.remote_address}")
    try:
        async for _ in websocket:
            pass  # Clients send nothing; just keep connection open
    except Exception:
        pass
    finally:
        clients.discard(websocket)
        log.info(f"WS client disconnected: {websocket.remote_address}")


# ── HTTP Server (serves index.html) ──────────────────────────────────────────

def make_http_handler(html_path):
    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            if self.path == "/" or self.path.startswith("/?"):
                try:
                    with open(html_path, "rb") as f:
                        content = f.read()
                    self.send_response(200)
                    self.send_header("Content-Type", "text/html; charset=utf-8")
                    self.send_header("Content-Length", len(content))
                    self.end_headers()
                    self.wfile.write(content)
                except FileNotFoundError:
                    self.send_error(404, f"HTML file not found: {html_path}")
            else:
                self.send_error(404)

        def log_message(self, format, *args):
            log.debug(f"HTTP {self.address_string()} {format % args}")

    return Handler


def run_http_server(port, html_path):
    handler = make_http_handler(html_path)
    server = HTTPServer(("0.0.0.0", port), handler)
    log.info(f"HTTP server: http://0.0.0.0:{port}/")
    server.serve_forever()


# ── Main Event Loop ───────────────────────────────────────────────────────────

async def monitor_loop(config, clients):
    """Main polling loop: watch local files and periodically sync remote ones."""
    thresholds = config.get("thresholds", {})
    alert_cfg = config.get("alerts", {})
    poll = config.get("poll_interval_seconds", 10)
    remote_interval = config.get("remote_sync_interval_seconds", 60)

    local_sources = config["log_sources"].get("local", [])
    remote_sources = config["log_sources"].get("remote", [])
    local_positions = {path: 0 for path in local_sources}

    # Track remote-synced files as local after first sync
    remote_local_map = {}
    last_remote_sync = 0

    log.info(f"Monitoring {len(local_sources)} local + {len(remote_sources)} remote source(s)")

    while True:
        now = time.time()

        # Sync remote files periodically
        if remote_sources and (now - last_remote_sync) >= remote_interval:
            for src in remote_sources:
                local_path = sync_remote_file(src, "/tmp/kpi-remote")
                if local_path not in remote_local_map:
                    remote_local_map[local_path] = 0
            last_remote_sync = now

        # Tail all local files (including synced remote copies)
        all_paths = {**local_positions, **remote_local_map}
        for path, pos in list(all_paths.items()):
            new_pos = await tail_local_file(path, pos, config, clients, alert_cfg, thresholds)
            if path in local_positions:
                local_positions[path] = new_pos
            else:
                remote_local_map[path] = new_pos

        await asyncio.sleep(poll)


async def main_async(config):
    clients = set()

    async def ws_server_handler(websocket, path=None):
        await ws_handler(websocket, clients)

    ws_port = config["websocket_port"]
    ws_server = await websockets.serve(ws_server_handler, "0.0.0.0", ws_port)
    log.info(f"WebSocket server: ws://0.0.0.0:{ws_port}/")

    await asyncio.gather(
        ws_server.wait_closed(),
        monitor_loop(config, clients)
    )


def main():
    config_path = "config.json"
    if len(sys.argv) > 2 and sys.argv[1] == "--config":
        config_path = sys.argv[2]

    # Resolve paths relative to server.py location
    script_dir = Path(__file__).parent
    config_full = script_dir / config_path
    html_path = script_dir.parent / "KPI-Analysis-Tool.html"

    config = load_config(str(config_full))

    if not html_path.exists():
        log.warning(f"HTML file not found at '{html_path}' — HTTP server will return 404.")

    # Start HTTP server in a background thread (stdlib, no extra deps)
    http_thread = Thread(target=run_http_server, args=(config["http_port"], str(html_path)), daemon=True)
    http_thread.start()

    log.info("KPI Server starting. Press Ctrl+C to stop.")
    try:
        asyncio.run(main_async(config))
    except KeyboardInterrupt:
        log.info("Server stopped.")


if __name__ == "__main__":
    main()
