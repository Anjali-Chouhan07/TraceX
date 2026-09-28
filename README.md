## Dataset Setup

TraceX uses an exchange-wallet registry to identify known VASP/exchange wallet addresses during blockchain tracing.

The exchange-wallet database is **not stored directly in this GitHub repository** because the database is approximately 700 MB in size.

### Download the Exchange Wallet Database

Download the required database from the following link:

**[Download `exchange_wallets_compact.db`] -- https://drive.google.com/file/d/15Ok3En5IR8qsaLsp_NCVD1IXUXgv-0_h/view?usp=sharing **

After downloading, place the file at:

```text
TraceX/
└── backend/
    └── data/
        └── exchange_wallets_compact.db
```

> **Important:** Rename the downloaded file to `exchange_wallets.db` if the backend is configured to look for `exchange_wallets.db`.

The final structure should be:

```text
TraceX/
├── frontend/
├── backend/
│   ├── data/
│   │   └── exchange_wallets.db
│   ├── main.py
│   ├── requirements.txt
│   └── ...
└── README.md
```

### Running the Backend

Install the required dependencies:

```bash
cd backend
pip install -r requirements.txt
```

Then start the backend:

```bash
uvicorn main:app --reload
```

### Running the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will then be available through the URL shown by Vite.

### Note

The database is provided separately because of its large file size. The GitHub repository contains the application source code and configuration required to run TraceX, while the exchange-wallet registry is downloaded separately.
