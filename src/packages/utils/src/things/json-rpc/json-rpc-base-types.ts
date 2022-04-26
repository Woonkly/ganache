import { bigIntToBuffer, BUFFER_EMPTY } from "../../utils";
const inspect = Symbol.for("nodejs.util.inspect.custom");

export type DataTypeSource = number | string | Buffer | bigint;

export type JsonRpcType<T extends DataTypeSource> = BaseDataType;

export abstract class BaseDataType {
  private [inspect](_depth: number, _options: any) {
    return `[${this.constructor.name}<${this._converter.constructor.name}>]: ${this.toString()}`
  }

  protected _value: DataTypeSource;
  protected _converter;
  protected abstract createConverter(): BaseSourceConverter;

  constructor(value: DataTypeSource) {
    this._value = value;
  }

  public toJSON(): string | null {
    return this.toString();
  }

  public isNull(): boolean {
    return this._value == null;
  }

  public valueOf(): any {
    return this._value;
  }
}

abstract class BaseSourceConverter {
  protected static padString(value: string, byteLength?: number) {
    if (byteLength === undefined) {
      return value;
    }

    let paddedString;

    const padCharCount = (byteLength - value.length / 2) * 2; // (desired byte count - actual byte count) * 2 characters per byte
    if (padCharCount > 0) {
      paddedString = "0".repeat(padCharCount) + value;
    } else {
      paddedString = value.slice(0, byteLength * 2);
    }
    return paddedString;
  }

  public static validate(value) {}
}

export class BufferSourceConverter extends BaseSourceConverter {
  public static toString(value: Buffer, byteLength?: number): string | null {
    let returnValue = (<any>value).hexSlice(0, value.length);

    return "0x" + this.padString(returnValue, byteLength);
  }

  public static toBuffer(value: Buffer, byteLength?: number): Buffer | null {
    return value;
  }

  public static validate(value: Buffer) {}
}

export class StringSourceConverter extends BaseSourceConverter {
  public static toString(value: string, byteLength?: number): string | null {
    let returnValue = (value as string).toLowerCase().slice(2);

    return "0x" + this.padString(returnValue, byteLength);
  }

  public static toBuffer(value: string, byteLength?: number): Buffer | null {
    let fixedValue = this.toString(value).slice(2);
    if (fixedValue.length & 1) {
      fixedValue = "0" + fixedValue;
    }
    return Buffer.from(fixedValue, "hex");
  }

  private static _validateRegex = /^0x[0-9a-fA-F]*$/;

  public static validate(value: string) {
    if (!this._validateRegex.test(value)) {
      throw new Error(`Cannot wrap ${value} as a json-rpc type; strings must be hex-encoded and prefixed with "0x".`);
    }
  }
}

export class NumberSourceConverter extends BaseSourceConverter {
  public static toString(value: number, byteLength?: number): string | null {
    let returnValue = (value as number).toString(16);

    return "0x" + this.padString(returnValue, byteLength);
  }

  public static toBuffer(value: number, byteLength?: number): Buffer | null {
    //todo: add tests for this
    //todo: respect byteLength
    return bigIntToBuffer(BigInt(value));
  }

  public static validate(value: number) {
    if (value % 1) {
      throw new Error("Cannot wrap a decimal as a json-rpc type");
    }

    if (!isFinite(value)) {
      throw new Error(`Cannot wrap ${value} as a json-rpc type`);
    }
  }
}

export class BigIntSourceConverter extends BaseSourceConverter {
  public static toString(value: bigint, byteLength?: number): string | null {
    let returnValue = (value as bigint).toString(16);

    return "0x" + this.padString(returnValue, byteLength);
  }

  public static toBuffer(value: bigint, byteLength?: number): Buffer | null {
    //todo: respect byteLength;
    return bigIntToBuffer(value);
  }

  public static validate(value: bigint) {
    if (value % 1n) {
      throw new Error("Cannot wrap a decimal as a json-rpc type");
    }

    // todo: add finite validation for bigint
    if (typeof value === "number" && !isFinite(value)) {
      throw new Error(`Cannot wrap ${value} as a json-rpc type`);
    }
  }
}

export class NullSourceConverter extends BaseSourceConverter {
  public static toString(value: bigint, byteLength?: number): string | null {
    return "0x";
  }

  public static toBuffer(value: bigint, byteLength?: number): Buffer | null {
    return BUFFER_EMPTY;
  }
}

export function getConverterFor(value) {
  const converterKey = value == null ? "null" : Buffer.isBuffer(value) ? "buffer": typeof value;
  const converter = converters[converterKey];
  if (converter === undefined) {
    throw new Error(`Cannot wrap a ${typeof value} as a json-rpc type`);
  }
  converter.validate(value);
  return converter;
}

const converters = {
  "string": StringSourceConverter,
  "buffer": BufferSourceConverter,
  "number": NumberSourceConverter,
  "bigint": BigIntSourceConverter,
  "null": NullSourceConverter
};
