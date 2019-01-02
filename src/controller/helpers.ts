import { isNil, isNumber, isString } from 'lodash';
import { Command, CommandVerb } from 'src/entity/Command';
import { InvalidArgumentError } from 'src/error/InvalidArgumentError';
import { mapToDict } from 'src/utils/Map';
import { NOUN_FRAGMENT } from './CompletionController';
import { BaseError } from 'noicejs';

export function createCompletion(cmd: Command, key: string, msg: string): Command {
  if (isNil(cmd.context.parser)) {
    throw new InvalidArgumentError('command has no parser to prompt for completion');
  }

  const existingData = mapToDict(cmd.data);
  return new Command({
    context: cmd.context,
    data: {
      ...existingData,
      key: [key],
      msg: [msg],
      noun: [cmd.noun],
      parser: [cmd.context.parser.id],
      verb: [cmd.verb],
    },
    labels: {},
    noun: NOUN_FRAGMENT,
    verb: CommandVerb.Create,
  });
}

type CollectData = number | string | Array<string>;

interface CollectFields {
  [key: string]: CollectData;
}

interface CollectInputKey<TData extends CollectData> {
  default: TData;
  prompt: string;
  required: boolean;
}

type CollectInput<TData extends CollectFields> = {
  [K in keyof TData]: CollectInputKey<TData[K]>;
};

interface CompleteCollectResult<TData> {
  complete: true;
  data: TData;
}

interface IncompleteCollectResult<TData> {
  complete: false;
  fragment: Command;
}

type CollectResult<TData> = CompleteCollectResult<TData> | IncompleteCollectResult<TData>;

export function collectOrComplete<TData extends CollectFields>(cmd: Command, fields: CollectInput<TData>): CollectResult<TData> {
  const results = new Map<string, CollectData>();
  for (const [key, def] of Object.entries(fields)) {
    const exists = cmd.has(key);
    if (def.required && !exists) {
      return {
        complete: false,
        fragment: createCompletion(cmd, key, def.prompt),
      };
    }

    if (exists) {
      const value = cmd.get(key);
      const coerced = collectValue(value, def.default);
      if (isNil(coerced)) {
        return {
          complete: false,
          fragment: createCompletion(cmd, key, def.prompt),
        };
      }
      results.set(key, coerced);
    } else {
      results.set(key, def.default);
    }
  }

  return {
    complete: true,
    data: mapToDict(results) as TData,
  };
}

export function collectValue(value: CollectData, defaultValue: CollectData): CollectData | undefined {
  if (Array.isArray(defaultValue)) {
    if (Array.isArray(value)) {
      return value;
    }

    if (isNumber(value)) {
      return [value.toString(10)];
    }

    if (isString(value)) {
      return [value];
    }
  }

  if (isNumber(defaultValue)) {
    if (Array.isArray(value)) {
      const [head] = value;
      return parseInt(head, 10);
    }

    if (isNumber(value)) {
      return value;
    }

    if (isString(value)) {
      return parseInt(value, 10);
    }
  }

  if (isString(defaultValue)) {
    if (Array.isArray(value)) {
      const [head] = value;
      return head;
    }

    if (isNumber(value)) {
      return value.toString(10);
    }

    if (isString(value)) {
      return value;
    }
  }

  throw new BaseError('value type error');
}
