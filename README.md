# TraceX

### Blockchain VASP Attribution Platform

TraceX is a blockchain investigation platform that helps Law Enforcement Agencies (LEAs) trace suspicious cryptocurrency transactions and identify the **Virtual Asset Service Provider (VASP)** associated with the movement of illicit funds.

It converts complex wallet-to-wallet transactions into an **interactive fund-flow graph**, analyzes suspicious patterns, and provides actionable VASP attribution.

## Key Features

* **Multi-hop transaction tracing** across blockchain wallets
* **VASP / exchange wallet attribution** using a wallet registry
* **Interactive fund-flow visualization**
* Detection of **fund splitting, forwarding and suspicious movement patterns**
* **Risk scoring** for traced transactions
* Identification of potential **custodial/exchange endpoints**
* Support for **investigation and legal-notice workflows**

## Tech Stack

**Frontend:** React, Vite, Cytoscape.js
**Backend:** Python, FastAPI, NetworkX
**Blockchain:** Alchemy API
**Database:** SQLite
**Storage:** IPFS / Pinata

## Setup


### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Add your Alchemy API key to the backend `.env` file.

## Exchange Database

TraceX uses a large exchange-wallet registry for VASP attribution. The database contains millions of wallet records and is approximately **700 MB**, so it is not included in the GitHub repository.

**[Download Exchange Wallet Database](https://drive.google.com/file/d/15Ok3En5IR8qsaLsp_NCVD1IXUXgv-0_h/view?usp=sharing)**

After downloading, place it at:

```text
backend/data/exchange_wallets.db
```




**TraceX |  VASP Attribution**
