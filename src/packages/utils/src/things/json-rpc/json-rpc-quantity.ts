import {
  QuantityBufferSourceConverter,
  QuantityStringSourceConverter,
  QuantityBigIntSourceConverter,
  QuantityNumberSourceConverter,
  QuantityNullSourceConverter
} from "./quantity-json-rpc-converters";
import { BaseDataType, DataTypeSource } from "./json-rpc-base-types";

const typeToConverterMapping = {
  "buffer": QuantityBufferSourceConverter,
  "string": QuantityStringSourceConverter,
  "number": QuantityNumberSourceConverter,
  "bigint": QuantityBigIntSourceConverter,
  "null": QuantityNullSourceConverter
}

export class Quantity extends BaseDataType {
  public static Empty = Quantity.from(Buffer.alloc(0));
  public static Zero = Quantity.from(0);
  public static One = Quantity.from(1);
  public static Gwei = Quantity.from(1000000000);

  public static from(value: DataTypeSource, nullable?: boolean): Quantity {
    if (value instanceof Quantity) {
      return value;
    }
    return new Quantity(value, nullable);
  }
  constructor(value: DataTypeSource, private _isNullable?: boolean) {
    super(value);
    this._converter = this.createConverter();
    this._converter.validate();
  }

  protected createConverter() {
    const typeKey = this._value == null ? "null":
      Buffer.isBuffer(this._value) ? "buffer": typeof this._value;

    const constructor = typeToConverterMapping[typeKey];

    if (constructor === undefined) {
      throw new Error(`Cannot wrap ${this._value} with key ${typeKey} as a json-rpc type`);
    }

    return new constructor(this._value, this._isNullable);
  }

  public toString(isNullable?: boolean): string | null {
    return this._converter.toString(isNullable);
  }

  public toBuffer(isNullable?: boolean): Buffer | null {
    return this._converter.toBuffer(isNullable);
  }

  public toBigInt(isNullable?: boolean): bigint | null {
    return this._converter.toBigInt(isNullable);
  }

  public toNumber(isNullable?: boolean): number {
    return this._converter.toNumber(isNullable);
  }

  public valueOf(): bigint {
    if (this._value === null) {
      return this._value as null;
    } else if (this._value === undefined) {
      return this._value as undefined;
    } else {
      return this.toBigInt();
    }
  }
}

export default Quantity;
