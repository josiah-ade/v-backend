import { Branded } from './types';

export type Uuid = Branded<string, 'Uuid'>;

export const toUuid = (value: string): Uuid => value as Uuid;
