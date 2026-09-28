import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "data" / "exchange_wallets.db"

conn = sqlite3.connect(DB_PATH)

row = conn.execute("""
    SELECT
        address,
        name,
        type,
        wallet_type,
        coin,
        network,
        balance,
        custodian,
        source
    FROM exchange_wallets
    LIMIT 1
""").fetchone()

conn.close()

print("DB:", DB_PATH)
print("Sample record:")
print(row)