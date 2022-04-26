import { Data } from "@ganache/utils";
import { DataTypeSource } from "../../../packages/utils/src/things/json-rpc/json-rpc-base-types";

export class Address extends Data {
  public static ByteLength = 20;
  public static Empty = Address.from(Buffer.alloc(0));

  constructor(value: DataTypeSource) {
    super(value, Address.ByteLength);
  }

  public static from(value: DataTypeSource) {
    return new Address(value);
  }
}
