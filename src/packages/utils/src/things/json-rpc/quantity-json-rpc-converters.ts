import { BaseSourceConverter, BaseStringSourceConverter } from "./json-rpc-converters";
import { bigIntToBuffer, bufferToBigInt } from "../../utils";

function stripLeadingZerosFromBuffer(input: Buffer): Buffer {
  let i = 0;
  while(i < input.length && input[i] === 0x0) i++;
  if (i === 0) {
    return input;
  } else {
    return input.slice(i);
  }
}

export class QuantityStringSourceConverter extends BaseStringSourceConverter {
  constructor(value: string, private _nullable?: boolean) {
    super(value);
  }

  public toString(nullable?: boolean): string | null {
    const result = this._value.toLowerCase().replace(/^0x0+/, "0x");
    if (result === "0x") {
      return "0x0";
    } else {
      return result;
    }
  }

  public toBuffer(nullable?: boolean): Buffer | null {
    const buffer = Buffer.from(this._value.slice(2), "hex");
    
    return stripLeadingZerosFromBuffer(buffer);
  }

  public toNumber(nullable?: boolean): number | null {
    return Number(this._value);
  }

  public toBigInt(nullable?: boolean): bigint | null {
    return BigInt(this._value);
  }
}

export class QuantityBufferSourceConverter extends BaseSourceConverter<Buffer> {
  constructor(value: Buffer, private _nullable?: boolean) {
    super(value);
  }

  public toString(nullable?: boolean): string | null {
    const result = this._value.toString("hex").replace(/^0+/, "");
    if (result === "") {
      return "0x0";
    } else {
      return "0x" + result;
    }
  }

  public toBuffer(nullable?: boolean): Buffer | null {
    return stripLeadingZerosFromBuffer(this._value);
  }

  public toNumber(nullable?: boolean): number | null {
    const stringValue = "0x" + (<any>this._value).hexSlice(0, this._value.length);
    return Number(stringValue);
  }

  public toBigInt(nullable?: boolean): bigint | null {
    const bigInt =  bufferToBigInt(this._value);
    return bigInt == null ? (this._nullable ? null : 0n) : bigInt;
  }

  public validate(): void {
    if (!Buffer.isBuffer(this._value) || this._value === null || this._value === undefined) {
      throw new Error(`Cannot wrap ${this._value} as a json-rpc type`);
    }
  }
}

export class QuantityNumberSourceConverter extends BaseSourceConverter<number> {
  constructor(value: number, private _nullable?: boolean) {
    super(value);
  }

  public toString(nullable?: boolean): string | null {
    return "0x" + this._value.toString(16);
  }

  public toBuffer(nullable?: boolean): Buffer | null {
    if (this._value === 0) {
      return Buffer.alloc(0);
    }
    
    return Buffer.from(this._value.toString(16), "hex");
  }

  public toNumber(nullable?: boolean): number | null {
    return this._value;
  }

  public toBigInt(nullable?: boolean): bigint | null {
    return BigInt(this._value);
  }

  public validate(): void {
    if (typeof this._value !== "number" || !isFinite(this._value) || this._value === null || this._value === undefined) {
      throw new Error(`Cannot wrap ${this._value} as a json-rpc type`);
    }

    if (this._value % 1) {
      throw new Error(`Cannot wrap decimal as a json-rpc type`);
    }
  }
}

export class QuantityBigIntSourceConverter extends BaseSourceConverter<bigint> {
  constructor(value: bigint, private _nullable?: boolean) {
    super(value);
  }

  public toString(nullable?: boolean): string {
    return "0x" + this._value.toString(16);
  }

  public toBuffer(nullable?: boolean): Buffer {
    if (this._value === 0n) {
      return Buffer.alloc(0);
    }
    
    return bigIntToBuffer(this._value);
  }

  public toNumber(nullable?: boolean): number | null {
    return Number(this._value);
  }

  public toBigInt(nullable?: boolean): bigint | null {
    return this._value;
  }

  public validate(): void {
    if (typeof this._value !== "bigint" || this._value === null || this._value === undefined) { // || !isFinite(this._value)) {
      throw new Error(`Cannot wrap ${this._value} as a json-rpc type`);
    }

    if (this._value % 1n) {
      throw new Error(`Cannot wrap decimal as a json-rpc type`);
    }
  }
}

export class QuantityNullSourceConverter extends BaseSourceConverter<number> {
  constructor(_value: null | undefined, protected _nullable?: boolean) {
    super(_value);
  }

  public toString(nullable?: boolean): string {
    const isNullable = nullable != null ? nullable : this._nullable;
    return isNullable? null : "0x";
  }

  public toBuffer(nullable?: boolean): Buffer {
    const isNullable = nullable != null ? nullable : this._nullable;
    return isNullable? null : Buffer.alloc(0);
  }

  public toNumber(nullable?: boolean): number | null {
    const isNullable = nullable != null ? nullable : this._nullable;
    return isNullable? null : 0;
  }

  public toBigInt(nullable?: boolean): bigint | null {
    const isNullable = nullable != null ? nullable : this._nullable;
    return isNullable? null : 0n;
  }

  public validate(): void {
    if (this._value !== null && this._value !== undefined) {
      throw new Error(`Cannot wrap ${this._value} as a json-rpc type`);
    }
  }
}

export const a = 1;