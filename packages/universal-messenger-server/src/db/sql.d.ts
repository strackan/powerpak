/**
 * Type declarations for sql.js
 * Since @types/sql.js doesn't exist, we provide minimal types
 */

declare module 'sql.js' {
  export interface Database {
    exec(sql: string): void;
    prepare(sql: string): Statement;
    export(): Uint8Array;
    close(): void;
  }

  export interface Statement {
    bind(values: any[]): void;
    step(): boolean;
    getAsObject(): Record<string, any>;
    run(values: any[]): void;
    free(): void;
  }

  export interface SqlJsStatic {
    Database: new (data?: ArrayLike<number> | Buffer) => Database;
  }

  export default function initSqlJs(config?: {
    locateFile?: (file: string) => string;
  }): Promise<SqlJsStatic>;
}
