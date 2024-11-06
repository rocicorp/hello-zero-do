import {Zero} from '@rocicorp/zero';
import {clearTerminal, cursorTo} from 'ansi-escapes';
import {DurableObject} from 'cloudflare:workers';
import {formatDate} from '../date.js';
import {type Message, schema, type Schema, type User} from '../schema.js';

interface Env {
  ['MY_DURABLE_OBJECT']: DurableObjectNamespace<MyDurableObject>;
}

export class MyDurableObject extends DurableObject {
  #z: Zero<Schema>;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    addEventListener('unhandledrejection', e => {
      console.log('unhandledrejection', e);
    });

    this.#z = new Zero({
      server: 'http://localhost:4848',
      userID: 'anon',
      schema,
      kvStore: 'mem',
    });

    const view = this.#z.query.message
      .related('sender', q => q.one())
      .orderBy('timestamp', 'desc')
      .materialize();
    view.addListener(render);
  }

  init() {
    const url = 'http://localhost:5173/';
    return `Add or remove messages from <a href=${url} target=_blank>${url}</a>`;
  }
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== '/') {
      return new Response('Not found', {status: 404});
    }
    const id: DurableObjectId = env.MY_DURABLE_OBJECT.idFromName(
      new URL(request.url).pathname,
    );
    const stub = env.MY_DURABLE_OBJECT.get(id);
    // We only get the DO to trigger it to watch the issue
    return new Response(await stub.init(), {
      headers: {'Content-Type': 'text/html'},
    });
  },
} satisfies ExportedHandler<Env>;

type Messages = readonly (Message & {readonly sender: User | undefined})[];

function render(messages: Messages) {
  let s = clearTerminal;
  s += cursorTo(0, 0);

  s += 'Sender'.padEnd(12) + 'Message'.padEnd(72) + 'Sent' + '\n';
  for (const message of messages) {
    s +=
      (message.sender?.name ?? 'Unknown').padEnd(12) +
      message.body.padEnd(72) +
      formatDate(message.timestamp) +
      '\n';
  }

  console.log(s);
}
