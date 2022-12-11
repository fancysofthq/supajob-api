CREATE TABLE job_board_mint_fresh (
  block_number BIGINT NOT NULL,
  log_index INT NOT NULL,
  tx_hash BLOB (32) NOT NULL COLLATE BINARY,
  contract_address BLOB (20) NOT NULL COLLATE BINARY,
  id BLOB (32) COLLATE BINARY NOT NULL,
  codec BLOB (4) NOT NULL,
  author BLOB (20) NOT NULL COLLATE BINARY,
  [value] BLOB (32) NOT NULL,
  PRIMARY KEY (block_number, log_index)
);

ALTER TABLE
  [state]
ADD
  job_board_mint_fresh_block BIGINT;

CREATE INDEX idx_job_board_mint_fresh_contract_address ON job_board_mint_fresh (contract_address);

CREATE INDEX idx_job_board_mint_fresh_id ON job_board_mint_fresh (id);

CREATE INDEX idx_job_board_mint_fresh_author ON job_board_mint_fresh (author);
