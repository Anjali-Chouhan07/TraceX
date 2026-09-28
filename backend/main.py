import os
import re
import sqlite3
import requests
import networkx as nx

from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv


# ============================================================
# CONFIG
# ============================================================

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


ALCHEMY_API_KEY = os.getenv("ALCHEMY_API_KEY")

if not ALCHEMY_API_KEY:
    raise RuntimeError("ALCHEMY_API_KEY missing from .env")

ALCHEMY_URL = (
    f"https://eth-mainnet.g.alchemy.com/v2/{ALCHEMY_API_KEY}"
)

# Local verified exchange registry
DB_PATH = BASE_DIR / "data" / "exchange_wallets.db"

MAX_HOPS = 1
MAX_WALLETS = 5
MAX_TX_PER_WALLET = 10


print(
    "Alchemy URL configured:",
    ALCHEMY_URL[:55] + "..."
)

print(
    "Exchange registry:",
    DB_PATH
)


# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="TraceX Blockchain Intelligence Engine",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# REQUEST MODEL
# ============================================================

class InspectionInput(BaseModel):
    wallet_address: str


# ============================================================
# VERIFIED VASP DIRECTORY
# ============================================================
#
# Keep this for manually verified addresses if needed later.
#
# Example:
#
# VASP_DIRECTORY = {
#     "0x123...": "CoinDCX"
# }
#
# IMPORTANT:
# Do NOT put guessed exchange addresses here.
#

VASP_DIRECTORY = {}


# ============================================================
# ADDRESS VALIDATION
# ============================================================

ETH_ADDRESS_REGEX = re.compile(
    r"^0x[a-fA-F0-9]{40}$"
)


def validate_wallet_address(address: str) -> bool:

    return bool(
        ETH_ADDRESS_REGEX.match(
            address
        )
    )


# ============================================================
# LOCAL SQLITE EXCHANGE RESOLVER
# ============================================================

# ============================================================
# ENTITY RESOLVER & INDEX
# ============================================================

class EntityResolver:
    """
    Reusable resolver and index for all wallet addresses against /data.
    Maintains a persistent SQLite connection and an in-memory cache
    for ultra-fast O(1) repeated lookups across all addresses.
    """
    def __init__(self, db_path: Path):
        self.db_path = db_path
        self._conn = None
        self._cache: dict = {}
        self._init_db()

    def _init_db(self):
        if self.db_path and self.db_path.exists():
            try:
                self._conn = sqlite3.connect(
                    f"file:{self.db_path.resolve()}?mode=ro",
                    uri=True,
                    check_same_thread=False
                )
            except Exception:
                try:
                    self._conn = sqlite3.connect(
                        str(self.db_path),
                        check_same_thread=False
                    )
                except Exception as e:
                    print(f"Error opening exchange registry: {e}")

    def resolve(self, address: str) -> dict:
        if not address:
            return {
                "address": "",
                "label": "Intermediary Wallet",
                "entity_type": "unknown",
                "known": False,
                "entity_resolved": None,
                "type": "Intermediary Wallet",
                "node_class": "intermediary",
                "display_name": "Intermediary Wallet",
                "is_exchange": False,
                "is_mixer": False,
                "attribution_method": "none",
                "source": None,
            }

        norm_address = address.strip().lower()

        if norm_address in self._cache:
            return self._cache[norm_address]

        # 1. In-memory manual directory
        if norm_address in VASP_DIRECTORY:
            entry = VASP_DIRECTORY[norm_address]
            e_name = entry if isinstance(entry, str) else entry.get("name", "Known VASP")
            e_type = "exchange" if isinstance(entry, str) else str(entry.get("type", "exchange")).lower()
            is_ex = (e_type == "exchange")
            is_mx = (e_type == "mixer")
            res = {
                "address": norm_address,
                "label": e_name,
                "entity_type": e_type,
                "known": True,
                "entity_resolved": e_name,
                "type": "Exchange" if is_ex else ("Mixer" if is_mx else "Known Entity"),
                "node_class": "exchange" if is_ex else ("mixer" if is_mx else "intermediary"),
                "display_name": e_name,
                "is_exchange": is_ex,
                "is_mixer": is_mx,
                "attribution_method": "verified_directory",
                "source": "TraceX verified VASP directory",
            }
            self._cache[norm_address] = res
            return res

        # 2. Database lookup using indexed address column
        if self._conn:
            try:
                cur = self._conn.cursor()
                row = cur.execute(
                    """
                    SELECT name, type, wallet_type, coin, network, balance, height, custodian, source
                    FROM exchange_wallets
                    WHERE address = ?
                    LIMIT 1
                    """,
                    (norm_address,)
                ).fetchone()


                if row:
                    (name, entity_type, wallet_type, coin, network, balance, height, custodian, source) = row
                    e_type_lower = str(entity_type or "exchange").lower()
                    is_ex = (
                        e_type_lower == "exchange"
                        or str(wallet_type or "").lower() in ("deposit", "hot", "cold")
                    )
                    is_mx = (e_type_lower == "mixer")
                    label_name = name or ("Known Exchange" if is_ex else "Known Entity")
                    res = {
                        "address": norm_address,
                        "label": label_name,
                        "entity_type": "exchange" if is_ex else ("mixer" if is_mx else e_type_lower),
                        "known": True,
                        "entity_resolved": label_name,
                        "type": "Exchange" if is_ex else ("Mixer" if is_mx else "Known Entity"),
                        "node_class": "exchange" if is_ex else ("mixer" if is_mx else "intermediary"),
                        "display_name": label_name,
                        "is_exchange": is_ex,
                        "is_mixer": is_mx,
                        "attribution_method": "local_registry",
                        "wallet_type": wallet_type,
                        "coin": coin,
                        "network": network,
                        "balance": balance,
                        "height": height,
                        "custodian": custodian,
                        "source": source or "Exchange Registry",
                    }
                    self._cache[norm_address] = res
                    return res
            except Exception as e:
                print(f"Database lookup error for {norm_address}: {e}")

        # 3. Unknown address
        res = {
            "address": norm_address,
            "label": "Intermediary Wallet",
            "entity_type": "unknown",
            "known": False,
            "entity_resolved": None,
            "type": "Unknown",
            "node_class": "intermediary",
            "display_name": "Intermediary Wallet",
            "is_exchange": False,
            "is_mixer": False,
            "attribution_method": "none",
            "source": None,
        }
        self._cache[norm_address] = res
        return res

ENTITY_RESOLVER = EntityResolver(DB_PATH)

def resolve_entity(address: str) -> dict:
    return ENTITY_RESOLVER.resolve(address)


# ============================================================
# ALCHEMY REQUEST
# ============================================================

def get_transfers(wallet, direction):

    wallet = wallet.lower()

    if direction == "outgoing":

        params = [{

            "fromAddress":
                wallet,

            "category": [
                "external",
                "erc20"
            ],

            "withMetadata":
                True,

            "maxCount":
                "0x64"

        }]

    else:

        params = [{

            "toAddress":
                wallet,

            "category": [
                "external",
                "erc20"
            ],

            "withMetadata":
                True,

            "maxCount":
                "0x64"

        }]

    payload = {

        "jsonrpc":
            "2.0",

        "id":
            1,

        "method":
            "alchemy_getAssetTransfers",

        "params":
            params
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

            detail=(
                "Alchemy request failed: "
                + str(e)
            )
        )

    if "error" in data:

        raise HTTPException(

            status_code=502,

            detail=data["error"]
        )

    return (
        data
        .get("result", {})
        .get("transfers", [])
    )


# ============================================================
# NORMALIZE TRANSACTION
# ============================================================

def normalize_transfer(tx):

    source = tx.get("from", "").strip().lower()
    target = tx.get("to", "").strip().lower()

    if source and target:
        src_res = resolve_entity(source)
        tgt_res = resolve_entity(target)
        print(f"API Address: {tx.get('from')} -> {source} -> {'matched' if src_res.get('known') else 'not matched'} -> {src_res.get('label')}")
        print(f"API Address: {tx.get('to')} -> {target} -> {'matched' if tgt_res.get('known') else 'not matched'} -> {tgt_res.get('label')}")

    return {

        "tx_id":
            tx.get("hash"),

        "from":
            source,

        "to":
            target,

        "amount":
            float(
                tx.get("value") or 0
            ),

        "asset":
            tx.get(
                "asset",
                "ETH"
            ),

        "timestamp":
            (
                tx.get(
                    "metadata",
                    {}
                )
                .get(
                    "blockTimestamp"
                )
            ),

        "block":
            tx.get(
                "blockNum"
            )
    }


# ============================================================
# MULTI-HOP TRACE
# ============================================================

def trace_wallet(start_wallet):

    start_wallet = start_wallet.lower()

    graph = nx.DiGraph()

# Always keep the investigation wallet in the graph
# even if Alchemy returns no transfers for it.
    graph.add_node(start_wallet)


    discovered = set()


    queue = [
        (
            start_wallet,
            0
        )
    ]

    all_transactions = []

    global_seen_transactions = set()

    while queue:

        wallet, hop = queue.pop(0)

        if wallet in discovered:
            continue

        if len(discovered) >= MAX_WALLETS:
            break

        discovered.add(wallet)

        if hop > MAX_HOPS:
            continue

        # ----------------------------------------------------
        # OUTGOING
        # ----------------------------------------------------

        outgoing = get_transfers(
            wallet,
            "outgoing"
        )

        # ----------------------------------------------------
        # INCOMING
        # ----------------------------------------------------

        incoming = get_transfers(
            wallet,
            "incoming"
        )

        transfers = (
            outgoing +
            incoming
        )

        seen_tx = set()

        for raw_tx in transfers:

            tx = normalize_transfer(
                raw_tx
            )

            tx_id = tx["tx_id"]

            if not tx_id:
                continue

            # Avoid duplicate transaction
            if tx_id in seen_tx:
                continue

            seen_tx.add(tx_id)

            # Avoid globally processing
            # same transaction repeatedly
            if tx_id in global_seen_transactions:
                continue

            global_seen_transactions.add(
                tx_id
            )

            if (
                not tx["from"]
                or
                not tx["to"]
            ):
                continue

            all_transactions.append(
                tx
            )

            # ------------------------------------------------
            # GRAPH EDGE
            # ------------------------------------------------

            graph.add_edge(

                tx["from"],

                tx["to"],

                tx_id=tx["tx_id"],

                amount=tx["amount"],

                asset=tx["asset"],

                timestamp=tx["timestamp"],

                block=tx["block"]
            )

            # ------------------------------------------------
            # FOLLOW MONEY FORWARD
            # ------------------------------------------------

            next_wallet = tx["to"]
            next_entity = resolve_entity(next_wallet)

            if (
                next_wallet
                not in discovered
                and
                hop < MAX_HOPS
            ):

                queue.append(
                    (
                        next_wallet,
                        hop + 1
                    )
                )

    return (
        graph,
        all_transactions
    )


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

    outgoing_targets = len({

        tx["to"]

        for tx in transactions

        if tx["from"] == wallet
    })

    risk = 0

    reasons = []

    # --------------------------------------------------------
    # High-value movement
    # --------------------------------------------------------

    if max(
        incoming,
        outgoing
    ) >= 50000:

        risk += 20

        reasons.append(
            "High-value fund movement"
        )

    # --------------------------------------------------------
    # Fund splitting
    # --------------------------------------------------------

    if outgoing_targets >= 2:

        risk += 20

        reasons.append(
            "Funds split across multiple destinations"
        )

    # --------------------------------------------------------
    # Forwarding behavior
    # --------------------------------------------------------

    if incoming > 0:

        forwarding_ratio = (
            outgoing /
            incoming
        )

        if forwarding_ratio >= 0.8:

            risk += 25

            reasons.append(
                "Rapid fund forwarding pattern"
            )

    # --------------------------------------------------------
    # Transaction activity
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # Investigation wallet
    # --------------------------------------------------------

    if wallet == start_wallet:

        risk += 10

        reasons.append(
            "Investigation wallet"
        )

    risk = min(
        risk,
        100
    )

    return {

        "score":
            risk,

        "status":
            (
                "High"
                if risk >= 70

                else

                "Medium"
                if risk >= 40

                else

                "Low"
            ),

        "reasons":
            reasons
    }


# ============================================================
# NODE CLASSIFICATION
# ============================================================

def classify_node(
    node,
    searched_wallet,
    entity
):

    node_str = str(node).lower().strip()
    searched_str = str(searched_wallet).lower().strip()
    is_searched = (node_str == searched_str)

    # --------------------------------------------------------
    # 1. Exchange (Verified exchanges get priority)
    # --------------------------------------------------------

    if entity and entity.get(
        "is_exchange",
        False
    ):

        return {

            "type":
                "Known VASP",

            "node_class":
                "exchange",

            "display_name":
                entity.get(
                    "entity_resolved"
                )
                or
                "Known Exchange",

            "is_investigation_wallet":
                is_searched
        }

    # --------------------------------------------------------
    # 2. Investigation wallet (searched address, non-exchange)
    # --------------------------------------------------------

    if is_searched:

        return {

            "type":
                "Investigation Wallet",

            "node_class":
                "investigation",

            "display_name":
                "Investigation Wallet",

            "is_investigation_wallet":
                True
        }

    # --------------------------------------------------------
    # 3. Mixer
    # --------------------------------------------------------

    if entity and entity.get(
        "is_mixer",
        False
    ):

        return {

            "type":
                "Mixer",

            "node_class":
                "mixer",

            "display_name":
                entity.get(
                    "entity_resolved"
                )
                or
                "Mixer",

            "is_investigation_wallet":
                False
        }

    # --------------------------------------------------------
    # 4. Unknown intermediary
    # --------------------------------------------------------

    return {

        "type":
            "Intermediary Wallet",

        "node_class":
            "intermediary",

        "display_name":
            "Intermediary Wallet",

        "is_investigation_wallet":
            False
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

    # --------------------------------------------------------
    # Validate address
    # --------------------------------------------------------

    if not validate_wallet_address(
        wallet
    ):

        raise HTTPException(

            status_code=400,

            detail=(
                "Invalid Ethereum wallet address"
            )
        )

    print("DB_PATH.resolve():", DB_PATH.resolve())
    print("DB_PATH.exists():", DB_PATH.exists())
    print("resolve_entity(wallet):", resolve_entity(wallet))

    # --------------------------------------------------------
    # Trace
    # --------------------------------------------------------

    try:

        graph, transactions = (
            trace_wallet(
                wallet
            )
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

        entity = resolve_entity(
            node
        )

        classification = classify_node(

            node,

            wallet,

            entity
        )

        # ----------------------------------------------------
        # Flow metrics
        # ----------------------------------------------------

        incoming_amount = sum(

            tx["amount"]

            for tx in transactions

            if tx["to"] == node
        )

        outgoing_amount = sum(

            tx["amount"]

            for tx in transactions

            if tx["from"] == node
        )

        incoming_count = sum(

            1

            for tx in transactions

            if tx["to"] == node
        )

        outgoing_count = sum(

            1

            for tx in transactions

            if tx["from"] == node
        )

        counterparties = len({

            (
                tx["from"]
                if tx["to"] == node
                else
                tx["to"]
            )

            for tx in transactions

            if (
                tx["from"] == node
                or
                tx["to"] == node
            )
        })

        # ----------------------------------------------------
        # Hop calculation
        # ----------------------------------------------------

        try:

            hop = nx.shortest_path_length(

                graph,

                wallet,

                node
            )

        except nx.NetworkXNoPath:

            hop = None

        # ----------------------------------------------------
        # Node
        # ----------------------------------------------------

        node_data = {

            "id":
                node,

            "label":
                (
                    node[:10]
                    + "..."
                ),

            "display_name":
                classification[
                    "display_name"
                ],

            "entity_type":
                entity.get("entity_type", "unknown"),

            "known":
                entity.get("known", False),

            "type":
                classification[
                    "type"
                ],

            "node_class":
                classification[
                    "node_class"
                ],

            "address":
                node,

            "full_address":
                node,

            "is_investigation_wallet":
                classification.get(
                    "is_investigation_wallet",
                    node.lower() == wallet.lower()
                ),

            # ----------------------------------------------
            # Entity attribution
            # ----------------------------------------------

            "entity_resolved":
                entity.get(
                    "entity_resolved"
                ),

            "attribution_method":
                entity.get(
                    "attribution_method"
                ),

            "is_exchange":
                entity.get(
                    "is_exchange",
                    False
                ),

            "is_mixer":
                entity.get(
                    "is_mixer",
                    False
                ),

            "source":
                entity.get(
                    "source"
                ),

            # ----------------------------------------------
            # Registry evidence
            # ----------------------------------------------

            "wallet_type":
                entity.get(
                    "wallet_type"
                ),

            "coin":
                entity.get(
                    "coin"
                ),

            "network":
                entity.get(
                    "network"
                ),

            "balance":
                entity.get(
                    "balance"
                ),

            "height":
                entity.get(
                    "height"
                ),

            "custodian":
                entity.get(
                    "custodian"
                ),

            "registry_matches":
                entity.get(
                    "registry_matches"
                ),

            # ----------------------------------------------
            # Risk
            # ----------------------------------------------

            "risk_score":
                risk["score"],

            "risk_status":
                risk["status"],

            "risk_reasons":
                risk["reasons"],

            # ----------------------------------------------
            # Flow
            # ----------------------------------------------

            "hop":
                hop,

            "incoming":
                incoming_amount,

            "outgoing":
                outgoing_amount,

            "incoming_count":
                incoming_count,

            "outgoing_count":
                outgoing_count,

            "flow":
                max(
                    incoming_amount,
                    outgoing_amount
                ),

            "counterparties":
                counterparties
        }

        nodes.append(
            node_data
        )

    # ========================================================
    # EDGES
    # ========================================================

    edges = []

    for tx in transactions:

        edges.append({

            "id":
                tx["tx_id"],

            "source":
                tx["from"],

            "target":
                tx["to"],

            "label":
                (
                    f'{tx["amount"]:,.2f} '
                    f'{tx["asset"]}'
                ),

            "amount":
                tx["amount"],

            "asset":
                tx["asset"],

            "timestamp":
                tx["timestamp"],

            "block":
                tx["block"],

            "tx_hash":
                tx["tx_id"]
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

    # --------------------------------------------------------
    # Exchange attribution summary
    # --------------------------------------------------------

    attributed_exchanges = [

        {
            "wallet":
                node["address"],

            "entity":
                node["entity_resolved"],

            "wallet_type":
                node.get(
                    "wallet_type"
                ),

            "coin":
                node.get(
                    "coin"
                ),

            "network":
                node.get(
                    "network"
                ),

            "source":
                node.get(
                    "source"
                )
        }

        for node in nodes

        if node.get(
            "is_exchange"
        )
    ]

    return {

        "status":
            "success",

        "searched_wallet":
            wallet,

        "summary": {

            "risk_score":
                root_risk["score"],

            "risk_status":
                root_risk["status"],

            "total_nodes":
                len(nodes),

            "total_transactions":
                len(edges),

            "hops_traced":
                MAX_HOPS,

            "total_funds":
                sum(
                    tx["amount"]
                    for tx in transactions
                ),

            "attributed_exchanges":
                len(
                    attributed_exchanges
                )
        },

        "attributions":
            attributed_exchanges,

        "topology": {

            "nodes":
                nodes,

            "edges":
                edges
        }
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/")
async def root():

    return {

        "service":
            "TraceX Blockchain Intelligence Engine",

        "status":
            "online",

        "database":
            str(DB_PATH),

        "database_exists":
            DB_PATH.exists(),

        "max_hops":
            MAX_HOPS
    }