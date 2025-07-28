import { StringField } from '@/decorators/field.decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CreationResDto {
  @Expose()
  @StringField({ nullable: true })
  id!: string | null;

  @Expose()
  @StringField({ nullable: true })
  title!: string | null;

  @Expose()
  @StringField({ nullable: true })
  type!: string | null;

  @Expose()
  @StringField({ nullable: true })
  content!: string | null;

  @Expose()
  @StringField({ nullable: true })
  image!: string | null;
}
