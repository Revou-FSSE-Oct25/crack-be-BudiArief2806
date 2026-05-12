import { BadRequestException } from '@nestjs/common';
import { NonEmptyStringPipe } from './non-empty-string.pipe';

describe('NonEmptyStringPipe', () => {
  const pipe = new NonEmptyStringPipe();

  it('trims valid strings', () => {
    expect(pipe.transform('  abc  ')).toBe('abc');
  });

  it('throws for empty or non-string values', () => {
    expect(() => pipe.transform('   ')).toThrow(BadRequestException);
    expect(() => pipe.transform(undefined as never)).toThrow(
      BadRequestException,
    );
  });
});
