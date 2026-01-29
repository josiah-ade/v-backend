import { StringField } from "@/decorators/field.decorators";

export class PaystackVerifyReqDto {
  @StringField()
  reference!: string;
}