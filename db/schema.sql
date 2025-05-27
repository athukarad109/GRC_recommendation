-- Create organizations table
CREATE TABLE organizations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  sector JSONB,
  locations JSONB,
  customer_locations JSONB,
  data_types JSONB,
  infrastructure JSONB,
  customer_type VARCHAR(50),
  org_size VARCHAR(50),
  revenue VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Update organizations table to include password
ALTER TABLE organizations ADD COLUMN password VARCHAR(255) NOT NULL;
ALTER TABLE organizations ADD COLUMN reset_token VARCHAR(255);
ALTER TABLE organizations ADD COLUMN reset_token_expires TIMESTAMP WITH TIME ZONE;

-- Create recommendations table
CREATE TABLE recommendations (
  id SERIAL PRIMARY KEY,
  org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  required_frameworks JSONB,
  recommended_frameworks JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX idx_recommendations_org_id ON recommendations(org_id);
