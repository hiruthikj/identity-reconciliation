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

    // CASE: New User
    if (existingIdentites.length == 0) {
      await UserIdentityModel.create({
        email,
        phoneNumber,
        linkPrecedence: IdentityPrecedenceEnum.PRIMARY,
      });

      return APIResponseBuilder.success({}, 'Created new Primary User').build();
    }

    // CASE: Has 1 Existing User
    if (existingIdentites.length == 1) {
      const existingIdentity = existingIdentites[0];

      // SUBCASE: Has 1 Existing User, both email&phone matched
      if (
        existingIdentity.email == email &&
        existingIdentity.phoneNumber == phoneNumber
      ) {
        return APIResponseBuilder.success({}, 'Existing user').build();
      }

      // SUBCASE: Has 1 Existing User, Only one of email/phone matched
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
    // CASE: Has more than 1 Existing User

    for (const existingIdentity of existingIdentites) {
      // SUBCASE: Has more than 1 Existing User, both email&phone matched
      if (
        existingIdentity.email == email &&
        existingIdentity.phoneNumber == phoneNumber
      ) {
        return APIResponseBuilder.success({}, 'Existing user').build();
      }
    }

    for (const existingIdentity of existingIdentites) {
      // SUBCASE: Has more than 1 Existing User, Only one of email/phone matched
      existingIdentity.linkPrecedence = IdentityPrecedenceEnum.PRIMARY;
      await existingIdentity.save();

      await UserIdentityModel.create({
        email,
        phoneNumber,
        linkPrecedence: IdentityPrecedenceEnum.SECONDARY,
      });

      return APIResponseBuilder.success(
        {},
        'Created new secondary User',
      ).build();
    }
  }
}
