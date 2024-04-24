import { Table, Column, Model, DataType, Index } from 'sequelize-typescript';
import { IdentityPrecedenceEnum } from '../constant/enum';

@Table({
  tableName: 'user_identities',
  freezeTableName: true,
  timestamps: true, // Enable timestamps
  paranoid: true, // Enable soft deletion
})
export class UserIdentityModel extends Model<UserIdentityModel> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  @Index('phoneNumberIdx')
  phoneNumber?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  @Index('emailIdx')
  email?: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  linkedId?: number;

  @Column({
    type: DataType.ENUM,
    values: Object.values(IdentityPrecedenceEnum),
    allowNull: true,
  })
  linkPrecedence?: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  createdAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  updatedAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  deletedAt?: Date;
}
