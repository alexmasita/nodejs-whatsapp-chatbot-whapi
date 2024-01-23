const ensureTableSchema = require("./utils/ensureTableSchema");

async function setupTables() {
  // Define the table schemas - updated
  const tableSchemas = [
    {
      tableName: "users",
      columnDataTypes: {
        id: "SERIAL",
        name: "VARCHAR(255)",
        international_code: "VARCHAR(5)",
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
        recipient_international_code: "VARCHAR(5)",
        recipient_phone_number: "VARCHAR(15)",
        description: "VARCHAR(255)",
        chat_id: "VARCHAR(255)",
        is_deleted: "BOOLEAN DEFAULT false",
      },
      primaryKey: { columns: ["id"], type: "SERIAL" },
      tableConstraints: [],
    },
    {
      tableName: "group_memberships",
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
        international_code: "VARCHAR(5)",
        phone_number: "VARCHAR(255) UNIQUE NOT NULL",
        code: "VARCHAR(6) NOT NULL",
        created_at: "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP",
      },
      primaryKey: { columns: ["id"], type: "SERIAL" },
      tableConstraints: [],
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

  // Loop through each table schema and ensure its schema
  for (const schema of tableSchemas) {
    await ensureTableSchema(
      schema.tableName,
      schema.columnDataTypes,
      schema.primaryKey,
      schema.tableConstraints
    );
    console.log(`Table schema ensured for ${schema.tableName}`);
  }

  console.log("All table schemas ensured.");
}

module.exports = { setupTables };
