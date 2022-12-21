-- ```solidity
-- event Transfer(
--     address indexed from,
--     address indexed to,
--     uint256 indexed tokenId
-- );
-- ```
CREATE TABLE
  ierc721_transfer (
    block_number BIGINT NOT NULL,
    log_index INT NOT NULL,
    tx_hash BLOB(32) NOT NULL COLLATE BINARY,
    contract_address BLOB(20) NOT NULL COLLATE BINARY,
    --
    "from" BLOB(20) COLLATE BINARY NOT NULL,
    "to" BLOB(20) COLLATE BINARY NOT NULL,
    token_id BLOB(20) NOT NULL,
    --
    PRIMARY KEY (block_number, log_index)
  );

CREATE INDEX idx_ierc721_transfer_from ON ierc721_transfer (contract_address, "from");

CREATE INDEX idx_ierc721_transfer_to ON ierc721_transfer (contract_address, "to");

CREATE INDEX idx_ierc721_transfer_token_id ON ierc721_transfer (contract_address, token_id);
