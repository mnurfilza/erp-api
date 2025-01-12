import { UserRepository } from "../repositories/user.repository.js";
import { issuer, secretKey } from "@src/config/auth.js";
import DatabaseConnection, { QueryInterface } from "@src/database/connection.js";
import { verify } from "@src/utils/hash.js";
import { signNewToken } from "@src/utils/jwt.js";

export class SigninUserService {
  private db: DatabaseConnection;
  constructor(db: DatabaseConnection) {
    this.db = db;
  }
  public async handle(username: string, password: string) {
    const iQuery: QueryInterface = {
      fields: "",
      filter: { username: username },
      page: 1,
      pageSize: 1,
      sort: "",
    };
    const userRepository = new UserRepository(this.db);
    const result = (await userRepository.readMany(iQuery)) as any;
    let isVerified = false;
    if (result.totalDocument === 1) {
      isVerified = await verify(result.data[0].password, password);
    }

    let token = "";
    if (isVerified) {
      token = signNewToken(issuer, secretKey, result.data[0]._id);
    }

    return {
      token: token,
    };
  }
}
