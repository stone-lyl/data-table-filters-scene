'use client';

import { util } from 'apache-arrow';
import { useEffect, useState } from 'react';
import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm';
import duckdb_wasm_next from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm';

// Define the bundles manually to use local node_modules
const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
  mvp: {
    mainModule: duckdb_wasm, // Will be served from public directory
    mainWorker: new URL('@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js', import.meta.url).toString(),
  },
  eh: {
    mainModule: duckdb_wasm_next, // Will be served from public directory
    mainWorker: new URL('@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js', import.meta.url).toString(),
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
  tableName: string
) => {
  const buffer = encoder.encode(JSON.stringify(data));
  await db.registerFileBuffer(tableName, buffer);
  await c.insertJSONFromPath(tableName, {
    schema: 'main',
    name: tableName,
  });
  return c;
};

async function transformData(datasets: Record<string, unknown[]>, sql: string) {
  // Get the bundle using our initializeDuckDB helper
  const bundle = await initializeDuckDB();
  // Instantiate the asynchronous version of DuckDB-wasm
  const worker = new Worker(bundle.mainWorker!);
  const logger = new duckdb.ConsoleLogger();
  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  // Select a bundle based on browser checks
  const encoder = new globalThis.TextEncoder();
  const c = await db.connect();

  for (const datasetsKey in datasets) {
    const data = datasets[datasetsKey];
    await importJsonArray(encoder, data, db, c, datasetsKey);
  }

  const result = await c.query(sql);
  const jsResult = result.toArray().map((it) => {
    const json = it.toJSON();
    for (const jsonKey in json) {
      const element = json[jsonKey];
      if (typeof element === 'object' && element !== null) {
        if (util.isArrowBigNumSymbol in element) {
          json[jsonKey] = util.bigNumToNumber(element);
        }
      }
      // todo: handle other arrow types
    }
    return json;
  });

  // Close the connection to release memory
  await c.close();
  worker.terminate();
  return jsResult;
}

export function useTransform(
  datasets: Record<string, unknown[]>,
  query: string
) {
  const [result, setResult] = useState<unknown[]>([]);

  useEffect(() => {
    transformData(datasets, query).then((queryResult) => {
      setResult(queryResult);
    });
  }, [datasets, query]);

  return result;
}
