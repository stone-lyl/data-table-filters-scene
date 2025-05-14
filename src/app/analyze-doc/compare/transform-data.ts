"use client";

import * as duckdb from "@duckdb/duckdb-wasm";
import duckdb_wasm_next from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm";
import duckdb_wasm from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm";
import { util } from "apache-arrow";

// Define the bundles manually to use local node_modules
const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
  mvp: {
    mainModule: duckdb_wasm, // Will be served from public directory
    mainWorker: new URL(
      "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js",
      import.meta.url,
    ).toString(),
  },
  eh: {
    mainModule: duckdb_wasm_next, // Will be served from public directory
    mainWorker: new URL(
      "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js",
      import.meta.url,
    ).toString(),
  },
};

// Initialize DuckDB using our manual bundles
async function initializeDuckDB() {
  try {
    return await duckdb.selectBundle(MANUAL_BUNDLES);
  } catch (e) {
    console.error("Failed to load DuckDB bundle:", e);
    throw e;
  }
}

const importJsonArray = async (
  encoder: TextEncoder,
  data: unknown[],
  db: duckdb.AsyncDuckDB,
  c: duckdb.AsyncDuckDBConnection,
  tableName: string,
) => {
  const buffer = encoder.encode(JSON.stringify(data));
  await db.registerFileBuffer(tableName, buffer);

  await c.query(`
      CREATE OR REPLACE TABLE ${tableName} AS 
      SELECT * FROM read_json_auto('${tableName}');
    `);
  return c;
};

class DuckDBInstance {
  private static instance: DuckDBInstance | null = null;
  private db: duckdb.AsyncDuckDB | null = null;
  private worker: Worker | null = null;
  private connection: duckdb.AsyncDuckDBConnection | null = null;

  private constructor() {}

  static getInstance(): DuckDBInstance {
    if (!DuckDBInstance.instance) {
      DuckDBInstance.instance = new DuckDBInstance();
    }
    return DuckDBInstance.instance;
  }

  async initialize() {
    if (this.db) return;

    const bundle = await initializeDuckDB();
    this.worker = new Worker(bundle.mainWorker!);
    const logger = new duckdb.ConsoleLogger();
    this.db = new duckdb.AsyncDuckDB(logger, this.worker);
    await this.db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    this.connection = await this.db.connect();

    // 添加页面卸载时的清理
    window.addEventListener("unload", () => {
      this.cleanup();
    });
  }

  async cleanup() {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.db = null;
    DuckDBInstance.instance = null;
  }

  getConnection() {
    return this.connection;
  }

  getDB() {
    return this.db;
  }
}

export async function transformData(
  datasets: Record<string, unknown[]>,
  sql: string,
) {
  const instance = DuckDBInstance.getInstance();
  await instance.initialize();

  const db = instance.getDB();
  const connection = instance.getConnection();

  if (!db || !connection) {
    throw new Error("DuckDB not properly initialized");
  }

  const encoder = new globalThis.TextEncoder();

  for await (const datasetsKey of Object.keys(datasets)) {
    const data = datasets[datasetsKey];
    await importJsonArray(encoder, data, db, connection, datasetsKey);
  }

  const result = await connection.query(sql);
  // convert arrow types to js types
  const jsResult = result.toArray().map((it) => {
    const json = it.toJSON();
    for (const jsonKey in json) {
      const element = json[jsonKey];
      if (typeof element === "object" && element !== null) {
        if (util.isArrowBigNumSymbol in element) {
          json[jsonKey] = util.bigNumToNumber(element);
        }
      }
    }
    return json;
  });

  return jsResult;
}
