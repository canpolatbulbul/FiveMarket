CREATE TABLE IF NOT EXISTS "User"(
  userID      SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS Freelancer(
  userID      INTEGER PRIMARY KEY REFERENCES "User"(userID),
  totalEarned NUMERIC(10,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Service(
  serviceID   SERIAL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  freelancerID INTEGER NOT NULL REFERENCES Freelancer(userID)
);

CREATE TABLE IF NOT EXISTS Package(
  packageID   SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  price       NUMERIC(10,2) NOT NULL CHECK (price > 0),
  deliveryDays INT,
  serviceID   INTEGER NOT NULL REFERENCES Service(serviceID)
);
