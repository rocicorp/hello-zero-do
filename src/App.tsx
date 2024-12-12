import {escapeLike} from '@rocicorp/zero';
import {useQuery, useZero} from '@rocicorp/zero/react';
import Cookies from 'js-cookie';
import {MouseEvent, useState} from 'react';
import {formatDate} from './date';
import {randInt} from './rand';
import {Schema} from './schema';
import {randomMessage} from './test-data';
import {useInterval} from './use-interval';

function App() {
  const z = useZero<Schema>();
  const [users] = useQuery(z.query.user);

  const [filterUser, setFilterUser] = useState<string>('');
  const [filterText, setFilterText] = useState<string>('');

  const all = z.query.message;
  const [allMessages] = useQuery(all);

  let filtered = all
    .related('sender', sender => sender.one())
    .orderBy('timestamp', 'desc');

  if (filterUser) {
    filtered = filtered.where('senderID', filterUser);
  }

  if (filterText) {
    filtered = filtered.where('body', 'LIKE', `%${escapeLike(filterText)}%`);
  }

  filtered = filtered.orderBy('timestamp', 'desc');

  const [filteredMessages] = useQuery(filtered);

  const hasFilters = filterUser || filterText;
  const [action, setAction] = useState<'add' | 'remove' | undefined>(undefined);

  useInterval(
    () => {
      if (!handleAction()) {
        setAction(undefined);
      }
    },
    action !== undefined ? 1000 / 60 : null,
  );

  const handleAction = () => {
    if (action === undefined) {
      return false;
    }
    if (action === 'add') {
      z.mutate.message.insert(randomMessage(users));
      return true;
    } else {
      if (allMessages.length === 0) {
        return false;
      }
      const index = randInt(allMessages.length);
      z.mutate.message.delete({id: allMessages[index].id});
      return true;
    }
  };

  const addMessages = () => setAction('add');

  const removeMessages = (e: MouseEvent) => {
    if (z.userID === 'anon' && !e.shiftKey) {
      alert(
        'You must be logged in to delete. Hold the shift key to try anyway.',
      );
      return;
    }
    setAction('remove');
  };

  const stopAction = () => setAction(undefined);

  const editMessage = (
    e: MouseEvent,
    id: string,
    senderID: string,
    prev: string,
  ) => {
    if (senderID !== z.userID && !e.shiftKey) {
      alert(
        "You aren't logged in as the sender of this message. Editing won't be permitted. Hold the shift key to try anyway.",
      );
      return;
    }
    const body = prompt('Edit message', prev);
    z.mutate.message.update({
      id,
      body: body ?? prev,
    });
  };

  const toggleLogin = async () => {
    if (z.userID === 'anon') {
      await fetch('/api/login');
    } else {
      Cookies.remove('jwt');
    }
    location.reload();
  };

  // If initial sync hasn't completed, these can be empty.
  if (!users.length) {
    return null;
  }

  const user = users.find(user => user.id === z.userID)?.name ?? 'anon';

  return (
    <>
      <div className="controls">
        <div>
          <button onMouseDown={addMessages} onMouseUp={stopAction}>
            Add Messages
          </button>
          <button onMouseDown={removeMessages} onMouseUp={stopAction}>
            Remove Messages
          </button>
          <em>(hold buttons to repeat)</em>
        </div>
        <div
          style={{
            justifyContent: 'end',
          }}
        >
          {user === 'anon' ? '' : `Logged in as ${user}`}
          <button onMouseDown={() => toggleLogin()}>
            {user === 'anon' ? 'Login' : 'Logout'}
          </button>
        </div>
      </div>
      <div className="controls">
        <div>
          From:
          <select
            onChange={e => setFilterUser(e.target.value)}
            style={{flex: 1}}
          >
            <option key={''} value="">
              Sender
            </option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          Contains:
          <input
            type="text"
            placeholder="message"
            onChange={e => setFilterText(e.target.value)}
            style={{flex: 1}}
          />
        </div>
      </div>
      <div className="controls">
        <em>
          {!hasFilters ? (
            <>Showing all {filteredMessages.length} messages</>
          ) : (
            <>
              Showing {filteredMessages.length} of {allMessages.length}{' '}
              messages. Try opening{' '}
              <a href="/" target="_blank">
                another tab
              </a>{' '}
              to see them all!
            </>
          )}
        </em>
      </div>
      {filteredMessages.length === 0 ? (
        <h3>
          <em>No posts found 😢</em>
        </h3>
      ) : (
        <table border={1} cellSpacing={0} cellPadding={6} width="100%">
          <thead>
            <tr>
              <th>Sender</th>
              <th>Message</th>
              <th>Sent</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {filteredMessages.map(message => (
              <tr key={message.id}>
                <td align="left">{message.sender?.name}</td>
                <td align="left">{message.body}</td>
                <td align="right">{formatDate(message.timestamp)}</td>
                <td
                  onMouseDown={e =>
                    editMessage(e, message.id, message.senderID, message.body)
                  }
                >
                  ✏️
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

export default App;
