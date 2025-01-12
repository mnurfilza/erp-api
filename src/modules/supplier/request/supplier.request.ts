import { ApiError } from "@point-hub/express-error-handler";
import Validatorjs from "validatorjs";
import { SupplierRepository } from "../repositories/supplier.repository";
import { db } from "@src/database/database.js";

export const validate = async (body: any, method: string) => {
  const validation = new Validatorjs(body, {
    code: `unique:supplier,code,${method}`,
    name: `required|unique:supplier,name,${method}`,
  });
  let passes = () => {};
  let fails = () => {};

  const promise = new Promise((resolve) => {
    passes = () => {
      resolve(true);
    };
    fails = () => {
      resolve(false);
    };
  });

  validation.checkAsync(passes, fails);

  const result = await promise;

  if (result === false) {
    throw new ApiError(422, validation.errors.errors);
  }
};

Validatorjs.registerAsync(
  "unique",
  async function (value, attribute, req, passes) {
    if (!attribute) throw new ApiError(500);

    const attArr = attribute.split(",");
    if (attArr.length !== 3) throw new ApiError(500);

    const { 0: table, 1: column, 2: method } = attArr;

    const aggregates: any = [{ $limit: 1 }];

    if (method !== "update") {
      if (column === "code") {
        aggregates.push({
          $match: {
            code: value,
          },
        });
      }

      if (column === "name") {
        aggregates.push({
          $match: {
            name: value,
          },
        });
      }

      const supplierRepository = new SupplierRepository(db);
      const aggregateResult = supplierRepository.aggregate(aggregates, {
        page: 1,
        pageSize: 10,
      });

      const result = (await aggregateResult) as any;

      if (result.data.length > 0) {
        passes(false, `${column} is exists`); // return false if value exists
        return;
      }
    }
    passes();
  },
  ""
);
