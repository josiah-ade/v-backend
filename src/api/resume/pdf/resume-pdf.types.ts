export interface SidebarInfo {
  leftMm: number;
  topMm: number;
  widthMm: number;

  backgroundColor: string;

  borderLeftWidthMm: number;
  borderLeftColor: string;

  borderRightWidthMm: number;
  borderRightColor: string;
}

export interface HeaderInfo {
  exists: boolean;
  topMm: number;
  rightGapMm: number;
}

export interface ResumeLayoutInfo {
  sidebar: SidebarInfo | null;
  header: HeaderInfo | null;
}