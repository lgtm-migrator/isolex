import { expect } from 'chai';
import { bignumber, complex, evaluate, fraction, matrix, range, unit } from 'mathjs';

import { clamp, formatResult, ResultFormatOptions } from '../../src/utils/Math';

const TEST_SCOPE = {};
const TEST_OPTIONS: ResultFormatOptions = {
  list: {
    join: ',',
  },
  node: {
    implicit: 'keep',
    parenthesis: 'keep',
  },
  number: {
    // ?
  },
};

const DEC_VALUE = 3.2;
const INT_VALUE = 1.0;
const NIL_RESULT = 'nil result';

/* eslint-disable no-magic-numbers */

describe('math utils', () => {
  describe('clamp', () => {
    it('should return values within the range', () => {
      expect(clamp(4, 2, 5)).to.equal(4);
      expect(clamp(8, 1, 9)).to.equal(8);
    });

    it('should clamp values outside of the range', () => {
      expect(clamp(9, 2, 5)).to.equal(5);
      expect(clamp(2, 4, 6)).to.equal(4);
    });
  });

  describe('format result', () => {
    it('should format nil results', () => {
      /* eslint-disable-next-line no-null/no-null */
      expect(formatResult(null, TEST_SCOPE, TEST_OPTIONS)).to.equal(NIL_RESULT);
      expect(formatResult(undefined, TEST_SCOPE, TEST_OPTIONS)).to.equal(NIL_RESULT);
    });

    it('should format boolean results', () => {
      expect(formatResult(true, TEST_SCOPE, TEST_OPTIONS)).to.equal('true');
      expect(formatResult(false, TEST_SCOPE, TEST_OPTIONS)).to.equal('false');
    });

    it('should format number results', () => {
      expect(formatResult(INT_VALUE, TEST_SCOPE, TEST_OPTIONS)).to.equal('1');
      expect(formatResult(DEC_VALUE, TEST_SCOPE, TEST_OPTIONS)).to.equal('3.2');
    });

    it('should format string results', () => {
      for (const str of [
        'foo',
        'bar',
      ]) {
        expect(formatResult(str, TEST_SCOPE, TEST_OPTIONS)).to.equal(str);
      }
    });

    it('should format symbol results as unknown', () => {
      expect(formatResult(Symbol(), TEST_SCOPE, TEST_OPTIONS)).to.contain('unknown result type');
    });

    it('should format date results', () => {
      const d = new Date();
      expect(formatResult(d, TEST_SCOPE, TEST_OPTIONS)).to.include(d.getFullYear());
    });

    it('should recursive over array results', () => {
      expect(formatResult([], TEST_SCOPE, TEST_OPTIONS)).to.equal('');
      expect(formatResult([true, false], TEST_SCOPE, TEST_OPTIONS)).to.equal('true,false');
    });

    it('should serialize object results', () => {
      expect(formatResult({}, TEST_SCOPE, TEST_OPTIONS)).to.equal('{}');
      expect(formatResult({
        bar: DEC_VALUE,
        foo: INT_VALUE,
      }, TEST_SCOPE, TEST_OPTIONS)).to.equal(`{"bar":${DEC_VALUE},"foo":${INT_VALUE}}`);
    });

    it('should bail on regexp results', () => {
      expect(formatResult(/foo/, TEST_SCOPE, TEST_OPTIONS)).to.equal('regexp');
    });

    it('should format math results', () => {
      expect(formatResult(bignumber(3), TEST_SCOPE, TEST_OPTIONS)).to.equal('3');
      expect(formatResult(complex(3, -2), TEST_SCOPE, TEST_OPTIONS)).to.equal('3 - 2i');
      expect(formatResult(fraction(1, 3), TEST_SCOPE, TEST_OPTIONS)).to.equal('1/3');
      expect(formatResult(matrix([[1, 2], [3, 4]]), TEST_SCOPE, TEST_OPTIONS)).to.equal('[[1, 2], [3, 4]]');
      expect(formatResult(range(1, 4), TEST_SCOPE, TEST_OPTIONS)).to.equal('[1, 2, 3]');
      expect(formatResult(unit(10, 'm'), TEST_SCOPE, TEST_OPTIONS)).to.equal('10 m');
    });

    it('should format math result sets', () => {
      expect(formatResult(evaluate('1+1 \n 2+2'), TEST_SCOPE, TEST_OPTIONS)).to.equal('2,4');
    });

    it('should format math nodes');
  });
});
