CREATE TABLE [state] (
  -- The last migration that was run successfully.
  migration INT NOT NULL,
  -- When the last migration was run, in UTC.
  migrated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
