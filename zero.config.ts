import {defineAuthorization} from '@rocicorp/zero/config';
import {Message, schema, type Schema} from './src/schema.js';

// The contents of your decoded JWT.
type AuthData = {
  sub: string;
};

export default defineAuthorization<AuthData, Schema>(schema, query => {
  const allowIfLoggedIn = (authData: AuthData) =>
    query.user.where('id', '=', authData.sub);

  const allowIfMessageSender = (authData: AuthData, row: Message) => {
    return query.message
      .where('id', row.id)
      .where('senderID', '=', authData.sub);
  };

  return {
    authorization: {
      // Nobody can write to the medium or user tables -- they are populated
      // and fixed by seed.sql
      medium: {
        table: {
          insert: [],
          update: [],
          delete: [],
        },
      },
      user: {
        table: {
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
    },
  };
});
