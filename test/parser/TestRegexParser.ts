import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { BaseError } from 'noicejs';
import { Repository } from 'typeorm';

import { INJECT_STORAGE } from '../../src/BotService';
import { CommandVerb } from '../../src/entity/Command';
import { Context } from '../../src/entity/Context';
import { Message } from '../../src/entity/Message';
import { MimeTypeError } from '../../src/error/MimeTypeError';
import { RegexParser } from '../../src/parser/RegexParser';
import { Storage } from '../../src/storage';
import { TYPE_JPEG, TYPE_TEXT } from '../../src/utils/Mime';
import { createService, createServiceContainer } from '../helpers/container';
import { getTestContextData } from '../helpers/context';

const TEST_CONFIG = {
  dataMapper: {
    rest: 'foo',
    skip: 0,
    take: ['body', 'numbers', 'letters'],
  },
  defaultCommand: {
    data: {},
    labels: {},
    noun: 'test',
    verb: CommandVerb.Get,
  },
  filters: [],
  match: {
    rules: [],
  },
  preferData: false,
  regexp: '([0-9]+) ([a-z]+)',
  strict: true,
};

const TEST_STORAGE = ineeda<Storage>({
  getRepository() {
    return ineeda<Repository<Context>>({
      save() {
        return Promise.resolve(ineeda<Context>());
      },
    });
  },
});

describe('regex parser', async () => {
  it('should split the message body into groups', async () => {
    const { container } = await createServiceContainer();
    const svc = await createService(container, RegexParser, {
      [INJECT_STORAGE]: TEST_STORAGE,
      data: TEST_CONFIG,
      metadata: {
        kind: 'test',
        name: 'test',
      },
    });

    const body = '0123456789 abcdefghij';
    const [cmd] = await svc.parse(new Message({
      body,
      context: new Context(getTestContextData()),
      labels: {},
      reactions: [],
      type: TYPE_TEXT,
    }));

    expect(cmd.getHead('body')).to.equal(body);
    expect(cmd.getHead('numbers')).to.equal('0123456789');
    expect(cmd.getHead('letters')).to.equal('abcdefghij');
  });

  it('should reject messages with other types', async () => {
    const { container } = await createServiceContainer();
    const svc = await createService(container, RegexParser, {
      [INJECT_STORAGE]: TEST_STORAGE,
      data: TEST_CONFIG,
      metadata: {
        kind: 'test',
        name: 'test',
      },
    });

    const msg = new Message({
      body: '',
      context: ineeda<Context>(),
      labels: {},
      reactions: [],
      type: TYPE_JPEG,
    });
    return expect(svc.parse(msg)).to.eventually.be.rejectedWith(MimeTypeError);
  });

  it('should throw when message does not match expression', async () => {
    const { container } = await createServiceContainer();
    const svc = await createService(container, RegexParser, {
      [INJECT_STORAGE]: TEST_STORAGE,
      data: TEST_CONFIG,
      metadata: {
        kind: 'test',
        name: 'test',
      },
    });

    const msg = new Message({
      body: 'abc 123',
      context: ineeda<Context>(),
      labels: {},
      reactions: [],
      type: TYPE_TEXT,
    });
    return expect(svc.parse(msg)).to.eventually.be.rejectedWith(BaseError);
  });

  it('should return matches in body', async () => {
    const { container } = await createServiceContainer();
    const svc = await createService(container, RegexParser, {
      [INJECT_STORAGE]: TEST_STORAGE,
      data: TEST_CONFIG,
      metadata: {
        kind: 'test',
        name: 'test',
      },
    });

    const msg = new Message({
      body: '123 abc',
      context: ineeda<Context>(),
      labels: {},
      reactions: [],
      type: TYPE_TEXT,
    });
    const match = await svc.decode(msg);
    expect(match.data).to.have.property('body');
    expect(match.data.body).to.deep.equal(['123 abc', '123', 'abc']);
  });
});
