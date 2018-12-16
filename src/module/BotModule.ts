import { kebabCase } from 'lodash';
import { Container, Logger, Module, Provides } from 'noicejs';
import { ModuleOptions } from 'noicejs/Module';
import { Registry } from 'prom-client';
import * as request from 'request-promise';
import { Connection } from 'typeorm';

import { Bot } from 'src/Bot';
import { GraphSchema } from 'src/graph';
import { TemplateCompiler } from 'src/utils/TemplateCompiler';

export interface BotModuleOptions {
  logger: Logger;
}

export class BotModule extends Module {
  protected bot: Bot;
  protected container: Container;
  protected logger: Logger;
  protected metrics: Registry;

  constructor(options: BotModuleOptions) {
    super();

    this.logger = options.logger;
    this.metrics = new Registry();
  }

  public async configure(options: ModuleOptions) {
    await super.configure(options);

    this.container = options.container;

    // utils
    this.bind('compiler').toConstructor(TemplateCompiler);
    this.bind(kebabCase(GraphSchema.name)).toConstructor(GraphSchema);
  }

  public setBot(bot: Bot) {
    this.bot = bot;
  }

  @Provides('bot')
  public async getBot(options: any): Promise<Bot> {
    return this.bot;
  }

  @Provides('logger')
  public async getLogger(options: any): Promise<Logger> {
    return this.logger;
  }

  @Provides('metrics')
  public async getMetrics(options: any): Promise<Registry> {
    return this.metrics;
  }

  @Provides('storage')
  public async getStorage(options: any): Promise<Connection> {
    return this.bot.getStorage();
  }

  @Provides('request')
  public async createRequest(options: any): Promise<Request> {
    return request(options);
  }
}
