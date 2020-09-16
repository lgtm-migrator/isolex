import { getTestLogger } from '@apextoaster/js-utils';
import { DeepPartial, ineeda } from 'ineeda';
import { Constructor, Container, Logger, Module, ModuleOptions, ProviderType, Provides } from 'noicejs';
import { Registry } from 'prom-client';
import { spy } from 'sinon';

import {
  INJECT_CLOCK,
  INJECT_LOGGER,
  INJECT_MATH,
  INJECT_METRICS,
  INJECT_SCHEMA,
  INJECT_SERVICES,
  INJECT_TEMPLATE,
} from '../../src/BaseService';
import { Bot } from '../../src/Bot';
import { BotServiceData, BotServiceOptions, INJECT_BOT, INJECT_LOCALE, INJECT_STORAGE } from '../../src/BotService';
import { Locale } from '../../src/locale';
import { ServiceModule } from '../../src/module/ServiceModule';
import { Schema } from '../../src/schema';
import { Service } from '../../src/Service';
import { Clock } from '../../src/utils/Clock';
import { MathFactory } from '../../src/utils/Math';
import { Template } from '../../src/utils/Template';
import { TemplateCompiler } from '../../src/utils/TemplateCompiler';
import { createMockStorage } from './storage';

export class TestModule extends Module {
  private readonly schema: Schema;

  constructor() {
    super();

    this.schema = new Schema();
  }

  public async configure(options: ModuleOptions) {
    await super.configure(options);

    this.bindTo(INJECT_TEMPLATE, ProviderType.Constructor, TemplateCompiler);
  }

  @Provides(INJECT_LOGGER)
  public async getLogger(): Promise<Logger> {
    return getTestLogger();
  }

  @Provides(INJECT_SCHEMA)
  public async getSchema(): Promise<Schema> {
    return this.schema;
  }
}

/**
 * Create a DI container for tests.
 */
export async function createContainer(...modules: Array<Module>): Promise<{ container: Container; module: Module }> {
  const module = new TestModule();
  const container = Container.from(module, ...modules);
  await container.configure({
    logger: getTestLogger(),
  });
  return { container, module };
}

/**
 * Create a DI container for tests with a stub service module that will create, but not get, services.
 */
export async function createServiceContainer(...modules: Array<Module>): Promise<{
  container: Container;
  module: Module;
  services: ServiceModule;
}> {
  const services = new ServiceModule({
    timeout: 100,
  });
  const { container, module } = await createContainer(...modules, services);
  module.bind(INJECT_SERVICES).toInstance(services);
  return { container, module, services };
}

export function createTestOptions() {
  return {
    [INJECT_BOT]: ineeda<Bot>(),
    [INJECT_CLOCK]: ineeda<Clock>(),
    [INJECT_TEMPLATE]: ineeda<TemplateCompiler>({
      compile: () => ineeda<Template>(),
    }),
    [INJECT_LOGGER]: getTestLogger(),
    [INJECT_MATH]: new MathFactory(),
    [INJECT_METRICS]: new Registry(),
    [INJECT_SCHEMA]: new Schema(), // tests use the real schema :D
    [INJECT_STORAGE]: createMockStorage(),
  };
}

export async function createService<
  TService,
  TData extends BotServiceData,
  TOptions extends BotServiceOptions<TData> = BotServiceOptions<TData>,
>(
  container: Container,
  type: Constructor<TService, TOptions>,
  options: Partial<TOptions>
): Promise<TService> {
  const testOptions = createTestOptions();
  const locale = await container.create(Locale, {
    data: {
      lang: 'en',
    },
    metadata: {
      kind: 'locale',
      name: 'locale',
    },
    [INJECT_LOGGER]: getTestLogger(),
    [INJECT_SCHEMA]: testOptions[INJECT_SCHEMA],
  });
  await locale.start();

  const fullOptions = {
    ...testOptions,
    [INJECT_LOCALE]: locale,
    container,
    ...options,
  };

  return container.create(type, fullOptions);
}

export async function serviceSpy(extra: DeepPartial<Service>) {
  const spies = {
    notify: spy(),
    start: spy(),
    stop: spy(),
  };

  const svc = ineeda<Service>({
    ...extra,
    ...spies,
  });

  return { svc, spies };
}
