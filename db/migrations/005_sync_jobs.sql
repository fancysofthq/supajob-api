DROP TABLE job_board_mint;

DROP TABLE job_board_mint_fresh;

DROP TABLE job_board_transfer;

DROP TABLE state;

CREATE TABLE
  sync_jobs (
    event_table OID NOT NULL,
    contract_address BLOB(20) NOT NULL COLLATE BINARY,
    contract_deploy_tx_hash BLOB(32) NOT NULL COLLATE BINARY,
    historical_block BIGINT,
    realtime_block BIGINT,
    --
    PRIMARY KEY (event_table, contract_address)
  );
