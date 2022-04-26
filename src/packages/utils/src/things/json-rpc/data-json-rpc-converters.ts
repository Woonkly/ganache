import { BaseSourceConverter, BaseStringSourceConverter } from "./json-rpc-converters";

function padBuffer(value: Buffer, byteLength: number | undefined) {
  if (byteLength === undefined || byteLength === value.length) {
    return value;
  }

  const returnValue = Buffer.alloc(byteLength);

  const sourceStart = 0;
  const targetStart = value.length > byteLength ? 0 : byteLength - value.length;
  value.copy(returnValue, targetStart, sourceStart, byteLength);

  return returnValue;
}

function padString(value: string, byteLength: number | undefined) {
  let paddedString;
  const charLength = byteLength * 2

  if (byteLength === undefined || charLength === value.length) {
    return value;
  }

  const padCharCount = (byteLength - value.length / 2) * 2; // (desired byte count - actual byte count) * 2 characters per byte
  if (padCharCount === 0) {
    paddedString = value;
  } else if (padCharCount > 0) {
    paddedString = "0".repeat(padCharCount) + value;
  } else {
    paddedString = value.slice(0, charLength);
  }
  return paddedString;
}

function validateByteLength(byteLength?: number) {
  if (byteLength !== undefined &&
    (typeof byteLength !== "number" || byteLength < 0 || !isFinite(byteLength))) {
     throw new Error(`byteLength must be a number greater than or equal to 0, provided: ${byteLength}`);
  }
}

export class DataStringSourceConverter extends BaseStringSourceConverter {
  constructor(value: string, private _byteLength?: number) {
    super(value);
  }

  public toString(byteLength?: number): string {
    validateByteLength(byteLength);
    const length = byteLength ?? this._byteLength;
    if (length === undefined) {
        return this._value.toLowerCase();
    }
    return "0x" + padString(this._value.slice(2), length);
  }

  public toBuffer(byteLength?: number): Buffer {
    validateByteLength(byteLength);
    let returnValue = this._value.slice(2).toLowerCase();

    const length = byteLength ?? this._byteLength ?? 
        Math.round(returnValue.length / 2)

    if (length * 2 !== returnValue.length) {
      returnValue = padString(returnValue, length);
    }

    return Buffer.from(returnValue, "hex");
  }

  public validate(): void {
    super.validate();
    validateByteLength(this._byteLength);
  }
}

export class DataBufferSourceConverter extends BaseSourceConverter<Buffer> {
  constructor(value: Buffer, private _byteLength?: number) {
    super(value);
  }

  public validate(): void {
    if (!Buffer.isBuffer(this._value)) {
      throw new Error(`Cannot wrap ${this._value} as a json-rpc type`);
    }

    validateByteLength(this._byteLength);
  }

  public toString(byteLength?: number): string {
    validateByteLength(byteLength);
    const length = byteLength ?? this._byteLength;
    let returnValue = (<any>this._value).hexSlice(0, this._value.length);

    return "0x" + padString(returnValue, length);
  }

  public toBuffer(byteLength?: number): Buffer {
    validateByteLength(byteLength);
    const length = byteLength ?? this._byteLength;

    return padBuffer(this._value, length);
  }
}

export class DataNumberSourceConverter extends BaseSourceConverter<number> {
  constructor(_value: number, protected _byteLength?: number) {
    super(_value);
  }

  public toString(byteLength?: number): string {
    validateByteLength(byteLength);
    const length = byteLength ?? this._byteLength;

    return "0x" + padString(this._value.toString(16), length);
  }

  public toBuffer(byteLength?: number): Buffer {
    validateByteLength(byteLength);
    const length = byteLength ?? this._byteLength;

    const bufferValue = Buffer.from(this._value.toString(16), "hex");

    return padBuffer(bufferValue, length);
  }

  public validate(): void {
    if (typeof this._value !== "number" || !isFinite(this._value)) {
      throw new Error(`Cannot wrap ${this._value} as a json-rpc type`);
    }

    if (this._value % 1) {
      throw new Error(`Cannot wrap decimal as a json-rpc type`);
    }

    validateByteLength(this._byteLength);
  }
}

export class DataBigIntSourceConverter extends BaseSourceConverter<bigint> {
  constructor(_value: bigint, protected _byteLength?: number) {
    super(_value);
  }

  public toString(byteLength?: number): string {
    validateByteLength(byteLength);
    const length = byteLength ?? this._byteLength;

    return "0x" + padString(this._value.toString(16), length);
  }

  public toBuffer(byteLength?: number): Buffer {
    validateByteLength(byteLength);
    const length = byteLength ?? this._byteLength;

    let bufferValue = Buffer.from(this._value.toString(16), "hex");
    if (length === undefined || length === bufferValue.length) {
      return bufferValue;
    }

    const returnValue = Buffer.allocUnsafe(length).fill(0);

    const sourceStart = 0;
    const targetStart = bufferValue.length > length ? 0 : length - bufferValue.length;
    bufferValue.copy(returnValue, targetStart, sourceStart, length);

    return returnValue;
  }

  public validate(): void {
    if (typeof this._value !== "bigint") {
      throw new Error(`Cannot wrap ${this._value} as a json-rpc type`);
    }

    validateByteLength(this._byteLength);
  }
}


export class DataNullSourceConverter extends BaseSourceConverter<number> {
  constructor(_value: null | undefined, protected _byteLength?: number) {
    super(_value);
  }

  public toString(byteLength?: number): string {
    return "0x";
  }

  public toBuffer(byteLength?: number): Buffer {
    return Buffer.allocUnsafe(0);
  }

  public validate(): void {
    if (this._value !== null && this._value !== undefined) {
      throw new Error(`Cannot wrap ${this._value} as a json-rpc type`);
    }
    validateByteLength(this._byteLength);
  }
}
