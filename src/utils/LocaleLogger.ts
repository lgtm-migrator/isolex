import { Logger, Inject } from 'noicejs';
import { BaseOptions } from 'noicejs/Container';
import { INJECT_LOGGER } from 'src/BaseService';

export interface LocaleLoggerOptions extends BaseOptions {
  logger: Logger;
}

@Inject(INJECT_LOGGER)
export class LocaleLogger {
  public static readonly type = 'logger';

  protected logger: Logger;

  constructor(options: LocaleLoggerOptions) {
    this.logger = options.logger;
  }

  public error(args: Array<unknown>) {
    this.logger.error({ args }, 'error from locale');
  }

  public log(args: Array<unknown>) {
    this.logger.debug({ args }, 'message from locale');
  }

  public warn(args: Array<unknown>) {
    this.logger.warn({ args }, 'warning from locale');
  }
}
