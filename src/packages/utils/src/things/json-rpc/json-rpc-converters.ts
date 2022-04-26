
export type DataTypeSource = number | string | Buffer | bigint;

export abstract class BaseSourceConverter<TSource = DataTypeSource> {
  public abstract toString(): string;
  public abstract toBuffer(): Buffer;

  constructor(protected _value: TSource) {}

  public abstract validate(): void;
}

export abstract class BaseStringSourceConverter extends BaseSourceConverter<string> {
  private static _validateRegex = /^0x[0-9a-fA-F]*$/;
    
  constructor(value: string) {
    super(value);
  }

  public validate(): void {
    if (!BaseStringSourceConverter._validateRegex.test(this._value)) {
      throw new Error(`Cannot wrap ${this._value} as a json-rpc type; strings must be hex-encoded and prefixed with "0x".`);
    }
  }
}
