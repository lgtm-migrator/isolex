import { expect } from 'chai';
import { spy } from 'sinon';

import { Command, CommandType } from 'src/Command';
import { describeAsync, itAsync } from 'test/helpers/async';

describeAsync('command', async () => {
  itAsync('should copy data', async () => {
    const cmd = new Command({
      context: {
        roomId: '',
        threadId: '',
        userId: '',
        userName: ''
      },
      data: {
        test: 1
      },
      name: '',
      type: CommandType.None
    });

    expect(cmd.get('test')).to.equal(1);
  });
});
