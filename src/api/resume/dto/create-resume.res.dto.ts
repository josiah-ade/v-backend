import { Uuid } from '@/common/types/common.type';
import {
  ArrayFieldOptional,
  BooleanFieldOptional,
  NestedFieldOptional,
  NumberField,
  ObjectFieldOptional,
  StringField,
  StringFieldOptional,
} from '@/decorators/field.decorators';

export class ContactInfoDto {
  @StringFieldOptional({ allowEmpty: true })
  phone?: string;

  @StringFieldOptional({ allowEmpty: true })
  email?: string;

  @StringFieldOptional({ allowEmpty: true })
  address?: string;

  @StringFieldOptional({ allowEmpty: true })
  linkedin?: string;

  @StringFieldOptional({ allowEmpty: true })
  nationality?: string;

  @StringFieldOptional({ allowEmpty: true })
  driverLicence?: string;

  @StringFieldOptional({ allowEmpty: true })
  website?: string;
}

export class PersonalDetailsInfoDto {
  @StringFieldOptional({ allowEmpty: true })
  name?: string;

  @StringFieldOptional({ allowEmpty: true })
  position?: string;

  @StringFieldOptional({ allowEmpty: true })
  dateOfBirth?: string;

  @StringFieldOptional({ allowEmpty: true })
  maritalStatus?: string;

  @StringFieldOptional({ allowEmpty: true })
  gender?: string;

  @StringFieldOptional({ allowEmpty: true })
  religion?: string;

  @StringFieldOptional({ allowEmpty: true })
  country?: string;

  @StringFieldOptional({ allowEmpty: true })
  state?: string;

  @StringFieldOptional({ allowEmpty: true })
  city?: string;

  @StringFieldOptional({ allowEmpty: true })
  postal?: string;
}

export class AdditionalInfoContentsDto {
  @StringField({ allowEmpty: true })
  title: string;

  @StringField({ allowEmpty: true })
  description: string;
}

export class WorkExperienceDto {
  @StringFieldOptional({ allowEmpty: true })
  company?: string;

  @StringFieldOptional({ allowEmpty: true })
  role?: string;

  @StringFieldOptional({ allowEmpty: true })
  work_country?: string;

  @StringFieldOptional({ allowEmpty: true })
  work_city?: string;

  @StringFieldOptional({ allowEmpty: true })
  work_start_month?: string;

  @StringFieldOptional({ allowEmpty: true })
  work_start_year?: string;

  @StringFieldOptional({ allowEmpty: true })
  work_end_month?: string;

  @StringFieldOptional({ allowEmpty: true })
  work_end_year?: string;

  @StringFieldOptional({ allowEmpty: true })
  duration?: string;

  @BooleanFieldOptional()
  isCurrent?: boolean;

  @ArrayFieldOptional()
  description?: string[];
}

export class EducationDto {
  @StringFieldOptional({ allowEmpty: true })
  education_institution?: string;

  @StringFieldOptional({ allowEmpty: true })
  education_qualification?: string;

  @StringFieldOptional({ allowEmpty: true })
  field_of_study?: string;

  @StringFieldOptional({ allowEmpty: true })
  graduation_year?: string;

  @StringFieldOptional({ allowEmpty: true })
  graduation_month?: string;

  @StringFieldOptional({ allowEmpty: true })
  education_city?: string;

  @StringFieldOptional({ allowEmpty: true })
  education_country?: string;

  @StringFieldOptional({ allowEmpty: true })
  education_location?: string;

  @ArrayFieldOptional()
  education_description?: string[];
}

export class WorkReferencesDto {
  @StringFieldOptional({ allowEmpty: true })
  name?: string;

  @StringFieldOptional({ allowEmpty: true })
  occupation?: string;

  @StringFieldOptional({ allowEmpty: true })
  phone?: string;

  @StringFieldOptional({ allowEmpty: true })
  email?: string;

  @StringFieldOptional({ allowEmpty: true })
  company?: string;

  @StringFieldOptional({ allowEmpty: true })
  relationship?: string;
}

export class LanguagesDto {
  @StringField({ allowEmpty: true })
  language: string;

  @NumberField()
  score: number;

  @StringField({ allowEmpty: true })
  title: string;
}

export class CertificationLicenceDto {
  @StringField({ allowEmpty: true })
  date: string;

  @StringField({ allowEmpty: true })
  description: string;
}

export class FontSizeDto {
  @StringField({ allowEmpty: true })
  main: string;

  @StringField({ allowEmpty: true })
  sub: string;
}

export class TemplateDetailsDto {
  @StringField({ allowEmpty: true })
  colorCode: string;

  @StringField({ allowEmpty: true })
  customColor: string;

  @StringField({ allowEmpty: true })
  templateName: string;

  @ArrayFieldOptional()
  templateColors: string[];

  @BooleanFieldOptional()
  isTemplateImage: boolean;

  @ObjectFieldOptional()
  fontStore?: object;
}

export class CreateCVDto {
  @StringFieldOptional({ allowEmpty: true })
  cvId?: Uuid;

  @StringFieldOptional({ allowEmpty: true })
  name?: string;

  @StringFieldOptional({ allowEmpty: true })
  first_name?: string;

  @StringFieldOptional({ allowEmpty: true })
  last_name?: string;

  @StringFieldOptional({ allowEmpty: true })
  title?: string;

  @StringFieldOptional({ allowEmpty: true })
  summary?: string;

  @ArrayFieldOptional()
  skills?: string[];

  @ArrayFieldOptional()
  websitesPortfolioProfile?: string[];

  @StringFieldOptional({ allowEmpty: true })
  awardsAccomplishments?: string;

  @ArrayFieldOptional()
  interestsAndHobbies?: string[];

  @StringFieldOptional({ allowEmpty: true })
  profilePicture?: string;

  @ArrayFieldOptional()
  uploadedDocuments?: string[];

  @NestedFieldOptional(() => ContactInfoDto)
  contact?: ContactInfoDto;

  @NestedFieldOptional(() => PersonalDetailsInfoDto)
  personalDetails?: PersonalDetailsInfoDto;

  @NestedFieldOptional(() => WorkExperienceDto, { each: true })
  workExperience?: WorkExperienceDto[];

  @NestedFieldOptional(() => EducationDto, { each: true })
  education?: EducationDto[];

  @NestedFieldOptional(() => LanguagesDto, { each: true })
  languages?: LanguagesDto[];

  @NestedFieldOptional(() => WorkReferencesDto, { each: true })
  references?: WorkReferencesDto[];

  @NestedFieldOptional(() => AdditionalInfoContentsDto, { each: true })
  additionalInfo?: AdditionalInfoContentsDto[];

  @NestedFieldOptional(() => CertificationLicenceDto, { each: true })
  certificationLicence?: CertificationLicenceDto[];

  @NestedFieldOptional(() => FontSizeDto)
  fontSize?: FontSizeDto;

  @NestedFieldOptional(() => TemplateDetailsDto)
  templateDetails?: TemplateDetailsDto;
}

export class CreateCVRequestDto {
  @NestedFieldOptional(() => CreateCVDto)
  cvData: CreateCVDto;
}
