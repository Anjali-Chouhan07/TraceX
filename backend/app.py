import os
import re
import hashlib
from collections import defaultdict, deque
from datetime import datetime

import requests
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field



# =========================================================
# CONFIG
# =========================================================

load_dotenv()

ALCHEMY_API_KEY = os.getenv("ALCHEMY_API_KEY", "").strip()

if not ALCHEMY_API_KEY:
    raise RuntimeError(
        "ALCHEMY_API_KEY is missing. Add it to block/.env"
    )

ALCHEMY_URL = (
    f"https://eth-mainnet.g.alchemy.com/v2/{ALCHEMY_API_KEY}"
)

MAX_WALLETS = 5
MAX_TX_PER_QUERY = 20
MAX_PAGES_PER_QUERY = 1
MAX_RETURN_TRANSACTIONS = 100


# =========================================================
# FASTAPI
# =========================================================

app = FastAPI(
    title="TraceX Blockchain Forensics API",
    version="1.0.0"
)
@app.get("/health")
def health():
    return {"status": "OK", "from": "BLOCK_APP_PY"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# REQUEST MODEL
# =========================================================

class TraceRequest(BaseModel):
    wallet_address: str
    max_hops: int = Field(
        default=3,
        ge=1,
        le=3
    )


# =========================================================
# BASIC HELPERS
# =========================================================

def validate_wallet(address: str) -> str:

    if not isinstance(address, str):
        raise HTTPException(
            status_code=400,
            detail="Wallet address must be a string."
        )

    address = address.strip()

    if not re.fullmatch(
        r"0x[a-fA-F0-9]{40}",
        address
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid Ethereum wallet address."
        )

    return address.lower()


def short_address(address: str) -> str:

    if not address:
        return "Unknown"

    return f"{address[:8]}...{address[-6:]}"


def parse_timestamp(value):

    if not value:
        return None

    try:
        return datetime.fromisoformat(
            value.replace("Z", "+00:00")
        )
    except Exception:
        return None


def format_number(value):

    if value is None:
        return 0

    try:
        return float(value)
    except Exception:
        return 0


# =========================================================
# ALCHEMY REQUEST
# =========================================================

def alchemy_rpc(method, params):

    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": method,
        "params": params
    }

    try:

        response = requests.post(
            ALCHEMY_URL,
            json=payload,
            timeout=30
        )

    except requests.RequestException as exc:

        raise HTTPException(
            status_code=502,
            detail=f"Could not connect to Alchemy: {str(exc)}"
        )

    if response.status_code == 401:

        raise HTTPException(
            status_code=502,
            detail="Alchemy API key is unauthorized. Check/rotate your API key."
        )

    if response.status_code == 429:

        raise HTTPException(
            status_code=502,
            detail="Alchemy rate limit reached. Try again after a few seconds."
        )

    if not response.ok:

        raise HTTPException(
            status_code=502,
            detail=f"Alchemy returned HTTP {response.status_code}."
        )

    try:

        data = response.json()

    except Exception:

        raise HTTPException(
            status_code=502,
            detail="Alchemy returned invalid JSON."
        )

    if "error" in data:

        error = data["error"]

        raise HTTPException(
            status_code=502,
            detail=error.get(
                "message",
                "Alchemy RPC request failed."
            )
        )

    return data.get("result", {})


# =========================================================
# FETCH TRANSFERS
# =========================================================

def fetch_transfers(
    wallet,
    direction,
    limit=MAX_TX_PER_QUERY
):

    wallet = wallet.lower()

    transfers = []
    page_key = None

    for _ in range(MAX_PAGES_PER_QUERY):

        params = {
            "fromBlock": "0x0",
            "toBlock": "latest",
            "withMetadata": True,
            "excludeZeroValue": True,
            "maxCount": hex(limit),

            # Monetary transfers for MVP
            "category": [
                "external",
                "internal",
                "erc20"
            ]
        }

        if direction == "out":

            params["fromAddress"] = wallet

        else:

            params["toAddress"] = wallet

        if page_key:

            params["pageKey"] = page_key

        result = alchemy_rpc(
            "alchemy_getAssetTransfers",
            [params]
        )

        current = result.get(
            "transfers",
            []
        )

        transfers.extend(current)

        page_key = result.get("pageKey")

        if not page_key:
            break

    return transfers


# =========================================================
# NORMALIZE ALCHEMY TRANSFER
# =========================================================

def normalize_transfer(
    raw,
    hop,
    direction
):

    source = raw.get("from")

    target = raw.get("to")

    if not source or not target:
        return None

    source = source.lower()
    target = target.lower()

    if not re.fullmatch(
        r"0x[a-fA-F0-9]{40}",
        source
    ):
        return None

    if not re.fullmatch(
        r"0x[a-fA-F0-9]{40}",
        target
    ):
        return None

    amount = format_number(
        raw.get("value")
    )

    asset = (
        raw.get("asset")
        or "ETH"
    ).upper()

    metadata = raw.get(
        "metadata"
    ) or {}

    timestamp = metadata.get(
        "blockTimestamp"
    )

    tx_hash = raw.get("hash")

    unique_id = (
        raw.get("uniqueId")
        or tx_hash
        or hashlib.sha1(
            str(raw).encode()
        ).hexdigest()
    )

    return {
        "id": unique_id,
        "hash": tx_hash,
        "source": source,
        "target": target,
        "amount": amount,
        "asset": asset,
        "timestamp": timestamp,
        "block": raw.get("blockNum"),
        "category": raw.get("category"),
        "direction": direction,
        "hop": hop
    }


# =========================================================
# RISK ENGINE
# =========================================================

def calculate_node_risk(
    node,
    stats,
    investigation_wallet
):

    score = 0
    reasons = []

    incoming_count = stats["incoming_count"]
    outgoing_count = stats["outgoing_count"]

    total_count = (
        incoming_count +
        outgoing_count
    )

    counterparty_count = len(
        stats["counterparties"]
    )

    outgoing_counterparties = len(
        stats["outgoing_counterparties"]
    )

    if node == investigation_wallet:

        score += 15

        reasons.append(
            "Investigation wallet"
        )

    if total_count >= 50:

        score += 10

        reasons.append(
            "High transaction activity"
        )

    elif total_count >= 20:

        score += 5

        reasons.append(
            "Multiple transaction activity"
        )

    if counterparty_count >= 5:

        score += 15

        reasons.append(
            "Multiple counterparties"
        )

    elif counterparty_count >= 3:

        score += 10

        reasons.append(
            "Several counterparties"
        )

    if outgoing_counterparties >= 3:

        score += 10

        reasons.append(
            "Funds forwarded to multiple wallets"
        )

    # -----------------------------------------------------
    # Forwarding ratio
    # -----------------------------------------------------

    dominant_asset = None

    if stats["incoming_volume_by_asset"]:

        dominant_asset = max(
            stats["incoming_volume_by_asset"],
            key=stats["incoming_volume_by_asset"].get
        )

    forwarding_ratio = 0

    if dominant_asset:

        incoming_value = stats[
            "incoming_volume_by_asset"
        ].get(
            dominant_asset,
            0
        )

        outgoing_value = stats[
            "outgoing_volume_by_asset"
        ].get(
            dominant_asset,
            0
        )

        if incoming_value > 0:

            forwarding_ratio = (
                outgoing_value /
                incoming_value
            ) * 100

    if forwarding_ratio >= 80:

        score += 20

        reasons.append(
            "High forwarding ratio"
        )

    # -----------------------------------------------------
    # Rapid forwarding
    # -----------------------------------------------------

    rapid_forwarding = False

    incoming_times = sorted(
        [
            parse_timestamp(t)
            for t in stats["incoming_times"]
            if parse_timestamp(t)
        ]
    )

    outgoing_times = sorted(
        [
            parse_timestamp(t)
            for t in stats["outgoing_times"]
            if parse_timestamp(t)
        ]
    )

    if incoming_times and outgoing_times:

        for incoming_time in incoming_times:

            for outgoing_time in outgoing_times:

                difference = (
                    outgoing_time -
                    incoming_time
                ).total_seconds()

                if 0 <= difference <= 3600:

                    rapid_forwarding = True
                    break

            if rapid_forwarding:
                break

    if rapid_forwarding:

        score += 20

        reasons.append(
            "Rapid forwarding within one hour"
        )

    score = min(
        score,
        100
    )

    if score >= 70:

        status = "High"

    elif score >= 40:

        status = "Medium"

    else:

        status = "Low"

    if not reasons:

        reasons.append(
            "No strong heuristic pattern detected"
        )

    return {
        "risk_score": score,
        "risk_status": status,
        "risk_reasons": reasons,
        "forwarding_ratio": round(
            forwarding_ratio,
            2
        ),
        "rapid_forwarding": rapid_forwarding
    }


# =========================================================
# MAIN TRACE ENGINE
# =========================================================

def trace_wallet(
    investigation_wallet,
    max_hops
):

    investigation_wallet = (
        investigation_wallet.lower()
    )

    transaction_map = {}

    visited_wallets = {
        investigation_wallet
    }

    wallet_depth = {
        investigation_wallet: 0
    }

    queue = deque()

    queue.append(
        (
            investigation_wallet,
            0
        )
    )

    queried_wallets = set()

    # -----------------------------------------------------
    # ADD TRANSFERS
    # -----------------------------------------------------

    def add_transfers(
        raw_transfers,
        hop,
        direction
    ):

        for raw in raw_transfers:

            tx = normalize_transfer(
                raw,
                hop,
                direction
            )

            if not tx:
                continue

            key = tx["id"]

            if key not in transaction_map:

                transaction_map[key] = tx

    # -----------------------------------------------------
    # BFS TRACE
    # -----------------------------------------------------

    while queue:

        wallet, current_depth = queue.popleft()

        if wallet in queried_wallets:
            continue

        queried_wallets.add(wallet)

        # Do not continue beyond selected depth
        if current_depth >= max_hops:
            continue

        # -------------------------------------------------
        # Incoming only for investigation wallet
        # -------------------------------------------------

        if wallet == investigation_wallet:

            incoming = fetch_transfers(
                wallet,
                "in"
            )

            add_transfers(
                incoming,
                0,
                "incoming"
            )

        # -------------------------------------------------
        # Outgoing is what creates forward trace
        # -------------------------------------------------

        outgoing = fetch_transfers(
            wallet,
            "out"
        )

        next_hop = current_depth + 1

        add_transfers(
            outgoing,
            next_hop,
            "outgoing"
        )

        # -------------------------------------------------
        # Discover recipients
        # -------------------------------------------------

        for raw in outgoing:

            recipient = raw.get("to")

            if not recipient:
                continue

            recipient = recipient.lower()

            if recipient == wallet:
                continue

            if not re.fullmatch(
                r"0x[a-fA-F0-9]{40}",
                recipient
            ):
                continue

            if recipient in visited_wallets:
                continue

            if len(visited_wallets) >= MAX_WALLETS:
                break

            visited_wallets.add(
                recipient
            )

            wallet_depth[
                recipient
            ] = next_hop

            queue.append(
                (
                    recipient,
                    next_hop
                )
            )

    # =====================================================
    # TRANSACTIONS
    # =====================================================

    transactions = list(
        transaction_map.values()
    )

    transactions.sort(
        key=lambda x: (
            x["timestamp"] or ""
        ),
        reverse=True
    )

    total_transaction_count = len(
        transactions
    )

    returned_transactions = transactions[
        :MAX_RETURN_TRANSACTIONS
    ]

    # =====================================================
    # NODE STATS
    # =====================================================

    stats = defaultdict(
        lambda: {
            "incoming_count": 0,
            "outgoing_count": 0,

            "incoming_volume_by_asset": defaultdict(float),
            "outgoing_volume_by_asset": defaultdict(float),

            "counterparties": set(),
            "outgoing_counterparties": set(),

            "incoming_times": [],
            "outgoing_times": []
        }
    )

    for tx in transactions:

        source = tx["source"]
        target = tx["target"]

        asset = tx["asset"]
        amount = tx["amount"]

        # Source
        stats[source][
            "outgoing_count"
        ] += 1

        stats[source][
            "outgoing_volume_by_asset"
        ][asset] += amount

        stats[source][
            "counterparties"
        ].add(target)

        stats[source][
            "outgoing_counterparties"
        ].add(target)

        if tx["timestamp"]:

            stats[source][
                "outgoing_times"
            ].append(
                tx["timestamp"]
            )

        # Target
        stats[target][
            "incoming_count"
        ] += 1

        stats[target][
            "incoming_volume_by_asset"
        ][asset] += amount

        stats[target][
            "counterparties"
        ].add(source)

        if tx["timestamp"]:

            stats[target][
                "incoming_times"
            ].append(
                tx["timestamp"]
            )

    # =====================================================
    # NODE LIST
    # =====================================================

    all_nodes = set(
        [investigation_wallet]
    )

    for tx in transactions:

        all_nodes.add(
            tx["source"]
        )

        all_nodes.add(
            tx["target"]
        )

    nodes = []

    for address in all_nodes:

        node_stats = stats[address]

        risk = calculate_node_risk(
            address,
            node_stats,
            investigation_wallet
        )

        if address == investigation_wallet:

            node_type = (
                "Investigation Wallet"
            )

        elif address in wallet_depth:

            node_type = (
                f"Trace Hop {wallet_depth[address]}"
            )

        else:

            node_type = (
                "Counterparty Wallet"
            )

        nodes.append(
            {
                "id": address,

                "label": short_address(
                    address
                ),

                "type": node_type,

                "hop": wallet_depth.get(
                    address,
                    0
                ),

                "entity_resolved": "Unknown",

                "is_exchange": False,

                "risk_score": risk[
                    "risk_score"
                ],

                "risk_status": risk[
                    "risk_status"
                ],

                "risk_reasons": risk[
                    "risk_reasons"
                ],

                "forwarding_ratio": risk[
                    "forwarding_ratio"
                ],

                "rapid_forwarding": risk[
                    "rapid_forwarding"
                ],

                "incoming_count": node_stats[
                    "incoming_count"
                ],

                "outgoing_count": node_stats[
                    "outgoing_count"
                ],

                "counterparty_count": len(
                    node_stats[
                        "counterparties"
                    ]
                ),

                "incoming_volume_by_asset": dict(
                    node_stats[
                        "incoming_volume_by_asset"
                    ]
                ),

                "outgoing_volume_by_asset": dict(
                    node_stats[
                        "outgoing_volume_by_asset"
                    ]
                )
            }
        )

    # =====================================================
    # EDGE AGGREGATION
    # =====================================================

    edge_groups = {}

    for tx in transactions:

        key = (
            tx["source"],
            tx["target"],
            tx["asset"]
        )

        if key not in edge_groups:

            edge_groups[key] = {
                "source": tx["source"],
                "target": tx["target"],
                "asset": tx["asset"],
                "amount": 0,
                "tx_count": 0,
                "timestamps": [],
                "hashes": []
            }

        group = edge_groups[key]

        group["amount"] += tx["amount"]

        group["tx_count"] += 1

        if tx["timestamp"]:

            group[
                "timestamps"
            ].append(
                tx["timestamp"]
            )

        if tx["hash"]:

            group[
                "hashes"
            ].append(
                tx["hash"]
            )

    edges = []

    for key, group in edge_groups.items():

        raw_id = (
            f"{group['source']}|"
            f"{group['target']}|"
            f"{group['asset']}"
        )

        edge_id = (
            "edge-" +
            hashlib.sha1(
                raw_id.encode()
            ).hexdigest()[:16]
        )

        timestamps = group[
            "timestamps"
        ]

        last_seen = (
            max(timestamps)
            if timestamps
            else None
        )

        first_seen = (
            min(timestamps)
            if timestamps
            else None
        )

        label = (
            f"{group['amount']:.4f} "
            f"{group['asset']} • "
            f"{group['tx_count']} tx"
        )

        edges.append(
            {
                "id": edge_id,

                "source": group[
                    "source"
                ],

                "target": group[
                    "target"
                ],

                "asset": group[
                    "asset"
                ],

                "amount": round(
                    group["amount"],
                    8
                ),

                "tx_count": group[
                    "tx_count"
                ],

                "label": label,

                "first_seen": first_seen,

                "last_seen": last_seen,

                "transaction_hashes": group[
                    "hashes"
                ][:100]
            }
        )

    # =====================================================
    # FUNDS BY ASSET
    # =====================================================

    funds_by_asset = defaultdict(float)

    for tx in transactions:

        funds_by_asset[
            tx["asset"]
        ] += tx["amount"]

    funds_by_asset = {
        asset: round(
            value,
            8
        )
        for asset, value
        in funds_by_asset.items()
    }

    if "ETH" in funds_by_asset:

        display_asset = "ETH"

    elif funds_by_asset:

        display_asset = max(
            funds_by_asset,
            key=funds_by_asset.get
        )

    else:

        display_asset = "ETH"

    display_volume = funds_by_asset.get(
        display_asset,
        0
    )

    # =====================================================
    # TARGET RISK
    # =====================================================

    target_node = next(
        (
            node
            for node in nodes
            if node["id"] ==
            investigation_wallet
        ),
        None
    )

    if target_node:

        risk_score = target_node[
            "risk_score"
        ]

        risk_status = target_node[
            "risk_status"
        ]

    else:

        risk_score = 0
        risk_status = "Low"

    # =====================================================
    # HOPS
    # =====================================================

    hops_traced = 0

    for node in nodes:

        hops_traced = max(
            hops_traced,
            node.get("hop", 0)
        )

    # =====================================================
    # PATTERNS
    # =====================================================

    patterns = []

    if target_node:

        if target_node[
            "rapid_forwarding"
        ]:

            patterns.append(
                {
                    "name": "Rapid forwarding",
                    "severity": "High",
                    "detail": (
                        "Outgoing movement was detected "
                        "within one hour of incoming activity."
                    )
                }
            )

        if target_node[
            "forwarding_ratio"
        ] >= 80:

            patterns.append(
                {
                    "name": "High forwarding ratio",
                    "severity": "Medium",
                    "detail": (
                        f"Approximately "
                        f"{target_node['forwarding_ratio']:.1f}% "
                        f"of the dominant incoming asset volume "
                        f"was forwarded."
                    )
                }
            )

        if target_node[
            "counterparty_count"
        ] >= 3:

            patterns.append(
                {
                    "name": "Multiple counterparties",
                    "severity": "Medium",
                    "detail": (
                        f"{target_node['counterparty_count']} "
                        "unique counterparties were observed."
                    )
                }
            )

    if hops_traced >= 2:

        patterns.append(
            {
                "name": "Multi-hop propagation",
                "severity": "Medium",
                "detail": (
                    f"Fund movement was traced across "
                    f"{hops_traced} forward hop(s)."
                )
            }
        )

    if not patterns:

        patterns.append(
            {
                "name": "No strong heuristic pattern",
                "severity": "Low",
                "detail": (
                    "The current trace did not trigger "
                    "strong heuristic indicators."
                )
            }
        )

    # =====================================================
    # FINAL RESPONSE
    # =====================================================

    return {
        "status": "success",

        "searched_wallet": (
            investigation_wallet
        ),

        "summary": {

            "risk_score": risk_score,

            "risk_status": risk_status,

            "total_nodes": len(nodes),

            "total_transactions":
                total_transaction_count,

            "transactions_returned":
                len(returned_transactions),

            "hops_traced":
                hops_traced,

            "total_funds":
                round(
                    display_volume,
                    8
                ),

            "total_funds_asset":
                display_asset,

            "funds_by_asset":
                funds_by_asset,

            "volume_note": (
                "Transfer volume, not wallet balance. "
                "The same funds can appear across multiple hops."
            )
        },

        "patterns": patterns,

        "topology": {

            "nodes": nodes,

            "edges": edges
        },

        "transactions":
            returned_transactions,

        "meta": {

            "max_hops":
                max_hops,

            "max_wallets":
                MAX_WALLETS,

            "truncated_transactions":
                total_transaction_count >
                MAX_RETURN_TRANSACTIONS
        }
    }


# =========================================================
# ROUTES
# =========================================================

@app.get("/")
def root():

    return {
        "name": "TraceX Blockchain Forensics API",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "alchemy_configured": bool(ALCHEMY_API_KEY),
        "engine_version": "2.0-aggregated"
    }


@app.post("/api/v1/engine/trace")
def trace_endpoint(
    request: TraceRequest
):

    wallet = validate_wallet(
        request.wallet_address
    )

    try:

        return trace_wallet(
            wallet,
            request.max_hops
        )

    except HTTPException:

        raise

    except Exception as exc:

        print(
            "TRACE ERROR:",
            repr(exc)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Trace engine failed: "
                f"{str(exc)}"
            )
        )