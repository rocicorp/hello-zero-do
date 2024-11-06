// These data structures define your client-side schema.
// They must be equal to or a subset of the server-side schema.
// Note the "relationships" field, which defines first-class
// relationships between tables.
// See https://github.com/rocicorp/mono/blob/main/apps/zbugs/src/domain/schema.ts
// for more complex examples, including many-to-many.

import {
  createSchema,
  createTableSchema,
  TableSchemaToRow,
} from '@rocicorp/zero/schema';

const userSchema = createTableSchema({
  tableName: 'user',
  columns: {
    id: {type: 'string'},
    name: {type: 'string'},
    partner: {type: 'boolean'},
  },
  primaryKey: ['id'],
  relationships: {},
});

const messageSchema = createTableSchema({
  tableName: 'message',
  columns: {
    id: {type: 'string'},
    senderID: {type: 'string'},
    body: {type: 'string'},
    timestamp: {type: 'number'},
  },
  primaryKey: ['id'],
  relationships: {
    sender: {
      source: 'senderID',
      dest: {
        schema: userSchema,
        field: 'id',
      },
    },
  },
});

export const schema = createSchema({
  version: 1,
  tables: {
    user: userSchema,
    message: messageSchema,
  },
});

export type Schema = typeof schema;
export type Message = TableSchemaToRow<typeof messageSchema>;
export type User = TableSchemaToRow<typeof schema.tables.user>;
