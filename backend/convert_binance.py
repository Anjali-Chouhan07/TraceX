import pandas as pd
import sqlite3
from pathlib import Path


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

DEPOSIT_FILE = BASE_DIR / "PR01SEP26_deposit.csv"
HOTCOLD_FILE = BASE_DIR / "PR01SEP26_hotcold.csv"

DATABASE_FILE = BASE_DIR / "data" / "exchange_wallets.db"

CHUNK_SIZE = 50_000


# ============================================================
# DATABASE
# ============================================================

DATABASE_FILE.parent.mkdir(
    parents=True,
    exist_ok=True
)

conn = sqlite3.connect(DATABASE_FILE)

cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS exchange_wallets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    wallet_type TEXT NOT NULL,
    coin TEXT,
    network TEXT,
    balance TEXT,
    height TEXT,
    custodian TEXT,
    source TEXT
)
""")

# Fast exact address lookup
cursor.execute("""
CREATE INDEX IF NOT EXISTS idx_wallet_address
ON exchange_wallets(address)
""")

conn.commit()


# ============================================================
# PROCESS CSV
# ============================================================

def process_file(file_path, wallet_type):

    print("\n" + "=" * 60)
    print(f"Reading: {file_path.name}")
    print("=" * 60)

    if not file_path.exists():
        print("ERROR: File not found:")
        print(file_path)
        return 0

    total_rows = 0
    valid_addresses = 0

    for df in pd.read_csv(
        file_path,
        low_memory=False,
        chunksize=CHUNK_SIZE
    ):

        total_rows += len(df)

        # Remove rows without address
        df = df.dropna(subset=["address"])

        # Clean address
        df["address"] = (
            df["address"]
            .astype(str)
            .str.strip()
            .str.lower()
        )

        # Remove empty addresses
        df = df[
            (df["address"] != "") &
            (df["address"] != "nan")
        ]

        valid_addresses += len(df)

        # Rename CSV columns to simple names
        df = df.rename(columns={
            "Third party custodian name": "custodian",
            "Height": "height"
        })

        # Add TraceX metadata
        df["name"] = "Binance"
        df["type"] = "exchange"
        df["wallet_type"] = wallet_type
        df["source"] = "Binance official address disclosure"

        # Keep only required columns
        df = df[
            [
                "address",
                "name",
                "type",
                "wallet_type",
                "coin",
                "network",
                "balance",
                "height",
                "custodian",
                "source"
            ]
        ]

        # Convert NaN to None
        df = df.where(
            pd.notnull(df),
            None
        )

        # Insert into SQLite
        df.to_sql(
            "exchange_wallets",
            conn,
            if_exists="append",
            index=False
        )

        print(
            f"Processed: {total_rows:,} rows | "
            f"Valid addresses: {valid_addresses:,}"
        )

    print("\nFinished:", file_path.name)
    print(f"Total rows: {total_rows:,}")
    print(f"Valid addresses: {valid_addresses:,}")

    return valid_addresses


# ============================================================
# PROCESS BOTH FILES
# ============================================================

deposit_count = process_file(
    DEPOSIT_FILE,
    "deposit"
)

hotcold_count = process_file(
    HOTCOLD_FILE,
    "hot_cold"
)


# ============================================================
# FINAL DATABASE INDEX
# ============================================================

print("\nCreating indexes...")

cursor.execute("""
CREATE INDEX IF NOT EXISTS idx_wallet_address_network
ON exchange_wallets(address, network)
""")

conn.commit()


# ============================================================
# SUMMARY
# ============================================================

cursor.execute("""
SELECT COUNT(*)
FROM exchange_wallets
""")

total_records = cursor.fetchone()[0]


cursor.execute("""
SELECT COUNT(DISTINCT address)
FROM exchange_wallets
""")

unique_addresses = cursor.fetchone()[0]


print("\n" + "=" * 60)
print("CONVERSION COMPLETE")
print("=" * 60)

print(
    "Deposit records :",
    f"{deposit_count:,}"
)

print(
    "Hot/Cold records:",
    f"{hotcold_count:,}"
)

print(
    "Total records   :",
    f"{total_records:,}"
)

print(
    "Unique addresses:",
    f"{unique_addresses:,}"
)

print("\nDatabase saved at:")
print(DATABASE_FILE)


# ============================================================
# SHOW NETWORK SUMMARY
# ============================================================

print("\nNetwork summary:")

cursor.execute("""
SELECT network, COUNT(*)
FROM exchange_wallets
GROUP BY network
ORDER BY COUNT(*) DESC
LIMIT 20
""")

for network, count in cursor.fetchall():

    print(
        f"  {network}: {count:,}"
    )


conn.close()

print("\nDone.")