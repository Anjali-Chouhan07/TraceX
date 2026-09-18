import networkx as nx
import matplotlib.pyplot as plt

# Create directed graph
G = nx.DiGraph()

# Transaction data
transactions = [
    {
        "from": "victim",
        "to": "suspect wallet",
        "amount": 50000,
        "hash": "0xTX001",
        "time": "10:01:15"
    },
    {
        "from": "suspect wallet",
        "to": "Wallet A",
        "amount": 45000,
        "hash": "0xTX002",
        "time": "10:08:32"
    },
    {
        "from": "suspect wallet",
        "to": "Wallet B",
        "amount": 5000,
        "hash": "0xTX003",
        "time": "10:09:11"
    },
    {
        "from": "suspect wallet",
        "to": "Wallet C",
        "amount": 45000,
        "hash": "0xTX004",
        "time": "10:15:47"
    }
]

# Add edges
for tx in transactions:
    G.add_edge(
        tx["from"],
        tx["to"],
        amount=tx["amount"],
        hash=tx["hash"],
        time=tx["time"]
    )

# Position of nodes
pos = {
    "victim": (0, 1),
    "suspect wallet": (1, 1),
    "Wallet A": (2, 1.5),
    "Wallet B": (2, 0.5),
    "Wallet C": (3, 1.5)
}

# Draw nodes
nx.draw_networkx_nodes(
    G,
    pos,
    node_size=2500
)

# Draw edges with arrows
nx.draw_networkx_edges(
    G,
    pos,
    arrows=True,
    arrowsize=25,
    width=2
)

# Node labels
nx.draw_networkx_labels(
    G,
    pos,
    font_size=12,
    font_weight="bold"
)

# Edge labels
edge_labels = {
    (u, v): f'{data["amount"]:,} USDT\n{data["time"]}'
    for u, v, data in G.edges(data=True)
}

nx.draw_networkx_edge_labels(
    G,
    pos,
    edge_labels=edge_labels,
    font_size=9
)

plt.title("Ethereum USDT Transaction Flow - CASE_001")
plt.axis("off")
plt.tight_layout()
plt.show()