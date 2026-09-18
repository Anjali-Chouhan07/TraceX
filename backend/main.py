import os
import requests
import networkx as nx

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv


# ============================================================
# CONFIG
# ============================================================

load_dotenv()

ALCHEMY_API_KEY = os.getenv("ALCHEMY_API_KEY")

if not ALCHEMY_API_KEY:
    raise RuntimeError("ALCHEMY_API_KEY missing from .env")

ALCHEMY_URL = f"https://eth-mainnet.g.alchemy.com/v2/{ALCHEMY_API_KEY}"

print("Alchemy URL configured:", ALCHEMY_URL[:55] + "...")
MAX_HOPS = 3


# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="TraceX Blockchain Intelligence Engine"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# REQUEST
# ============================================================

class InspectionInput(BaseModel):
    wallet_address: str


# ============================================================
# KNOWN VASPs
# IMPORTANT:
# These are only demo labels. Do not claim an address is Binance/
# CoinDCX/etc. unless you have verified attribution data.
# ============================================================

VASP_DIRECTORY = {
    # put VERIFIED addresses here later
}


# ============================================================
# ALCHEMY REQUEST
# ============================================================

def get_transfers(wallet, direction):

    if direction == "outgoing":

        params = [{
            "fromAddress": wallet,
            "category": [
                "external",
                "erc20"
            ],
            "withMetadata": True,
            "maxCount": "0x64"
        }]

    else:

        params = [{
            "toAddress": wallet,
            "category": [
                "external",
                "erc20"
            ],
            "withMetadata": True,
            "maxCount": "0x64"
        }]

    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "alchemy_getAssetTransfers",
        "params": params
    }

    try:

        response = requests.post(
            ALCHEMY_URL,
            json=payload,
            timeout=20
        )

        response.raise_for_status()

        data = response.json()

    except requests.RequestException as e:

        raise HTTPException(
            status_code=502,
            detail=f"Alchemy request failed: {str(e)}"
        )

    if "error" in data:

        raise HTTPException(
            status_code=502,
            detail=data["error"]
        )

    return data.get(
        "result",
        {}
    ).get(
        "transfers",
        []
    )


# ============================================================
# NORMALIZE TRANSACTIONS
# ============================================================

def normalize_transfer(tx):

    return {
        "tx_id": tx.get("hash"),

        "from": tx.get(
            "from",
            ""
        ).lower(),

        "to": tx.get(
            "to",
            ""
        ).lower(),

        "amount": float(
            tx.get("value") or 0
        ),

        "asset": tx.get(
            "asset",
            "ETH"
        ),

        "timestamp": (
            tx.get("metadata", {})
              .get(
                  "blockTimestamp"
              )
        ),

        "block": tx.get(
            "blockNum"
        )
    }


# ============================================================
# MULTI-HOP TRACE
# ============================================================

def trace_wallet(start_wallet):

    start_wallet = start_wallet.lower()

    graph = nx.DiGraph()

    discovered = set()

    queue = [
        (start_wallet, 0)
    ]

    all_transactions = []

    while queue:

        wallet, hop = queue.pop(0)

        if wallet in discovered:
            continue

        discovered.add(wallet)

        if hop > MAX_HOPS:
            continue

        outgoing = get_transfers(
            wallet,
            "outgoing"
        )

        incoming = get_transfers(
            wallet,
            "incoming"
        )

        transfers = outgoing + incoming

        seen_tx = set()

        for raw_tx in transfers:

            tx = normalize_transfer(
                raw_tx
            )

            tx_id = tx["tx_id"]

            if not tx_id:
                continue

            if tx_id in seen_tx:
                continue

            seen_tx.add(tx_id)

            if not tx["from"] or not tx["to"]:
                continue

            all_transactions.append(tx)

            graph.add_edge(
                tx["from"],
                tx["to"],
                tx_id=tx["tx_id"],
                amount=tx["amount"],
                asset=tx["asset"],
                timestamp=tx["timestamp"],
                block=tx["block"]
            )

            # Follow money to next wallet
            if tx["to"] not in discovered:

                queue.append(
                    (
                        tx["to"],
                        hop + 1
                    )
                )

    return graph, all_transactions


# ============================================================
# RISK ANALYSIS
# ============================================================

def calculate_risk(
    wallet,
    graph,
    transactions,
    start_wallet
):

    incoming = sum(
        tx["amount"]
        for tx in transactions
        if tx["to"] == wallet
    )

    outgoing = sum(
        tx["amount"]
        for tx in transactions
        if tx["from"] == wallet
    )

    outgoing_targets = len(
        {
            tx["to"]
            for tx in transactions
            if tx["from"] == wallet
        }
    )

    risk = 0
    reasons = []

    # High-value movement
    if max(
        incoming,
        outgoing
    ) >= 50000:

        risk += 20

        reasons.append(
            "High-value fund movement"
        )

    # Multiple destinations
    if outgoing_targets >= 2:

        risk += 20

        reasons.append(
            "Funds split across multiple destinations"
        )

    # Forwarding behavior
    if incoming > 0:

        forwarding_ratio = (
            outgoing / incoming
        )

        if forwarding_ratio >= 0.8:

            risk += 25

            reasons.append(
                "Rapid fund forwarding pattern"
            )

    # Many transactions
    tx_count = sum(
        1
        for tx in transactions
        if (
            tx["from"] == wallet
            or
            tx["to"] == wallet
        )
    )

    if tx_count >= 5:

        risk += 15

        reasons.append(
            "Multiple transaction activity"
        )

    # User searched wallet
    if wallet == start_wallet:

        risk += 10

    risk = min(
        risk,
        100
    )

    return {
        "score": risk,
        "status": (
            "High"
            if risk >= 70
            else
            "Medium"
            if risk >= 40
            else
            "Low"
        ),
        "reasons": reasons
    }


# ============================================================
# TRACE ENDPOINT
# ============================================================

@app.post(
    "/api/v1/engine/trace"
)
async def process_wallet_forensics(
    payload: InspectionInput
):

    wallet = (
        payload.wallet_address
        .strip()
        .lower()
    )

    if not wallet.startswith("0x"):

        raise HTTPException(
            status_code=400,
            detail="Invalid Ethereum wallet address"
        )

    try:

        graph, transactions = trace_wallet(
            wallet
        )

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    # ========================================================
    # NODES
    # ========================================================

    nodes = []

    for node in graph.nodes:

        risk = calculate_risk(
            node,
            graph,
            transactions,
            wallet
        )

        is_vasp = (
            node.lower()
            in VASP_DIRECTORY
        )

        nodes.append({

            "id": node,

            "label": (
                node[:10]
                + "..."
            ),

            "type": (
                "Known VASP"
                if is_vasp
                else
                "Investigation Wallet"
                if node == wallet
                else
                "Intermediary Wallet"
            ),

            "entity_resolved": (
                VASP_DIRECTORY.get(
                    node,
                    "Unknown"
                )
            ),

            "risk_score": risk["score"],

            "risk_status": risk["status"],

            "risk_reasons": risk["reasons"],

            "is_exchange": is_vasp
        })

    # ========================================================
    # EDGES
    # ========================================================

    edges = []

    for tx in transactions:

        edges.append({

            "id": tx["tx_id"],

            "source": tx["from"],

            "target": tx["to"],

            "label": (
                f'{tx["amount"]:,.2f} '
                f'{tx["asset"]}'
            ),

            "amount": tx["amount"],

            "asset": tx["asset"],

            "timestamp": tx["timestamp"],

            "block": tx["block"]
        })

    # ========================================================
    # CASE SUMMARY
    # ========================================================

    root_risk = calculate_risk(
        wallet,
        graph,
        transactions,
        wallet
    )

    return {

        "status": "success",

        "searched_wallet": wallet,

        "summary": {

            "risk_score": root_risk["score"],

            "risk_status": root_risk["status"],

            "total_nodes": len(nodes),

            "total_transactions": len(edges),

            "hops_traced": MAX_HOPS,

            "total_funds": sum(
                tx["amount"]
                for tx in transactions
            )
        },

        "topology": {

            "nodes": nodes,

            "edges": edges
        }
    }