import { Uuid } from '@/common/types/common.type';
import { EnumField, StringField } from '@/decorators/field.decorators';

export enum ResumeExportType {
  PDF = 'pdf',
  DOCX = 'docx',
  TXT = 'txt',
}

export class ExportResumeDto {
  @StringField()
  resumeId!: Uuid;

  @EnumField(() => ResumeExportType)
  type!: ResumeExportType;
}
