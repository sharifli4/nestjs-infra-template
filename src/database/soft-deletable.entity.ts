import { Property } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';

export abstract class SoftDeletableEntity extends BaseEntity {
  @Property({ nullable: true })
  deletedAt?: Date;
}
