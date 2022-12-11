CREATE TABLE job_board_transfer (
  block_number BIGINT NOT NULL,
  log_index INT NOT NULL,
  sub_index INT NOT NULL DEFAULT 0,
  tx_hash BLOB (32) NOT NULL COLLATE BINARY,
  contract_address BLOB (20) NOT NULL COLLATE BINARY,
  operator BLOB (20) NOT NULL COLLATE BINARY,
  [from] BLOB (20) NOT NULL COLLATE BINARY,
  [to] BLOB (20) NOT NULL COLLATE BINARY,
  id BLOB (32) COLLATE BINARY NOT NULL,
  [value] BLOB (32) NOT NULL,
  PRIMARY KEY (block_number, log_index, sub_index)
);

ALTER TABLE
  [state]
ADD
  job_board_transfer_single_block BIGINT;

ALTER TABLE
  [state]
ADD
  job_board_transfer_batch_block BIGINT;

CREATE INDEX idx_job_board_transfer_contract_address ON job_board_transfer (contract_address);

CREATE INDEX idx_job_board_transfer_operator ON job_board_transfer (operator);

CREATE INDEX idx_job_board_transfer_from ON job_board_transfer ([from]);

CREATE INDEX idx_job_board_transfer_to ON job_board_transfer ([to]);
