import pandas as pd

# ============================================================
# 1. TRANSACTION DATA
# ============================================================

data = [
    {
        "tx_id": "TX1",
        "from": "W0",
        "to": "W1",
        "amount": 50000,
        "timestamp": "2026-09-10 10:01:15"
    },
    {
        "tx_id": "TX2",
        "from": "W1",
        "to": "W2",
        "amount": 45000,
        "timestamp": "2026-09-10 10:08:32"
    },
    {
        "tx_id": "TX3",
        "from": "W1",
        "to": "W3",
        "amount": 5000,
        "timestamp": "2026-09-10 10:09:11"
    },
    {
        "tx_id": "TX4",
        "from": "W2",
        "to": "W4",
        "amount": 45000,
        "timestamp": "2026-09-10 10:15:47"
    }
]

df = pd.DataFrame(data)

df["timestamp"] = pd.to_datetime(df["timestamp"])

# All wallets in the case
wallets = ["W0", "W1", "W2", "W3", "W4"]

SOURCE_WALLET = "W0"


# ============================================================
# 2. WALLET ENTITY INFORMATION
# ============================================================

# True  = known entity
# False = unknown entity

known_entity = {
    "W0": False,
    "W1": False,
    "W2": False,
    "W3": False,
    "W4": False
}


# ============================================================
# 3. CALCULATE WALLET FEATURES
# ============================================================

wallet_results = []

initial_amount = df[df["from"] == SOURCE_WALLET]["amount"].sum()


for wallet in wallets:

    # --------------------------------------------------------
    # Incoming transactions
    # --------------------------------------------------------

    incoming = df[df["to"] == wallet]

    # --------------------------------------------------------
    # Outgoing transactions
    # --------------------------------------------------------

    outgoing = df[df["from"] == wallet]

    incoming_amount = incoming["amount"].sum()
    outgoing_amount = outgoing["amount"].sum()

    incoming_count = len(incoming)
    outgoing_count = len(outgoing)

    # --------------------------------------------------------
    # Forwarding ratio
    # --------------------------------------------------------

    if incoming_amount > 0:
        forwarding_ratio = (
            outgoing_amount / incoming_amount
        ) * 100
    else:
        forwarding_ratio = 0

    # --------------------------------------------------------
    # Number of outgoing destinations
    # --------------------------------------------------------

    unique_destinations = outgoing["to"].nunique()

    # --------------------------------------------------------
    # Split detection
    # --------------------------------------------------------

    if incoming_count > 0 and unique_destinations >= 2:
        split_detected = True
    else:
        split_detected = False

    # --------------------------------------------------------
    # Rapid movement
    # --------------------------------------------------------

    rapid_movement = False
    minimum_time_gap_seconds = None

    if incoming_count > 0 and outgoing_count > 0:

        for _, in_tx in incoming.iterrows():

            for _, out_tx in outgoing.iterrows():

                gap = (
                    out_tx["timestamp"] -
                    in_tx["timestamp"]
                ).total_seconds()

                # Outgoing transaction must happen
                # after incoming transaction
                if gap >= 0:

                    if (
                        minimum_time_gap_seconds is None
                        or gap < minimum_time_gap_seconds
                    ):
                        minimum_time_gap_seconds = gap

        # Less than or equal to 10 minutes
        if (
            minimum_time_gap_seconds is not None
            and minimum_time_gap_seconds <= 600
        ):
            rapid_movement = True

    # --------------------------------------------------------
    # Victim-originated flow
    # --------------------------------------------------------

    victim_flow = False

    if wallet != SOURCE_WALLET:

        # Check whether wallet directly received
        # funds from victim wallet
        if len(
            df[
                (df["from"] == SOURCE_WALLET)
                & (df["to"] == wallet)
            ]
        ) > 0:
            victim_flow = True

    # --------------------------------------------------------
    # High-value amount
    # --------------------------------------------------------

    wallet_max_amount = max(
        incoming_amount,
        outgoing_amount
    )

    high_value = wallet_max_amount >= 50000

    # --------------------------------------------------------
    # Unknown entity
    # --------------------------------------------------------

    unknown_entity = not known_entity[wallet]

    # ========================================================
    # 4. RISK SCORE
    # ========================================================

    risk_score = 0

    # ---- A. High-value transaction: 15 points ----
    if high_value:
        risk_score += 15

    # ---- B. Rapid movement: 15 points ----
    if rapid_movement:
        risk_score += 15

    # ---- C. Fund splitting: 15 points ----
    if split_detected:
        risk_score += 15

    # ---- D. High forwarding ratio: 15 points ----
    if forwarding_ratio >= 80:
        risk_score += 15

    # ---- E. Multi-destination behaviour: 10 points ----
    if unique_destinations >= 2:
        risk_score += 10

    # ---- F. Unknown entity: 10 points ----
    if unknown_entity:
        risk_score += 10

    # ---- G. Direct victim connection: 10 points ----
    if victim_flow:
        risk_score += 10

    # ---- H. Outgoing movement: 10 points ----
    if outgoing_count > 0:
        risk_score += 10

    # Make sure score never exceeds 100
    risk_score = min(risk_score, 100)

    # ========================================================
    # 5. RISK LEVEL
    # ========================================================

    if risk_score >= 80:
        risk_level = "CRITICAL"

    elif risk_score >= 60:
        risk_level = "HIGH"

    elif risk_score >= 40:
        risk_level = "MEDIUM"

    elif risk_score >= 20:
        risk_level = "LOW"

    else:
        risk_level = "MINIMAL"

    # ========================================================
    # 6. STORE RESULT
    # ========================================================

    wallet_results.append({
        "Wallet": wallet,
        "Incoming Amount": incoming_amount,
        "Outgoing Amount": outgoing_amount,
        "Incoming TXs": incoming_count,
        "Outgoing TXs": outgoing_count,
        "Forwarding Ratio (%)": round(
            forwarding_ratio, 2
        ),
        "Destinations": unique_destinations,
        "Split Detected": split_detected,
        "Rapid Movement": rapid_movement,
        "Victim Flow": victim_flow,
        "Unknown Entity": unknown_entity,
        "Risk Score": risk_score,
        "Risk Level": risk_level
    })


# ============================================================
# 7. CREATE FINAL RISK TABLE
# ============================================================

risk_df = pd.DataFrame(wallet_results)

print("\n==============================================")
print("        WALLET RISK ANALYSIS")
print("==============================================\n")

print(
    risk_df.to_string(index=False)
)


# ============================================================
# 8. SHOW INDIVIDUAL WALLET RESULTS
# ============================================================

print("\n\n==============================================")
print("        INDIVIDUAL WALLET RISK")
print("==============================================")

for _, row in risk_df.iterrows():

    print(f"\nWallet: {row['Wallet']}")
    print(f"Risk Score : {row['Risk Score']}/100")
    print(f"Risk Level : {row['Risk Level']}")

    print(f"Incoming Amount : {row['Incoming Amount']} USDT")
    print(f"Outgoing Amount : {row['Outgoing Amount']} USDT")

    print(
        f"Forwarding Ratio : "
        f"{row['Forwarding Ratio (%)']}%"
    )

    print(
        f"Split Detected : "
        f"{row['Split Detected']}"
    )

    print(
        f"Rapid Movement : "
        f"{row['Rapid Movement']}"
    )

    print(
        f"Victim Flow : "
        f"{row['Victim Flow']}"
    )