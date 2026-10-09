-- Up Migration
CREATE TABLE tasks (
  id uuid PRIMARY KEY,
  title text NOT NULL,
  completed boolean NOT NULL
);

-- Down Migration
DROP TABLE tasks;
