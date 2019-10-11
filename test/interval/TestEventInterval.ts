import { expect } from 'chai';
import { ineeda } from 'ineeda';
import { spy } from 'sinon';

import { Context } from '../../src/entity/Context';
import { Tick } from '../../src/entity/Tick';
import { EventInterval } from '../../src/interval/EventInterval';
import { Service } from '../../src/Service';
import { describeLeaks, itLeaks } from '../helpers/async';
import { createService, createServiceContainer } from '../helpers/container';

const TEST_SVC = 'some-service';

describeLeaks('event interval', async () => {
  itLeaks('should notify target services', async () => {
    const notify = spy();
    const { container, services } = await createServiceContainer();
    services.addService(ineeda<Service>({
      kind: TEST_SVC,
      name: TEST_SVC,
      notify,
    }));
    const interval = await createService(container, EventInterval, {
      data: {
        defaultContext: {
          channel: {
            id: '',
            thread: '',
          },
          name: '',
          uid: '',
        },
        defaultTarget: {
          kind: 'test-service',
          name: 'test-target',
        },
        filters: [],
        frequency: {
          time: '30s',
        },
        services: [{
          kind: TEST_SVC,
          name: TEST_SVC,
        }],
        strict: false,
      },
      metadata: {
        kind: 'event-endpoint',
        name: 'test-endpoint'
      },
    });
    const status = await interval.tick(ineeda<Context>(), ineeda<Tick>({}));
    expect(status).to.equal(0);
    expect(notify).to.have.callCount(1);
  });
});
