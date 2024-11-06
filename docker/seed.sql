DROP TABLE IF EXISTS "user", "message";

CREATE TABLE "user" (
  "id" VARCHAR PRIMARY KEY,
  "name" VARCHAR NOT NULL,
  "partner" BOOLEAN NOT NULL
);


CREATE TABLE "message" (
  "id" VARCHAR PRIMARY KEY,
  "senderID" VARCHAR REFERENCES "user"(id),
  "body" VARCHAR NOT NULL,
  "timestamp" TIMESTAMP not null
);

INSERT INTO "user" (id, name, partner) VALUES ('kl7VbCJgFnEDtjYzWVvLG', 'Aaron', true);
INSERT INTO "user" (id, name, partner) VALUES ('9yTjTd_bOEcdAEMaZaQnm', 'Matt', true);
INSERT INTO "user" (id, name, partner) VALUES ('NL364CcMWJOHJmW3F8SA5', 'Cesar', true);
INSERT INTO "user" (id, name, partner) VALUES ('LDESzYOQ_EJle-JMmbgfa', 'Erik', true);
INSERT INTO "user" (id, name, partner) VALUES ('-3zDBOqvOGHFk1oxwqP6M', 'Greg', true);
INSERT INTO "user" (id, name, partner) VALUES ('BOSqEnk6F1mZdruYODCgI', 'Darick', true);
INSERT INTO "user" (id, name, partner) VALUES ('oT5FYmOSE8DeCZPKmommo', 'Alex', true);
INSERT INTO "user" (id, name, partner) VALUES ('ucetT7aa38S8BUbjfQsu0', 'Dax', false);
INSERT INTO "user" (id, name, partner) VALUES ('GApvKwUp9QEtw_zeOyB1I', 'Nate', false);


