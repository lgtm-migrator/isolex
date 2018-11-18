import { isEmpty, trim } from 'lodash';
import * as split from 'split-string';

import { Command } from 'src/entity/Command';
import { Fragment } from 'src/entity/Fragment';
import { Message } from 'src/entity/Message';
import { NotImplementedError } from 'src/error/NotImplementedError';
import { BaseParser } from 'src/parser/BaseParser';
import { Parser, ParserConfig } from 'src/parser/Parser';
import { ServiceOptions } from 'src/Service';

export interface SplitParserConfig extends ParserConfig {
  /**
   * Split every individual character.
   */
  every: boolean;

  /**
   * Split options for delimiters, brackets, etc.
   */
  split: SplitString.SplitOptions;
}

export type SplitParserOptions = ServiceOptions<SplitParserConfig>;

export class SplitParser extends BaseParser<SplitParserConfig> implements Parser {
  constructor(options: SplitParserOptions) {
    super(options);
  }

  public async complete(frag: Fragment, value: string): Promise<Array<Command>> {
    throw new NotImplementedError();
  }
  
  public async parse(msg: Message): Promise<Array<Command>> {
    const body = this.removeTags(msg.body);
    const args = this.split(body).map(trim).filter((it) => !isEmpty(it));
    this.logger.debug({ args, body }, 'splitting string');

    return [Command.create({
      context: msg.context,
      data: { args },
      noun: this.data.emit.noun,
      verb: this.data.emit.verb,
    })];
  }

  public split(msg: string): Array<string> {
    if (this.data.every) {
      return msg.split('');
    } else {
      return split(msg, this.data.split);
    }
  }
}
