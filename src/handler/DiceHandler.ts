import * as mathjs from 'mathjs';
import { Logger } from 'noicejs/logger/Logger';
import { Bot } from 'src/Bot';
import { Command } from 'src/entity/Command';
import { Message } from 'src/entity/Message';
import { BaseHandler } from 'src/handler/BaseHandler';
import { Handler, HandlerConfig, HandlerOptions } from 'src/handler/Handler';

export type DiceHandlerConfig = HandlerConfig;

export type DiceHandlerOptions = HandlerOptions<DiceHandlerConfig>;

export class DiceHandler extends BaseHandler<DiceHandlerConfig> implements Handler {
  constructor(options: DiceHandlerOptions) {
    super(options);
  }

  public async handle(cmd: Command): Promise<void> {
    const args = cmd.data.get('args');
    if (!args || !args.length) {
      throw new Error('no arguments were provided!');
    }

    const results: Array<number> = [];
    for (let i = 0; i < Number(args[1]); i++) {
      const rollResult = mathjs.randomInt(1, Number(args[2]));
      results.push(rollResult);
    }

    this.logger.debug({ args }, 'handling dice results');
    const sum = results.reduce((a, b) => a + b);
    const msg = Message.create({
      body: `The results of your rolls were: ${results}. The sum is ${sum}.`,
      context: cmd.context,
      reactions: []
    });

    await this.bot.send(msg);
  }
}
