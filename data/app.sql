DROP TABLE IF EXISTS "account_right";

CREATE TABLE
    "account_right" (
        "account_id" INTEGER,
        "right_id" INTEGER,
        PRIMARY KEY("account_id", "right_id"),
        FOREIGN KEY("right_id") REFERENCES "rights"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );

DROP TABLE IF EXISTS "accounts";

CREATE TABLE
    "accounts" (
        "id" INTEGER,
        "is_admin" INTEGER DEFAULT 0,
        "name" TEXT NOT NULL UNIQUE,
        "postal_address" TEXT NOT NULL DEFAULT '',
        "gsm" TEXT NOT NULL DEFAULT '',
        "email" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "first_connexion" INTEGER DEFAULT 1,
        "active" INTEGER DEFAULT 0,
        "partner_id" INTEGER DEFAULT 0,
        "access_token" TEXT NOT NULL DEFAULT '',
        "passwordlost_token" TEXT NOT NULL DEFAULT '',
        "activation_token" TEXT NOT NULL DEFAULT '',
        "avatar_url" TEXT DEFAULT NULL,
        "description" TEXT DEFAULT '',
        PRIMARY KEY("id" AUTOINCREMENT)
    );

DROP TABLE IF EXISTS "rights";

CREATE TABLE
    "rights" (
        "id" INTEGER,
        "name" TEXT NOT NULL UNIQUE,
        "is_default" INTEGER DEFAULT 0,
        PRIMARY KEY("id" AUTOINCREMENT)
    );

INSERT INTO
    "rights" ("name", "is_default")
VALUES ("Gérer les plannings", 1);

INSERT INTO
    "rights" ("name", "is_default")
VALUES (
        "Accès aux cours collectifs en ligne",
        1
    );

INSERT INTO
    "rights" ("name", "is_default")
VALUES ("Inscription en ligne", 1);

INSERT INTO
    "rights" ("name", "is_default")
VALUES ("Ouverture de nuit", 0);

INSERT INTO
    "rights" ("name", "is_default")
VALUES ("Abonnements 'premiums'", 0);

INSERT INTO
    "rights" ("name", "is_default")
VALUES (
        "Rédaction d'une lettre d'informations mensuelle",
        0
    );

INSERT INTO
    "accounts" (
        "is_admin",
        "name",
        "email",
        "password",
        "first_connexion",
        "active",
        "description"
    )
VALUES (
        1,
        "Administrateur",
        "admin@credible.fr",
        "sha1$4f898a92$1$a46c4e4b05aff0d8dcbf7b393dd7c593f0a65d0d",
        0,
        1,
        "Premier compte administrateur."
    );