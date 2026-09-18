import pandas as pd

# Transaction data
data = [
    ["TX1", "W0", "W1", 50000, "2026-09-10 10:01:15"],
    ["TX2", "W1", "W2", 45000, "2026-09-10 10:08:32"],
    ["TX3", "W1", "W3", 5000,  "2026-09-10 10:09:11"],
    ["TX4", "W2", "W4", 45000, "2026-09-10 10:15:47"]
]

df = pd.DataFrame(
    data,
    columns=["TX_ID", "From", "To", "Amount", "Timestamp"]
)

df["Timestamp"] = pd.to_datetime(df["Timestamp"])

wallets = ["W0", "W1", "W2", "W3", "W4"]

results = []

for wallet in wallets:

    incoming = df[df["To"] == wallet]
    outgoing = df[df["From"] == wallet]

    incoming_amount = incoming["Amount"].sum()
    outgoing_amount = outgoing["Amount"].sum()

    risk = 0

    # 1. High-value transaction
    if max(incoming_amount, outgoing_amount) >= 50000:
        risk += 15

    # 2. Victim directly sent money to wallet
    if len(df[(df["From"] == "W0") & (df["To"] == wallet)]) > 0:
        risk += 15

    # 3. Multiple outgoing destinations = splitting
    if outgoing["To"].nunique() >= 2:
        risk += 20

    # 4. Forwarding ratio
    if incoming_amount > 0:
        forwarding_ratio = outgoing_amount / incoming_amount * 100
    else:
        forwarding_ratio = 0

    if forwarding_ratio >= 80:
        risk += 20

    # 5. Rapid movement
    rapid = False

    for _, i in incoming.iterrows():
        for _, o in outgoing.iterrows():

            gap = (o["Timestamp"] - i["Timestamp"]).total_seconds()

            if 0 <= gap <= 600:
                rapid = True

    if rapid:
        risk += 20

    # Maximum = 90 in this particular rule set
    risk_percentage = min((risk / 90) * 100, 100)

    results.append([
        wallet,
        round(risk_percentage, 2)
    ])

result_df = pd.DataFrame(
    results,
    columns=["Wallet", "Risk Percentage"]
)

print(result_df)