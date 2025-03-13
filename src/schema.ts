// These data structures define your client-side schema.
// They must be equal to or a subset of the server-side schema.
// Note the "relationships" field, which defines first-class
// relationships between tables.
// See https://github.com/rocicorp/mono/blob/main/apps/zbugs/src/domain/schema.ts
// for more complex examples, including many-to-many.

import {
  createSchema,
  definePermissions,
  ExpressionBuilder,
  Row,
  ANYONE_CAN,
  table,
  string,
  boolean,
  number,
  relationships,
  PermissionsConfig,
} from '@rocicorp/zero';

const user = table('user')
  .columns({
    id: string(),
    name: string(),
    partner: boolean(),
  })
  .primaryKey('id');

const message = table('message')
  .columns({
    id: string(),
    senderID: string().from('sender_id'),
    body: string(),
    timestamp: number(),
  })
  .primaryKey('id');

const messageRelationships = relationships(message, ({one}) => ({
  sender: one({
    sourceField: ['senderID'],
    destSchema: user,
    destField: ['id'],
  }),
}));

export const schema = createSchema({
  tables: [user, message],
  relationships: [messageRelationships],
});

// The contents of your decoded JWT.
type AuthData = {
  sub: string;
};

export type Schema = typeof schema;
export type Message = Row<typeof schema.tables.message>;
export type User = Row<typeof schema.tables.user>;

export const permissions = definePermissions<AuthData, Schema>(schema, () => {
  const allowIfLoggedIn = (
    authData: AuthData,
    {cmpLit}: ExpressionBuilder<Schema, keyof Schema['tables']>,
  ) => cmpLit(authData.sub, 'IS NOT', null);

  const allowIfMessageSender = (
    authData: AuthData,
    {cmp}: ExpressionBuilder<Schema, 'message'>,
  ) => {
    return cmp('senderID', '=', authData.sub);
  };

  return {
    user: {
      row: {
        select: ANYONE_CAN,
      },
    },
    message: {
      row: {
        insert: ANYONE_CAN,
        update: {
          // only sender can edit their own messages
          preMutation: [allowIfMessageSender],
          // user can only set messages being from self
          postMutation: [allowIfMessageSender],
        },
        // must be logged in to delete
        delete: [allowIfLoggedIn],
        select: ANYONE_CAN,
      },
    },
  } satisfies PermissionsConfig<AuthData, Schema>;
});

export default {
  schema,
  permissions,
};
