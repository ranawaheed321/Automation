#!/usr/bin/env bash

set -euo pipefail

# Usage:
#   scripts/nordvpn-run.sh --country US --city "New York" -- "npx playwright test --headed"
#   scripts/nordvpn-run.sh --group P2P -- "node tests/visit.js"

print_help() {
  cat <<'EOF'
NordVPN runner: connect, run a command, then disconnect.

Options:
  --country CC     ISO country code (e.g., US, GB). Optional
  --city NAME      City name (as listed by `nordvpn cities --country CC`). Optional
  --group NAME     NordVPN server group (e.g., Standard, P2P, Obfuscated). Optional
  --protocol PROTO Protocol (UDP/TCP). Optional
  --help           Show this help

Command to run must follow a `--` separator. Example:
  scripts/nordvpn-run.sh --country US -- "npx playwright test --headed"
EOF
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "ERROR: required command '$1' not found in PATH" >&2
    exit 127
  fi
}

require_cmd nordvpn

COUNTRY=""
CITY=""
GROUP=""
PROTOCOL=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --country)
      COUNTRY=${2:-}; shift 2 ;;
    --city)
      CITY=${2:-}; shift 2 ;;
    --group)
      GROUP=${2:-}; shift 2 ;;
    --protocol)
      PROTOCOL=${2:-}; shift 2 ;;
    --help|-h)
      print_help; exit 0 ;;
    --)
      shift; break ;;
    *)
      echo "Unknown option: $1" >&2; print_help; exit 2 ;;
  esac
done

if [[ $# -eq 0 ]]; then
  echo "ERROR: No command provided to run under VPN. Use -- to separate options and command." >&2
  print_help
  exit 2
fi

CMD=("$@")

echo "[nordvpn-run] Checking login status..."
LOGIN_STATUS=$(nordvpn account 2>/dev/null || true)
if ! echo "$LOGIN_STATUS" | grep -qi "Email"; then
  echo "[nordvpn-run] You are not logged in. Attempting 'nordvpn login' (non-interactive may fail)." >&2
  if ! nordvpn login; then
    echo "[nordvpn-run] Please log in first: run 'nordvpn login' in a terminal." >&2
    exit 1
  fi
fi

set +e
CURRENT_STATUS=$(nordvpn status 2>/dev/null)
set -e

ALREADY_CONNECTED=false
if echo "$CURRENT_STATUS" | grep -q "Status: Connected"; then
  ALREADY_CONNECTED=true
  echo "[nordvpn-run] Already connected. Will reuse existing session."
fi

cleanup() {
  local exit_code=$?
  if [[ "$ALREADY_CONNECTED" == false ]]; then
    echo "[nordvpn-run] Disconnecting..."
    nordvpn disconnect || true
  else
    echo "[nordvpn-run] Leaving pre-existing connection as-is."
  fi
  exit $exit_code
}
trap cleanup EXIT INT TERM

if [[ "$ALREADY_CONNECTED" == false ]]; then
  if [[ -n "$GROUP" ]]; then
    echo "[nordvpn-run] Setting group: $GROUP"
    nordvpn set cybersec disabled >/dev/null 2>&1 || true
    nordvpn set threatprotectionlite disabled >/dev/null 2>&1 || true
    nordvpn set meshnet disabled >/dev/null 2>&1 || true
    nordvpn set killswitch disabled >/dev/null 2>&1 || true
    nordvpn set auto-connect disabled >/dev/null 2>&1 || true
    nordvpn set dns off >/dev/null 2>&1 || true
    nordvpn set obfuscate off >/dev/null 2>&1 || true
    nordvpn set technology nordlynx >/dev/null 2>&1 || true
    nordvpn set protocol ${PROTOCOL:-UDP} >/dev/null 2>&1 || true
  fi

  CONNECT_ARGS=()
  if [[ -n "$COUNTRY" ]]; then CONNECT_ARGS+=("--country" "$COUNTRY"); fi
  if [[ -n "$CITY" ]]; then CONNECT_ARGS+=("--city" "$CITY"); fi
  if [[ -n "$GROUP" ]]; then CONNECT_ARGS+=("--group" "$GROUP"); fi

  echo "[nordvpn-run] Connecting... ${CONNECT_ARGS[*]}"
  if ! nordvpn connect "${CONNECT_ARGS[@]}"; then
    echo "[nordvpn-run] Connect failed. Try a different country/city/group or run 'nordvpn connect' manually." >&2
    exit 1
  fi
fi

echo "[nordvpn-run] Connected. Running: ${CMD[*]}"
"${CMD[@]}"

echo "[nordvpn-run] Command finished."


