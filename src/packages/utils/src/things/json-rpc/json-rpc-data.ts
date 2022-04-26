import { BaseDataType, DataTypeSource } from "./json-rpc-base-types";
import {
  DataBufferSourceConverter,
  DataStringSourceConverter,
  DataBigIntSourceConverter,
  DataNumberSourceConverter,
  DataNullSourceConverter
} from "./data-json-rpc-converters";

const typeToConverterMapping = {
  "buffer": DataBufferSourceConverter,
  "string": DataStringSourceConverter,
  "number": DataNumberSourceConverter,
  "bigint": DataBigIntSourceConverter,
  "null": DataNullSourceConverter
}

export class Data extends BaseDataType {
  public static Empty = Data.from(Buffer.alloc(0));

  public static from(value: DataTypeSource, byteLength?: number) {
    return new Data(value, byteLength);
  }

  protected createConverter() {
    const typeKey = this._value == null ? "null":
      Buffer.isBuffer(this._value) ? "buffer": typeof this._value;

    const constructor = typeToConverterMapping[typeKey];

    if (constructor === undefined) {
      throw new Error(`Cannot wrap ${this._value} as a json-rpc type`);
    }
    
    return new constructor(this._value, this._byteLength);
  }

  constructor(value: DataTypeSource, private _byteLength?: number) {
    super(value);
    this._converter = this.createConverter();
    this._converter.validate();
  }

  public toString(byteLength?: number) {
    return this._converter.toString(byteLength);
  }

  public toBuffer(byteLength?: number) {
    return this._converter.toBuffer(byteLength);
  }
}
