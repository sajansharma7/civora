#!/usr/bin/env bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(dirname "$SCRIPT_DIR")"
LOCAL_MYSQL="$BASE_DIR/.mysql_local"

export LD_LIBRARY_PATH="$LOCAL_MYSQL/usr/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH"

exec "$LOCAL_MYSQL/usr/sbin/mysqld" \
  --datadir="$LOCAL_MYSQL/data" \
  --socket="/tmp/civora-mysql.sock" \
  --port=3306 \
  --bind-address=127.0.0.1 \
  --pid-file="/tmp/civora-mysql.pid" \
  --secure-file-priv="" \
  --mysqlx=0
