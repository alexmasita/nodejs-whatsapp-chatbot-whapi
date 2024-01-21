const pgp = require("pg-promise")();
require("dotenv").config();
// const db = pgp(process.env.DATABASE_URL);

const { dbInstance: db } = require("../db");
/**
 * Possible data types that can be passed into the function:
 * 'text', 'integer', 'bigint', 'serial', 'bigserial', 'smallint',
 * 'decimal', 'numeric', 'real', 'double precision', 'boolean', 'date',
 * 'timestamp', 'timestamptz', 'time', 'timetz', 'interval', and more.
 */

/**
 * Possible primary key types that can be passed into the function:
 * 'serial' (auto-incrementing integer), 'bigserial' (auto-incrementing bigint),
 * 'smallserial' (auto-incrementing smallint), 'integer', 'bigint', 'smallint',
 * 'text', 'uuid', and more.
 */

/**
 * Possible table constraint types that can be passed into the function:
 * 'unique', 'primary key', 'foreign key', 'check', and 'exclude'.
 *
 * Example:
 * const tableConstraints = [
 *   { type: 'unique', columns: ['column1', 'column2'] },
 *   { type: 'foreign key', columns: ['column3'], references: { table: 'other_table', columns: ['other_column'] } },
 *   // Add more constraints as needed
 * ];
 */

/**
 * Function to ensure table schema matches the given insert or update statement
 * @param {string} tableName - The name of the table.
 * @param {Object} columnDataTypes - An object where keys are column names, and values are the desired data types.
 * @param {Object} primaryKey - An object specifying the primary key column and its type.
 *                             For composite primary key, include multiple columns in the object.
 * @param {Array<Object>} tableConstraints - An array of objects specifying additional table constraints.
 * @returns {Promise<void>} - Resolves after ensuring the schema.
 */

//Ensure table updated
async function ensureTableSchema(
  tableName,
  columnDataTypes = {},
  primaryKey = {},
  tableConstraints = []
) {
  try {
    // Check if the table exists
    const tableExists = await db.oneOrNone(
      `SELECT to_regclass('${tableName}') as table_name`
    );

    if (!tableExists.table_name) {
      // Table does not exist, create it
      await createTable(
        tableName,
        columnDataTypes,
        primaryKey,
        tableConstraints
      );
    } else {
      // Fetch existing table structure
      const existingColumns = await db.any(
        `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${tableName}'`
      );

      // Compare existing columns with provided columnDataTypes
      const changes = [];
      for (const [column, dataType] of Object.entries(columnDataTypes)) {
        const existingColumn = existingColumns.find(
          (ec) => ec.column_name === column
        );

        // If the column doesn't exist or data type is different, mark it for change
        if (!existingColumn || existingColumn.data_type !== dataType) {
          changes.push(column);
        }
      }

      if (changes.length > 0) {
        // Recreate the table with the new schema
        await recreateTable(
          tableName,
          columnDataTypes,
          primaryKey,
          tableConstraints
        );
      }

      // Continue with other operations if the table schema is unchanged
      // ... (rest of the existing code)
    }
  } catch (error) {
    console.error(`Error ensuring table schema for ${tableName}:`, error);
    throw error;
  }
}

// Function to recreate a table with a new schema
async function recreateTable(
  tableName,
  columnDataTypes = {},
  primaryKey = {},
  tableConstraints = []
) {
  try {
    // Drop the existing table with CASCADE to drop dependent objects
    await db.none(`DROP TABLE IF EXISTS ${tableName} CASCADE`);

    // Create the new table
    await createTable(tableName, columnDataTypes, primaryKey, tableConstraints);
  } catch (error) {
    console.error(`Error recreating table ${tableName}:`, error);
    throw error;
  }
}

/**
 * Function to create a new table
 * @param {string} tableName - The name of the table.
 * @param {Object} columnDataTypes - An object where keys are column names, and values are the desired data types.
 * @param {Object} primaryKey - An object specifying the primary key column and its type.
 *                             For composite primary key, include multiple columns in the object.
 * @param {Array<Object>} tableConstraints - An array of objects specifying additional table constraints.
 * @returns {Promise<void>} - Resolves after creating the table.
 */

async function createTable(
  tableName,
  columnDataTypes = {},
  primaryKey = {},
  tableConstraints = []
) {
  try {
    // Build the CREATE TABLE statement
    let createTableStatement = `CREATE TABLE IF NOT EXISTS ${tableName} (`;

    // Add columns and data types
    const columnDefinitions = [];
    for (const [column, dataType] of Object.entries(columnDataTypes)) {
      columnDefinitions.push(`${column} ${dataType}`);
    }

    // Add primary key
    const { columns: primaryKeyColumns } = primaryKey;
    if (
      primaryKeyColumns &&
      Array.isArray(primaryKeyColumns) &&
      primaryKeyColumns.length > 0
    ) {
      const primaryKeyConstraintColumns = primaryKeyColumns.join(", ");
      columnDefinitions.push(`PRIMARY KEY (${primaryKeyConstraintColumns})`);
    }

    createTableStatement += columnDefinitions.join(", ");
    createTableStatement += ")";

    // Execute the CREATE TABLE statement
    await db.none(createTableStatement);

    // Handle additional table constraints
    for (let constraint of tableConstraints) {
      const { type, columns, references } = constraint;
      if (type && columns && type.toUpperCase() !== "PRIMARY KEY") {
        // Build and execute the constraint statement
        let constraintStatement = `ALTER TABLE ${tableName} ADD CONSTRAINT ${type}_${columns.join(
          "_"
        )} ${type.toUpperCase()} (${columns.join(", ")}`;
        if (references && references.table && references.columns) {
          constraintStatement += ` REFERENCES ${
            references.table
          }(${references.columns.join(", ")})`;
        }
        constraintStatement += ")";
        await db.none(constraintStatement);
      }
    }
  } catch (error) {
    console.error(`Error creating table ${tableName}:`, error);
    throw error;
  }
}

module.exports = ensureTableSchema;

/*
// Example usage for composite primary key
const tableName = "your_table_name";
const columnDataTypes = { column1: "integer", column2: "date" }; // Specify data types for columns
const primaryKey = { columns: ["id", "group_id"], type: "serial" } || {
  columns: "id",
  type: "serial",
}; // Specify single-column primary key and type // Specify composite primary key columns and type
const tableConstraints = [
  { type: "unique", columns: ["column1", "column2"] },
  {
    type: "foreign key",
    columns: ["column3"],
    references: { table: "other_table", columns: ["other_column"] },
  },
  // Add more constraints as needed
];
ensureTableSchema(tableName, columnDataTypes, primaryKey, tableConstraints)
  .then(() => console.log(`Schema for table ${tableName} ensured.`))
  .catch((error) => console.error("Error:", error))
  .finally(() => pgp.end());
*/
