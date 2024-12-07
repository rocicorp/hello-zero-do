// These data structures define your client-side schema.
// They must be equal to or a subset of the server-side schema.
// Note the "relationships" field, which defines first-class
// relationships between tables.
// See https://github.com/rocicorp/mono/blob/main/apps/zbugs/src/domain/schema.ts
// for more complex examples, including many-to-many.

import {
  createSchema,
  createTableSchema,
  definePermissions,
  ExpressionBuilder,
  TableSchema,
  TableSchemaToRow,
} from '@rocicorp/zero';

const userSchema = createTableSchema({
  tableName: 'user',
  columns: {
    id: 'string',
    name: 'string',
    partner: 'boolean',
  },
  primaryKey: 'id',
});

const messageSchema = createTableSchema({
  tableName: 'message',
  columns: {
    id: 'string',
    senderID: 'string',
    body: 'string',
    timestamp: 'number',
  },
  primaryKey: 'id',
  relationships: {
    sender: {
      sourceField: 'senderID',
      destSchema: userSchema,
      destField: 'id',
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

// The contents of your decoded JWT.
type AuthData = {
  sub: string;
};

export type Schema = typeof schema;
export type Message = TableSchemaToRow<typeof messageSchema>;
export type User = TableSchemaToRow<typeof userSchema>;

export const permissions = definePermissions<AuthData, Schema>(schema, () => {
  const allowIfLoggedIn = (
    authData: AuthData,
    {cmpLit}: ExpressionBuilder<TableSchema>,
  ) => cmpLit(authData.sub, 'IS NOT', null);

  const allowIfMessageSender = (
    authData: AuthData,
    {cmp}: ExpressionBuilder<typeof messageSchema>,
  ) => {
    return cmp('senderID', '=', authData.sub);
  };

  return {
    // Nobody can write to the medium or user tables -- they are populated
    // and fixed by seed.sql
    medium: {
      row: {
        insert: [],
        update: {
          preMutation: [],
        },
        delete: [],
      },
    },
    user: {
      row: {
        insert: [],
        update: {
          preMutation: [],
        },
        delete: [],
      },
    },
    message: {
      row: {
        // anyone can insert
        insert: undefined,
        // only sender can edit their own messages
        update: {
          preMutation: [allowIfMessageSender],
        },
        // must be logged in to delete
        delete: [allowIfLoggedIn],
      },
    },
  };
});

export default {
  schema,
  permissions,
};
