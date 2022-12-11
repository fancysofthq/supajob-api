CREATE TABLE job_board_mint (
  block_number BIGINT NOT NULL,
  log_index INT NOT NULL,
  tx_hash BLOB (32) NOT NULL COLLATE BINARY,
  contract_address BLOB (20) NOT NULL COLLATE BINARY,
  id BLOB (32) COLLATE BINARY NOT NULL,
  [value] BLOB (32) NOT NULL,
  PRIMARY KEY (block_number, log_index)
);

ALTER TABLE
  [state]
ADD
  job_board_mint_block BIGINT;

CREATE INDEX idx_job_board_mint_contract_address ON job_board_mint (contract_address);

CREATE INDEX idx_job_board_mint_id ON job_board_mint (id);
