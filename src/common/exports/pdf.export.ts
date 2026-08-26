import { PDFDocument, rgb } from 'pdf-lib';

export function createMarginTemplate(layout: any, marginHeightMm: number) {
  /*
   * Templates without sidebars only need empty space.
   */
  if (!layout.hasSidebar) {
    return `
      <div
        style="
          width: 210mm;
          height: ${marginHeightMm}mm;
          margin: 0;
          padding: 0;
        "
      ></div>
    `;
  }

  const {
    leftMm,
    widthMm,
    rightMm,
    backgroundColor,
    borderLeftWidthPx,
    borderLeftColor,
    borderRightWidthPx,
    borderRightColor,
    pxToMm,
  } = layout;

  const borderLeftWidthMm = borderLeftWidthPx * pxToMm;

  const borderRightWidthMm = borderRightWidthPx * pxToMm;

  const hasBackground =
    backgroundColor &&
    backgroundColor !== 'transparent' &&
    backgroundColor !== 'rgba(0, 0, 0, 0)';

  const bg = hasBackground ? backgroundColor : 'transparent';

  /*
   * Sidebar background itself.
   */
  const sidebarLayer = `
    <div
      style="
        position: absolute;

        top: 0;
        bottom: 0;

        left: ${leftMm}mm;
        width: ${widthMm}mm;

        background: ${bg};

        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      "
    ></div>
  `;

  /*
   * Optional left border.
   */
  const leftBorder =
    borderLeftWidthPx > 0
      ? `
        <div
          style="
            position: absolute;

            top: 0;
            bottom: 0;

            left: ${leftMm}mm;

            width: ${borderLeftWidthMm}mm;

            background: ${borderLeftColor};

            -webkit-print-color-adjust: exact;
          "
        ></div>
      `
      : '';

  /*
   * Optional right border.
   */
  const rightBorder =
    borderRightWidthPx > 0
      ? `
        <div
          style="
            position: absolute;

            top: 0;
            bottom: 0;

            left: ${rightMm - borderRightWidthMm}mm;

            width: ${borderRightWidthMm}mm;

            background: ${borderRightColor};

            -webkit-print-color-adjust: exact;
          "
        ></div>
      `
      : '';

  return `
    <div
      style="
        position: relative;

        width: 210mm;
        height: ${marginHeightMm}mm;

        margin: 0;
        padding: 0;

        overflow: hidden;
      "
    >
      ${sidebarLayer}
      ${leftBorder}
      ${rightBorder}
    </div>
  `;
}

export function parseCssRgb(color?: string) {
  if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') {
    return null;
  }

  const match = color.match(
    /rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)/,
  );

  if (!match) {
    return null;
  }

  return rgb(
    Number(match[1]) / 255,
    Number(match[2]) / 255,
    Number(match[3]) / 255,
  );
}

export async function patchSidebarMargins(
  pdfBytes: Buffer,
  sidebarInfo: {
    leftMm: number;
    widthMm: number;
    backgroundColor: string;

    borderLeftWidthPx: number;
    borderLeftColor: string;

    borderRightWidthPx: number;
    borderRightColor: string;

    pxToMm: number;
  } | null,
  marginMm = 8,
): Promise<Buffer> {
  /*
   * Templates with no sidebar require no PDF patching.
   */
  if (!sidebarInfo) {
    return pdfBytes;
  }

  const pdfDoc = await PDFDocument.load(pdfBytes);

  const pages = pdfDoc.getPages();

  const {
    leftMm,
    widthMm,
    backgroundColor,

    borderLeftWidthPx,
    borderLeftColor,

    borderRightWidthPx,
    borderRightColor,

    pxToMm,
  } = sidebarInfo;

  const background = parseCssRgb(backgroundColor);

  const leftBorderColor = parseCssRgb(borderLeftColor);

  const rightBorderColor = parseCssRgb(borderRightColor);

  for (const page of pages) {
    const pageWidth = page.getWidth();

    const pageHeight = page.getHeight();

    /*
     * Rather than assuming a PDF DPI,
     * derive the scale directly from actual A4 width.
     *
     * pageWidth PDF-points == 210mm.
     */
    const ptPerMm = pageWidth / 210;

    const marginPt = marginMm * ptPerMm;

    const leftPt = leftMm * ptPerMm;

    const widthPt = widthMm * ptPerMm;

    /*
     * Tiny overlap prevents a fractional-coordinate
     * hairline between patched margin and browser body.
     */
    const overlapPt = 0.75;

    /*
     * ---------------------------------------------
     * COLOURED SIDEBARS — Classic etc.
     * ---------------------------------------------
     */
    if (background) {
      /*
       * Bottom margin.
       *
       * PDF coordinate origin is bottom-left.
       */
      page.drawRectangle({
        x: leftPt,
        y: 0,
        width: widthPt,
        height: marginPt + overlapPt,
        color: background,
      });

      /*
       * Top margin.
       */
      page.drawRectangle({
        x: leftPt,
        y: pageHeight - marginPt - overlapPt,

        width: widthPt,

        height: marginPt + overlapPt,

        color: background,
      });
    }

    /*
     * ---------------------------------------------
     * LEFT BORDER
     * ---------------------------------------------
     */
    if (borderLeftWidthPx > 0 && leftBorderColor) {
      const borderMm = borderLeftWidthPx * pxToMm;

      const thicknessPt = borderMm * ptPerMm;

      /*
       * Use a rectangle instead of a PDF line.
       * This gives deterministic physical thickness.
       */
      page.drawRectangle({
        x: leftPt,
        y: 0,

        width: thicknessPt,

        height: marginPt + overlapPt,

        color: leftBorderColor,
      });

      page.drawRectangle({
        x: leftPt,

        y: pageHeight - marginPt - overlapPt,

        width: thicknessPt,

        height: marginPt + overlapPt,

        color: leftBorderColor,
      });
    }

    /*
     * ---------------------------------------------
     * RIGHT BORDER
     * ---------------------------------------------
     */
    if (borderRightWidthPx > 0 && rightBorderColor) {
      const borderMm = borderRightWidthPx * pxToMm;

      const thicknessPt = borderMm * ptPerMm;

      /*
       * Because box-sizing: border-box is being used,
       * the right border occupies the final portion
       * of sidebarRect.width.
       */
      const x = leftPt + widthPt - thicknessPt;

      page.drawRectangle({
        x,
        y: 0,

        width: thicknessPt,

        height: marginPt + overlapPt,

        color: rightBorderColor,
      });

      page.drawRectangle({
        x,

        y: pageHeight - marginPt - overlapPt,

        width: thicknessPt,

        height: marginPt + overlapPt,

        color: rightBorderColor,
      });
    }
  }

  const result = await pdfDoc.save();

  return Buffer.from(result);
}
