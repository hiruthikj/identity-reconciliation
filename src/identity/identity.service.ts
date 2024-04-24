import { Injectable } from '@nestjs/common';
import { UserIdentityModel } from './models/identity.model';
import { APIResponseBuilder } from 'src/common/utils/api-response-builder';
import { UserIdentityDTO } from './dto/user-identify.dto';
import { IdentityPrecedenceEnum } from './constant/enum';
import { Op } from 'sequelize';

@Injectable()
export class IdentityService {
  async fetchExistingIdentities(email: string, phoneNumber: string) {
    const identities = await UserIdentityModel.findAll({
      where: {
        [Op.or]: [{ email: email }, { phoneNumber: phoneNumber }],
      },
    });

    return identities;
  }

  async upsertUser(request: UserIdentityDTO) {
    const { email, phoneNumber } = request;

    const existingIdentites = await this.fetchExistingIdentities(
      email,
      phoneNumber,
    );

    // CASE1: New User
    if (existingIdentites.length == 0) {
      await UserIdentityModel.create({
        email,
        phoneNumber,
        linkPrecedence: IdentityPrecedenceEnum.PRIMARY,
      });

      return APIResponseBuilder.success({}, 'Created new Primary User').build();
    }

    // CASE2: Has 1 Existing User
    if (existingIdentites.length == 1) {
      const existingIdentity = existingIdentites[0];

      // SUBCASE2.1: Has 1 Existing User, both email&phone matched
      if (
        (existingIdentity.email == email &&
          existingIdentity.phoneNumber == phoneNumber) ||
        // Handle case where Input has null sent for email/phone
        (existingIdentity.email == email && phoneNumber == null) ||
        (existingIdentity.phoneNumber == phoneNumber && email == null)
      ) {
        return APIResponseBuilder.success({}, 'Existing user').build();
      }

      // SUBCASE2.2: Has 1 Existing User, Only one of email/phone matched
      existingIdentity.linkPrecedence = IdentityPrecedenceEnum.PRIMARY;
      await existingIdentity.save();

      await UserIdentityModel.create({
        email,
        phoneNumber,
        linkPrecedence: IdentityPrecedenceEnum.SECONDARY,
        linkedId: existingIdentity.id,
      });

      return APIResponseBuilder.success(
        {},
        'Created new secondary User',
      ).build();
    }

    // CASE3: Has more than 1 Existing User
    for (const existingIdentity of existingIdentites) {
      // SUBCASE3.1: Has more than 1 Existing User, both email&phone matched
      if (
        (existingIdentity.email == email &&
          existingIdentity.phoneNumber == phoneNumber) ||
        // Handle case where Input has null sent for email/phone
        (existingIdentity.email == email && phoneNumber == null) ||
        (existingIdentity.phoneNumber == phoneNumber && email == null)
      ) {
        return APIResponseBuilder.success({}, 'Existing user').build();
      }
    }

    existingIdentites.sort(
      (identity1: any, identity2: any) =>
        new Date(identity1?.createdAt) > new Date(identity2?.createdAt)
          ? 1
          : -1,
      // identity1?.createdAt
      //   .toString()
      //   .localeCompare(identity2?.createdAt.toString()),
    );

    // SUBCASE3.2: Has more than 1 Existing User, Only one of email/phone matched
    // Means oldest will be primary, rest become secondary
    const oldestIdentity = existingIdentites.shift();
    oldestIdentity.linkPrecedence = IdentityPrecedenceEnum.PRIMARY;
    await oldestIdentity.save();

    for (const existingIdentity of existingIdentites) {
      existingIdentity.linkPrecedence = IdentityPrecedenceEnum.SECONDARY;
      existingIdentity.linkedId = oldestIdentity.id;
      await existingIdentity.save();

      return APIResponseBuilder.success(
        {},
        'Updated one as primary, rest as secondary',
      ).build();
    }
  }
}
