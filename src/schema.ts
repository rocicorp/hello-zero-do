// These data structures define your client-side schema.
// They must be equal to or a subset of the server-side schema.
// Note the "relationships" field, which defines first-class
// relationships between tables.
// See https://github.com/rocicorp/mono/blob/main/apps/zbugs/src/domain/schema.ts
// for more complex examples, including many-to-many.

import {
  createSchema,
  createTableSchema,
  defineAuthorization,
  TableSchemaToRow,
} from '@rocicorp/zero';

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

// The contents of your decoded JWT.
type AuthData = {
  sub: string;
};

export type Schema = typeof schema;
export type Message = TableSchemaToRow<typeof messageSchema>;
export type User = TableSchemaToRow<typeof userSchema>;

export default defineAuthorization<AuthData, Schema>(schema, query => {
  const allowIfLoggedIn = (authData: AuthData) =>
    query.user.where('id', '=', authData.sub);

  const allowIfMessageSender = (authData: AuthData, row: Message) => {
    return query.message
      .where('id', row.id)
      .where('senderID', '=', authData.sub);
  };

  return {
    // Nobody can write to the medium or user tables -- they are populated
    // and fixed by seed.sql
    medium: {
      row: {
        insert: [],
        update: [],
        delete: [],
      },
    },
    user: {
      row: {
        insert: [],
        update: [],
        delete: [],
      },
    },
    message: {
      row: {
        // anyone can insert
        insert: undefined,
        // only sender can edit their own messages
        update: [allowIfMessageSender],
        // must be logged in to delete
        delete: [allowIfLoggedIn],
      },
    },
  };
});
