// tableSetup.js
const ensureTableSchema = require("./utils/ensureTableSchema");

async function setupTables() {
  // Define the table schemas
  const tableSchemas = [
    {
      tableName: "sessions",
      columnDataTypes: {
        sid: "VARCHAR(255)",
        sess: "JSON NOT NULL",
        expire: "TIMESTAMPTZ NOT NULL",
      },
      primaryKey: { columns: ["sid"], type: "VARCHAR(255)" },
      tableConstraints: [],
    },
    {
      tableName: "verification_codes",
      columnDataTypes: {
        id: "SERIAL",
        phone_number: "VARCHAR(255) UNIQUE NOT NULL",
        code: "VARCHAR(6) NOT NULL",
        created_at: "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP",
      },
      primaryKey: { columns: ["id"], type: "SERIAL" },
      tableConstraints: [],
    },
    {
      tableName: "users",
      columnDataTypes: {
        id: "SERIAL",
        name: "VARCHAR(255)",
        phone_number: "VARCHAR(15) UNIQUE",
        is_deleted: "BOOLEAN DEFAULT false",
      },
      primaryKey: { columns: ["id"], type: "SERIAL" },
      tableConstraints: [],
    },
    {
      tableName: "groups",
      columnDataTypes: {
        id: "SERIAL",
        your_user_id: "INTEGER REFERENCES users(id)",
        recipient_phone_number: "VARCHAR(15)",
        description: "VARCHAR(255)",
        chat_id: "VARCHAR(255)",
        is_deleted: "BOOLEAN DEFAULT false",
      },
      primaryKey: { columns: ["id"], type: "SERIAL" },
      tableConstraints: [],
    },
    {
      tableName: "user_roles",
      columnDataTypes: {
        id: "SERIAL",
        user_id: "INTEGER REFERENCES users(id)",
        group_id: "INTEGER REFERENCES groups(id)",
        role: "VARCHAR(50) DEFAULT 'donor'",
      },
      primaryKey: { columns: ["id"], type: "SERIAL" },
      tableConstraints: [
        { type: "PRIMARY KEY", columns: ["user_id", "group_id"] },
      ],
    },
    {
      tableName: "donations",
      columnDataTypes: {
        id: "SERIAL",
        user_id: "INTEGER REFERENCES users(id)",
        group_id: "INTEGER REFERENCES groups(id)",
        amount: "DECIMAL",
        donation_date: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        is_deleted: "BOOLEAN DEFAULT false",
      },
      primaryKey: { columns: ["id"], type: "SERIAL" },
      tableConstraints: [],
    },
  ];

  // Use Promise.all to ensure all table schemas are checked/created
  await Promise.all(
    tableSchemas.map((schema) =>
      ensureTableSchema(
        schema.tableName,
        schema.columnDataTypes,
        schema.primaryKey,
        schema.tableConstraints
      )
    )
  );

  console.log("All table schemas ensured.");
}

module.exports = { setupTables };
