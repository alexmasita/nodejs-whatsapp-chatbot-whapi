const pgp = require("pg-promise")();
require("dotenv").config();
const db = pgp(process.env.DATABASE_URL);

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

    if (!tableExists) {
      // Table does not exist, create it
      console.log("before create table");
      await createTable(
        tableName,
        columnDataTypes,
        primaryKey,
        tableConstraints
      );
      console.log("after create table");
    } else {
      console.log("after create table else");

      // Fetch existing table structure
      const existingColumns = await db.any(
        `SELECT * FROM ${tableName} LIMIT 0`
      );
      const existingColumnNames = Object.keys(existingColumns[0] || {});

      // Check if the columns in the existing table match the specified data types
      for (const [column, dataType] of Object.entries(columnDataTypes)) {
        // If the column doesn't exist or has a different data type, alter the table
        if (
          !existingColumnNames.includes(column) ||
          existingColumns[0][column] !== dataType
        ) {
          await db.none(
            `ALTER TABLE ${tableName} ADD COLUMN ${column} ${dataType}`
          );
        }
      }

      // Handle primary key
      const { columns: primaryKeyColumns, type: primaryKeyType } = primaryKey;
      if (
        primaryKeyColumns &&
        Array.isArray(primaryKeyColumns) &&
        primaryKeyColumns.length > 0
      ) {
        // Check if the specified primary key columns exist in the table
        for (const primaryKeyColumn of primaryKeyColumns) {
          if (!existingColumnNames.includes(primaryKeyColumn)) {
            // Add the primary key columns if they don't exist
            const dataType = primaryKeyType || "text"; // Use specified data type or default to 'text'
            await db.none(
              `ALTER TABLE ${tableName} ADD COLUMN ${primaryKeyColumn} ${dataType}`
            );
          }
        }

        // Remove previous primary keys
        const previousPrimaryKeys = existingColumnNames.filter(
          (column) =>
            existingColumns[0][column] === "YES" &&
            !primaryKeyColumns.includes(column)
        );
        for (const previousPrimaryKey of previousPrimaryKeys) {
          await db.none(
            `ALTER TABLE ${tableName} DROP CONSTRAINT ${tableName}_${previousPrimaryKey}_pkey`
          );
        }

        // Set the new composite primary key constraint
        const primaryKeyConstraintColumns = primaryKeyColumns.join(", ");
        await db.none(
          `ALTER TABLE ${tableName} ADD PRIMARY KEY (${primaryKeyConstraintColumns})`
        );
      }

      // Handle additional table constraints
      for (const constraint of tableConstraints) {
        const { type, columns, references } = constraint;
        if (type && columns) {
          // Build and execute the constraint statement
          const constraintStatement = `ALTER TABLE ${tableName} ADD CONSTRAINT ${type}_${columns.join(
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

      // You may want to handle other cases, such as changing data types, based on your requirements.
    }
  } catch (error) {
    console.error(`Error ensuring table schema for ${tableName}:`, error);
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
    let createTableStatement = `CREATE TABLE ${tableName} (`;

    // Add columns and data types
    const columnDefinitions = [];
    for (const [column, dataType] of Object.entries(columnDataTypes)) {
      columnDefinitions.push(`${column} ${dataType}`);
    }
    createTableStatement += columnDefinitions.join(", ");

    // Add primary key
    const { columns: primaryKeyColumns, type: primaryKeyType } = primaryKey;
    if (
      primaryKeyColumns &&
      Array.isArray(primaryKeyColumns) &&
      primaryKeyColumns.length > 0
    ) {
      const primaryKeyConstraintColumns = primaryKeyColumns.join(", ");
      createTableStatement += `, PRIMARY KEY (${primaryKeyConstraintColumns})`;
    }

    createTableStatement += ")";

    // Execute the CREATE TABLE statement
    await db.none(createTableStatement);

    // Handle additional table constraints
    for (const constraint of tableConstraints) {
      const { type, columns, references } = constraint;
      if (type && columns) {
        // Build and execute the constraint statement
        const constraintStatement = `ALTER TABLE ${tableName} ADD CONSTRAINT ${type}_${columns.join(
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
