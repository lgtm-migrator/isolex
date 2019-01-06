import { kebabCase } from 'lodash';
import { Container, Logger, Module, Provides } from 'noicejs';
import { ModuleOptions } from 'noicejs/Module';
import { Registry } from 'prom-client';
import { Connection } from 'typeorm';

import { Bot } from 'src/Bot';
import { INJECT_BOT, INJECT_LOCALE, INJECT_STORAGE } from 'src/BotService';
import { Locale } from 'src/locale';
import { Schema } from 'src/schema';
import { GraphSchema } from 'src/schema/graph';
import { mustExist } from 'src/utils';
import { Clock } from 'src/utils/Clock';
import { JsonPath } from 'src/utils/JsonPath';
import { MathFactory } from 'src/utils/Math';
import { RequestFactory } from 'src/utils/Request';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';

export interface BotModuleOptions {
  logger: Logger;
}

export class BotModule extends Module {
  protected bot?: Bot;
  protected container?: Container;
  protected logger: Logger;
  protected metrics?: Registry;

  constructor(options: BotModuleOptions) {
    super();

    this.logger = options.logger;
  }

  public async configure(options: ModuleOptions) {
    await super.configure(options);

    this.container = options.container;
    this.metrics = new Registry();

    // utils
    this.bind('compiler').toConstructor(TemplateCompiler);
    this.bind(kebabCase(Clock.name)).toConstructor(Clock);
    this.bind(kebabCase(GraphSchema.name)).toConstructor(GraphSchema);
    this.bind('jsonpath').toConstructor(JsonPath);
    this.bind('math').toConstructor(MathFactory);
    this.bind('request').toConstructor(RequestFactory);
  }

  public setBot(bot: Bot) {
    this.bot = bot;
  }

  @Provides(INJECT_BOT)
  public async getBot(): Promise<Bot> {
    return mustExist(this.bot);
  }

  @Provides(INJECT_LOCALE)
  public async getLocale(): Promise<Locale> {
    const bot = await this.getBot();
    return bot.getLocale();
  }

  @Provides('logger')
  public async getLogger(): Promise<Logger> {
    return this.logger;
  }

  @Provides('metrics')
  public async getMetrics(): Promise<Registry> {
    return mustExist(this.metrics);
  }

  @Provides('schema')
  public async getSchema(): Promise<Schema> {
    return new Schema();
  }

  @Provides(INJECT_STORAGE)
  public async getStorage(): Promise<Connection> {
    const bot = await this.getBot();
    return bot.getStorage();
  }
}
