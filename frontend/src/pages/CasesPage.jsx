import React, {
  useMemo,
  useState
} from "react";

import CytoscapeComponent from "react-cytoscapejs";

import "./CasesPage.css";


function shortenAddress(address) {

  if (!address) return "Unknown";

  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}


function formatAmount(amount) {

  const value = Number(amount || 0);

  return value.toLocaleString(
    undefined,
    {
      maximumFractionDigits: 8
    }
  );
}


function formatTime(timestamp) {

  if (!timestamp) return "Unknown";

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return date.toLocaleString(
    undefined,
    {
      dateStyle: "short",
      timeStyle: "short"
    }
  );
}


function riskClass(status) {

  if (status === "High") {
    return "risk-high";
  }

  if (status === "Medium") {
    return "risk-medium";
  }

  return "risk-low";
}


function riskColor(status) {

  if (status === "High") {
    return "#ef4444";
  }

  if (status === "Medium") {
    return "#f59e0b";
  }

  return "#22c55e";
}


function getNodeType(node) {

  if (!node) {
    return "Unknown";
  }

  if (
    node.type ===
    "Investigation Wallet"
  ) {
    return "Investigation Wallet";
  }

  return node.type || "Wallet";
}


export default function CasesPage() {

  const [walletAddress, setWalletAddress] =
    useState("");

  const [result, setResult] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [selectedNode, setSelectedNode] =
    useState(null);

  const [selectedEdge, setSelectedEdge] =
    useState(null);


  // =====================================================
  // DATA
  // =====================================================

  const summary =
    result?.summary || {};

  const topology =
    result?.topology || {};

  const nodes =
    topology.nodes || [];

  const edges =
    topology.edges || [];

  const transactions =
    result?.transactions || [];

  const patterns =
    result?.patterns || [];


  // =====================================================
  // FIND TARGET NODE
  // =====================================================

  const targetNode = useMemo(() => {

    if (!walletAddress) {
      return null;
    }

    const normalized =
      walletAddress
        .trim()
        .toLowerCase();

    return nodes.find(
      node =>
        node.id.toLowerCase() ===
        normalized
    ) || null;

  }, [
    nodes,
    walletAddress
  ]);


  // =====================================================
  // SELECTED NODE DATA
  // =====================================================

  const selectedNodeData =
    useMemo(() => {

      if (!selectedNode) {
        return targetNode;
      }

      return (
        nodes.find(
          node =>
            node.id === selectedNode
        ) || targetNode
      );

    }, [
      selectedNode,
      nodes,
      targetNode
    ]);


  // =====================================================
  // FILTERED TRANSACTIONS
  // =====================================================

  const visibleTransactions =
    useMemo(() => {

      if (!selectedNode) {
        return transactions;
      }

      return transactions.filter(
        tx =>
          tx.source === selectedNode ||
          tx.target === selectedNode
      );

    }, [
      transactions,
      selectedNode
    ]);


  // =====================================================
  // GRAPH ELEMENTS
  // =====================================================

  const graphElements =
    useMemo(() => {

      const nodeElements =
        nodes.map(node => {

          const isTarget =
            walletAddress &&
            node.id.toLowerCase() ===
            walletAddress
              .trim()
              .toLowerCase();

          const risk =
            riskColor(
              node.risk_status
            );

          return {
            data: {
              id: node.id,

              label: isTarget
                ? `INVESTIGATION\n${node.label}`
                : `${node.label}\nRisk ${node.risk_score}`,

              color: isTarget
                ? "#2563eb"
                : risk,

              borderColor: isTarget
                ? "#1d4ed8"
                : "#ffffff",

              isTarget: isTarget
                ? "true"
                : "false"
            }
          };
        });


      const edgeElements =
        edges.map(edge => {

          return {
            data: {

              id: edge.id,

              source:
                edge.source,

              target:
                edge.target,

              label:
                edge.label
            }
          };

        });


      return [
        ...nodeElements,
        ...edgeElements
      ];

    }, [
      nodes,
      edges,
      walletAddress
    ]);


  // =====================================================
  // GRAPH LAYOUT
  // =====================================================

  const graphLayout = {

    name: "breadthfirst",

    directed: true,

    roots: walletAddress
      ? [
          walletAddress
            .trim()
            .toLowerCase()
        ]
      : undefined,

    padding: 80,

    spacingFactor: 1.7,

    avoidOverlap: true,

    animate: false,

    fit: true
  };


  // =====================================================
  // GRAPH STYLE
  // =====================================================

  const graphStyle = [

    {
      selector: "node",

      style: {

        "background-color":
          "data(color)",

        "border-color":
          "data(borderColor)",

        "border-width": 4,

        "width": 68,

        "height": 68,

        "label":
          "data(label)",

        "color": "#0f172a",

        "font-size": 10,

        "font-weight": 700,

        "text-valign": "center",

        "text-halign": "center",

        "text-wrap": "wrap",

        "text-max-width": 90,

        "overlay-opacity": 0
      }
    },


    {
      selector: "node:selected",

      style: {

        "border-width": 6,

        "border-color":
          "#111827",

        "width": 78,

        "height": 78
      }
    },


    {
      selector: "edge",

      style: {

        "width": 2.5,

        "line-color":
          "#94a3b8",

        "target-arrow-color":
          "#64748b",

        "target-arrow-shape":
          "triangle",

        "curve-style":
          "bezier",

        "label":
          "data(label)",

        "font-size": 9,

        "font-weight": 700,

        "color": "#334155",

        "text-background-color":
          "#ffffff",

        "text-background-opacity":
          0.95,

        "text-background-padding":
          4,

        "text-rotation":
          "autorotate"
      }
    },


    {
      selector: "edge:selected",

      style: {

        "width": 5,

        "line-color":
          "#2563eb",

        "target-arrow-color":
          "#2563eb"
      }
    }

  ];


  // =====================================================
  // RUN TRACE
  // =====================================================

  async function runInvestigation() {

    const wallet =
      walletAddress.trim();

    setError("");

    setSelectedNode(null);

    setSelectedEdge(null);

    if (!wallet) {

      setError(
        "Enter an Ethereum wallet address."
      );

      return;
    }


    if (
      !/^0x[a-fA-F0-9]{40}$/.test(
        wallet
      )
    ) {

      setError(
        "Invalid Ethereum wallet address."
      );

      return;
    }


    try {

      setLoading(true);

      const response =
        await fetch(
          "/api/v1/engine/trace",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              wallet_address: wallet,
              max_hops: 3
            })
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Trace request failed."
        );
      }


      setResult(data);

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Unable to connect to TraceX backend."
      );

      setResult(null);

    } finally {

      setLoading(false);
    }
  }


  // =====================================================
  // ENTER KEY
  // =====================================================

  function handleKeyDown(event) {

    if (
      event.key === "Enter"
    ) {

      runInvestigation();
    }
  }


  // =====================================================
  // GRAPH CALLBACK
  // =====================================================

  function handleCy(cy) {

    cy.on(
      "tap",
      "node",
      event => {

        const nodeId =
          event.target.id();

        setSelectedNode(
          nodeId
        );

        setSelectedEdge(null);
      }
    );


    cy.on(
      "tap",
      "edge",
      event => {

        const edgeId =
          event.target.id();

        setSelectedEdge(
          edgeId
        );

        setSelectedNode(null);
      }
    );
  }


  // =====================================================
  // SELECTED EDGE
  // =====================================================

  const selectedEdgeData =
    edges.find(
      edge =>
        edge.id === selectedEdge
    );


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="tracex-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="tracex-header">

        <div>

          <div className="tracex-brand">
            TraceX
          </div>

          <div className="tracex-subtitle">
            Blockchain Forensic Investigation Engine
          </div>

        </div>


        <div className="live-indicator">

          <span className="live-dot"></span>

          LIVE BLOCKCHAIN DATA

        </div>

      </div>


      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="search-panel">

        <div className="search-label">
          INVESTIGATION WALLET
        </div>


        <div className="search-row">

          <input
            type="text"
            value={walletAddress}
            onChange={
              event =>
                setWalletAddress(
                  event.target.value
                )
            }
            onKeyDown={
              handleKeyDown
            }
            placeholder="Enter Ethereum wallet address 0x..."
            className="wallet-input"
          />


          <button
            className="trace-button"
            onClick={
              runInvestigation
            }
            disabled={loading}
          >

            {loading
              ? "TRACING..."
              : "TRACE FUNDS"
            }

          </button>

        </div>


        {error && (

          <div className="error-box">
            {error}
          </div>

        )}

      </div>


      {/* =================================================
          EMPTY STATE
      ================================================= */}

      {!result && !loading && (

        <div className="empty-state">

          <div className="empty-icon">
            ◎
          </div>

          <h2>
            Ready for Investigation
          </h2>

          <p>
            Enter an Ethereum wallet address
            to reconstruct its transaction
            flow across multiple hops.
          </p>

          <div className="empty-flow">

            <span>
              Wallet
            </span>

            <span>→</span>

            <span>
              Fund Trail
            </span>

            <span>→</span>

            <span>
              Risk Analysis
            </span>

            <span>→</span>

            <span>
              Evidence
            </span>

          </div>

        </div>

      )}


      {loading && (

        <div className="loading-state">

          <div className="loader"></div>

          <h3>
            Reconstructing fund flow...
          </h3>

          <p>
            Fetching blockchain transfers and
            analysing forward hops.
          </p>

        </div>

      )}


      {/* =================================================
          RESULTS
      ================================================= */}

      {result && !loading && (

        <>

          {/* =================================================
              KPI CARDS
          ================================================= */}

          <div className="kpi-grid">


            <div className="kpi-card">

              <div className="kpi-label">
                RISK SCORE
              </div>

              <div
                className={`kpi-value ${riskClass(
                  summary.risk_status
                )}`}
              >

                {summary.risk_score}

                <span>
                  /100
                </span>

              </div>

              <div
                className={`status-pill ${riskClass(
                  summary.risk_status
                )}`}
              >
                {summary.risk_status}
              </div>

            </div>


            <div className="kpi-card">

              <div className="kpi-label">
                TRACED VOLUME
              </div>

              <div className="kpi-value">

                {formatAmount(
                  summary.total_funds
                )}

              </div>

              <div className="kpi-small">

                {summary.total_funds_asset}

              </div>

            </div>


            <div className="kpi-card">

              <div className="kpi-label">
                WALLET NODES
              </div>

              <div className="kpi-value">

                {summary.total_nodes}

              </div>

              <div className="kpi-small">
                Unique addresses
              </div>

            </div>


            <div className="kpi-card">

              <div className="kpi-label">
                TRANSACTIONS
              </div>

              <div className="kpi-value">

                {summary.total_transactions}

              </div>

              <div className="kpi-small">

                {summary.transactions_returned}
                {" "}
                displayed

              </div>

            </div>


            <div className="kpi-card">

              <div className="kpi-label">
                HOPS TRACED
              </div>

              <div className="kpi-value">

                {summary.hops_traced}

              </div>

              <div className="kpi-small">
                Forward trace depth
              </div>

            </div>


          </div>


          {/* =================================================
              MAIN INVESTIGATION AREA
          ================================================= */}

          <div className="investigation-grid">


            {/* =================================================
                GRAPH
            ================================================= */}

            <section className="panel graph-panel">

              <div className="panel-header">

                <div>

                  <h2>
                    Fund Flow Graph
                  </h2>

                  <p>
                    Incoming activity and
                    forward transaction hops
                  </p>

                </div>


                <div className="graph-legend">

                  <span>
                    <i className="legend-blue"></i>
                    Investigation
                  </span>

                  <span>
                    <i className="legend-green"></i>
                    Low
                  </span>

                  <span>
                    <i className="legend-orange"></i>
                    Medium
                  </span>

                  <span>
                    <i className="legend-red"></i>
                    High
                  </span>

                </div>

              </div>


              <div className="graph-container">

                <CytoscapeComponent
                  elements={
                    graphElements
                  }

                  layout={
                    graphLayout
                  }

                  stylesheet={
                    graphStyle
                  }

                  style={{
                    width: "100%",
                    height: "600px"
                  }}

                  cy={
                    handleCy
                  }

                  wheelSensitivity={
                    0.2
                  }

                  minZoom={
                    0.25
                  }

                  maxZoom={
                    3
                  }
                />

              </div>


              <div className="graph-footer">

                <span>
                  {nodes.length} nodes
                </span>

                <span>
                  {edges.length} aggregated fund paths
                </span>

                <span>
                  {transactions.length} transactions loaded
                </span>

              </div>

            </section>


            {/* =================================================
                NODE TELEMETRY
            ================================================= */}

            <section className="panel telemetry-panel">

              <div className="panel-header">

                <div>

                  <h2>
                    Node Intelligence
                  </h2>

                  <p>
                    Selected wallet telemetry
                  </p>

                </div>

              </div>


              {selectedNodeData ? (

                <div className="node-detail">


                  <div className="node-address">

                    <div className="node-icon">
                      ◉
                    </div>

                    <div>

                      <div className="address-label">
                        WALLET
                      </div>

                      <div className="address-value">
                        {shortenAddress(
                          selectedNodeData.id
                        )}
                      </div>

                    </div>

                  </div>


                  <div
                    className={`node-risk ${riskClass(
                      selectedNodeData.risk_status
                    )}`}
                  >

                    <div>

                      <div className="address-label">
                        HEURISTIC RISK
                      </div>

                      <div className="node-risk-score">
                        {selectedNodeData.risk_score}
                        <span>
                          /100
                        </span>
                      </div>

                    </div>


                    <div className="status-pill">

                      {selectedNodeData.risk_status}

                    </div>

                  </div>


                  <div className="detail-row">

                    <span>
                      Classification
                    </span>

                    <strong>
                      {getNodeType(
                        selectedNodeData
                      )}
                    </strong>

                  </div>


                  <div className="detail-row">

                    <span>
                      Entity
                    </span>

                    <strong>
                      {
                        selectedNodeData
                          .entity_resolved
                      }
                    </strong>

                  </div>


                  <div className="detail-row">

                    <span>
                      Hop
                    </span>

                    <strong>
                      {selectedNodeData.hop}
                    </strong>

                  </div>


                  <div className="node-stat-grid">

                    <div>

                      <span>
                        Incoming
                      </span>

                      <strong>
                        {
                          selectedNodeData
                            .incoming_count
                        }
                      </strong>

                    </div>


                    <div>

                      <span>
                        Outgoing
                      </span>

                      <strong>
                        {
                          selectedNodeData
                            .outgoing_count
                        }
                      </strong>

                    </div>


                    <div>

                      <span>
                        Counterparties
                      </span>

                      <strong>
                        {
                          selectedNodeData
                            .counterparty_count
                        }
                      </strong>

                    </div>


                    <div>

                      <span>
                        Forwarding
                      </span>

                      <strong>
                        {
                          selectedNodeData
                            .forwarding_ratio
                        }%
                      </strong>

                    </div>

                  </div>


                  <div className="reasons-section">

                    <div className="section-mini-title">
                      RISK INDICATORS
                    </div>


                    {
                      (
                        selectedNodeData
                          .risk_reasons ||
                        []
                      ).map(
                        (reason, index) => (

                          <div
                            className="reason-item"
                            key={index}
                          >

                            <span>
                              •
                            </span>

                            {reason}

                          </div>

                        )
                      )
                    }

                  </div>


                </div>

              ) : (

                <div className="no-selection">

                  Click a wallet in the graph
                  to inspect it.

                </div>

              )}

            </section>

          </div>


          {/* =================================================
              PATTERN ANALYSIS
          ================================================= */}

          <section className="panel patterns-panel">

            <div className="panel-header">

              <div>

                <h2>
                  Pattern Analysis
                </h2>

                <p>
                  Rule-based indicators detected
                  from the traced transaction flow
                </p>

              </div>

            </div>


            <div className="patterns-grid">

              {
                patterns.map(
                  (pattern, index) => (

                    <div
                      className="pattern-card"
                      key={index}
                    >

                      <div
                        className={`pattern-severity ${riskClass(
                          pattern.severity
                        )}`}
                      >
                        {pattern.severity}
                      </div>

                      <h3>
                        {pattern.name}
                      </h3>

                      <p>
                        {pattern.detail}
                      </p>

                    </div>

                  )
                )
              }

            </div>

          </section>


          {/* =================================================
              ASSET BREAKDOWN
          ================================================= */}

          <section className="panel">

            <div className="panel-header">

              <div>

                <h2>
                  Asset Flow
                </h2>

                <p>
                  Transfer volume grouped by asset
                </p>

              </div>

            </div>


            <div className="asset-list">

              {
                Object.entries(
                  summary.funds_by_asset ||
                  {}
                ).map(
                  (
                    [asset, amount]
                  ) => (

                    <div
                      className="asset-row"
                      key={asset}
                    >

                      <div className="asset-name">
                        {asset}
                      </div>

                      <div className="asset-value">
                        {formatAmount(
                          amount
                        )}
                      </div>

                    </div>

                  )
                )
              }

            </div>

          </section>


          {/* =================================================
              TRANSACTION TABLE
          ================================================= */}

          <section className="panel transactions-panel">

            <div className="panel-header">

              <div>

                <h2>
                  Transaction Evidence
                </h2>

                <p>

                  {
                    selectedNode
                      ? `Transactions involving ${shortenAddress(
                          selectedNode
                        )}`
                      : "All transactions returned by the trace engine"
                  }

                </p>

              </div>


              <div className="transaction-count">

                {visibleTransactions.length}

              </div>

            </div>


            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>

                    <th>
                      Time
                    </th>

                    <th>
                      From
                    </th>

                    <th>
                      To
                    </th>

                    <th>
                      Amount
                    </th>

                    <th>
                      Asset
                    </th>

                    <th>
                      Hop
                    </th>

                    <th>
                      TX
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {
                    visibleTransactions.map(
                      tx => (

                        <tr
                          key={
                            tx.id
                          }
                        >

                          <td>
                            {formatTime(
                              tx.timestamp
                            )}
                          </td>

                          <td className="mono">

                            {shortenAddress(
                              tx.source
                            )}

                          </td>

                          <td className="mono">

                            {shortenAddress(
                              tx.target
                            )}

                          </td>

                          <td className="amount-cell">

                            {formatAmount(
                              tx.amount
                            )}

                          </td>

                          <td>

                            <span className="asset-badge">

                              {tx.asset}

                            </span>

                          </td>

                          <td>

                            <span className="hop-badge">

                              {tx.hop}

                            </span>

                          </td>

                          <td>

                            {
                              tx.hash
                                ? (
                                  <a
                                    href={`https://etherscan.io/tx/${tx.hash}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="tx-link"
                                  >
                                    View
                                  </a>
                                )
                                : "N/A"
                            }

                          </td>

                        </tr>

                      )
                    )
                  }


                  {
                    visibleTransactions.length ===
                    0 && (

                      <tr>

                        <td
                          colSpan="7"
                          className="no-data"
                        >

                          No transactions found.

                        </td>

                      </tr>

                    )
                  }

                </tbody>

              </table>

            </div>


            {
              summary.volume_note && (

                <div className="volume-note">

                  {summary.volume_note}

                </div>

              )
            }

          </section>


        </>

      )}

    </div>

  );

}