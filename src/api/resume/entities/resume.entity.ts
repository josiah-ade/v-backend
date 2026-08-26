// cv.entity.ts
import { UserEntity } from '@/api/user/entities/user.entity';
import { Uuid } from '@/common/types/common.type';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity('resume')
export class ResumeEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: Uuid;

  @Column({ name: 'cv_title', nullable: true })
  cvTitle: Uuid;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: Uuid;

  @ManyToOne(() => UserEntity, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'user_id' })
  user: Relation<UserEntity>;

  @Column()
  name!: string;

  @Column({ name: 'first_name', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'jsonb', nullable: true })
  contact: object;

  @Column({ name: 'personal_details', type: 'jsonb', nullable: true })
  personalDetails: object;

  @Column({ nullable: true })
  summary: string;

  @Column({ name: 'work_experience', type: 'jsonb', default: [] })
  workExperience: object[];

  @Column({ type: 'jsonb', default: [] })
  education: object[];

  @Column({ type: 'jsonb', default: [] })
  skills: string[];

  @Column({ name: 'websites_portfolio_profile', type: 'jsonb', default: [] })
  websitesPortfolioProfile: string[];

  @Column({ name: 'awards_accomplishments', nullable: true })
  awardsAccomplishments: string;

  @Column({ name: 'interests_and_hobbies', type: 'jsonb', default: [] })
  interestsAndHobbies: string[];

  @Column({ type: 'jsonb', default: [] })
  languages: object[];

  @Column({ type: 'jsonb', default: [] })
  references: object[];

  @Column({ name: 'additional_info', type: 'jsonb', default: [] })
  additionalInfo: object[];

  @Column({ name: 'certification_licence', type: 'jsonb', default: [] })
  certificationLicence: object[];

  @Column({ name: 'profile_picture', nullable: true })
  profilePicture: string;

  @Column({ name: 'uploaded_documents', type: 'jsonb', default: [] })
  uploadedDocuments: string[];

  @Column({ name: 'template_details', type: 'jsonb', nullable: true })
  templateDetails: object;

  @Column({ name: 'font_size', type: 'jsonb', nullable: true })
  fontSize: object;
}
