import {
  PDFDocument,
  rgb,
} from 'pdf-lib';

import {
  HeaderInfo,
  SidebarInfo,
} from './resume-pdf.types';

function parseCssRgb(
  color?: string,
) {
  if (
    !color ||
    color === 'transparent' ||
    color ===
      'rgba(0, 0, 0, 0)'
  ) {
    return null;
  }

  const match =
    color.match(
      /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/,
    );

  if (!match) {
    return null;
  }

  return rgb(
    Number(match[1]) /
      255,

    Number(match[2]) /
      255,

    Number(match[3]) /
      255,
  );
}

export async function addSafePageSpacing(
  rawPdf: Buffer,
  sidebarInfo: SidebarInfo | null,
  headerInfo: HeaderInfo | null,
  marginMm: number,
): Promise<Buffer> {
  const sourcePdf =
    await PDFDocument.load(
      rawPdf,
    );

  const outputPdf =
    await PDFDocument.create();

  const pageIndices =
    sourcePdf.getPageIndices();

  const embeddedPages =
    await outputPdf.embedPdf(
      sourcePdf,
      pageIndices,
    );

  const sidebarBackground =
    sidebarInfo
      ? parseCssRgb(
          sidebarInfo.backgroundColor,
        )
      : null;

  const leftBorderColor =
    sidebarInfo
      ? parseCssRgb(
          sidebarInfo.borderLeftColor,
        )
      : null;

  const rightBorderColor =
    sidebarInfo
      ? parseCssRgb(
          sidebarInfo.borderRightColor,
        )
      : null;

  for (
    let i = 0;
    i < embeddedPages.length;
    i++
  ) {
    const embeddedPage =
      embeddedPages[i];

    const sourcePage =
      sourcePdf.getPage(i);

    const pageWidth =
      sourcePage.getWidth();

    const pageHeight =
      sourcePage.getHeight();

    /*
     * PDF points per millimetre.
     * We derive it from A4 width instead of hardcoding DPI.
     */
    const ptPerMm =
      pageWidth / 210;

    const marginPt =
      marginMm * ptPerMm;

    /*
     * Small overlap removes the tiny white seam
     * between the original page and our added decoration.
     */
    const overlapPt = 1.5;

    /*
     * Create a fresh page with EXACTLY the same physical size.
     */
    const outputPage =
      outputPdf.addPage([
        pageWidth,
        pageHeight,
      ]);

    /*
     * =====================================================
     * HEADER DETECTION
     * =====================================================
     */

    const hasHeader =
      headerInfo?.exists === true;

    const isFirstPage =
      i === 0;

    /*
     * =====================================================
     * ORIGINAL RESUME
     * =====================================================
     */

    if (
      isFirstPage &&
      hasHeader
    ) {
      /*
       * ANY TEMPLATE WITH A HEADER:
       *
       * Do not add another top margin.
       *
       * The source PDF already contains whatever top margin
       * that particular header was designed with.
       *
       * Keep only the bottom breathing room.
       */
      outputPage.drawPage(
        embeddedPage,
        {
          x: 0,

          y:
            marginPt,

          /*
           * Tiny right-side overscan.
           */
          width:
            pageWidth +
            0.5,

          height:
            pageHeight -
            marginPt,
        },
      );
    } else {
      /*
       * No header / continuation pages.
       */
      outputPage.drawPage(
        embeddedPage,
        {
          x: 0,

          y:
            marginPt,

          width:
            pageWidth,

          height:
            pageHeight -
            marginPt *
              2,
        },
      );
    }

    /*
     * Template without sidebar.
     */
    if (!sidebarInfo) {
      continue;
    }

    const sidebarX =
      sidebarInfo.leftMm *
      ptPerMm;

    const sidebarWidth =
      sidebarInfo.widthMm *
      ptPerMm;

    /*
     * =====================================================
     * COLOURED SIDEBAR
     * =====================================================
     */

    if (
      sidebarBackground
    ) {
      /*
       * BOTTOM
       */
      outputPage.drawRectangle(
        {
          x:
            sidebarX,

          y:
            0,

          width:
            sidebarWidth,

          height:
            marginPt +
            overlapPt,

          color:
            sidebarBackground,
        },
      );

      /*
       * TOP
       *
       * If a header exists, do not paint through it
       * on page 1.
       */
      const hasHeaderAboveSidebar =
        headerInfo?.exists ===
        true;

      if (
        !hasHeaderAboveSidebar ||
        i > 0
      ) {
        outputPage.drawRectangle(
          {
            x:
              sidebarX,

            y:
              pageHeight -
              marginPt -
              overlapPt,

            width:
              sidebarWidth,

            height:
              marginPt +
              overlapPt,

            color:
              sidebarBackground,
          },
        );
      }
    }

    /*
     * =====================================================
     * LEFT SIDEBAR BORDER
     * =====================================================
     */

    if (
      sidebarInfo
        .borderLeftWidthMm >
        0 &&
      leftBorderColor
    ) {
      const borderWidth =
        sidebarInfo
          .borderLeftWidthMm *
        ptPerMm;

      /*
       * Bottom continuation.
       */
      outputPage.drawRectangle(
        {
          x:
            sidebarX,

          y:
            0,

          width:
            borderWidth,

          height:
            marginPt +
            overlapPt,

          color:
            leftBorderColor,
        },
      );

      /*
       * Top continuation.
       */
      if (
        sidebarInfo.topMm <=
          2 ||
        i > 0
      ) {
        outputPage.drawRectangle(
          {
            x:
              sidebarX,

            y:
              pageHeight -
              marginPt -
              overlapPt,

            width:
              borderWidth,

            height:
              marginPt +
              overlapPt,

            color:
              leftBorderColor,
          },
        );
      }
    }

    /*
     * =====================================================
     * RIGHT SIDEBAR BORDER
     * =====================================================
     */

    if (
      sidebarInfo
        .borderRightWidthMm >
        0 &&
      rightBorderColor
    ) {
      const borderWidth =
        sidebarInfo
          .borderRightWidthMm *
        ptPerMm;

      const borderX =
        sidebarX +
        sidebarWidth -
        borderWidth;

      /*
       * Bottom continuation.
       */
      outputPage.drawRectangle(
        {
          x:
            borderX,

          y:
            0,

          width:
            borderWidth,

          height:
            marginPt +
            overlapPt,

          color:
            rightBorderColor,
        },
      );

      /*
       * Top continuation.
       */
      if (
        sidebarInfo.topMm <=
          2 ||
        i > 0
      ) {
        outputPage.drawRectangle(
          {
            x:
              borderX,

            y:
              pageHeight -
              marginPt -
              overlapPt,

            width:
              borderWidth,

            height:
              marginPt +
              overlapPt,

            color:
              rightBorderColor,
          },
        );
      }
    }
  }

  const bytes =
    await outputPdf.save();

  return Buffer.from(
    bytes,
  );
}