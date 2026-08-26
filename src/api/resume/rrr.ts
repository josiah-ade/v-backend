import { SuccessResponse } from '@/common/dto/success.dto';
import { toUuid, Uuid } from '@/common/types/common.type';
import { AllConfigType } from '@/config/config.type';
import { CacheKey } from '@/constants/cache.constant';
import { ErrorCode } from '@/constants/error-code.constant';
import { ValidationException } from '@/exceptions/validation.exception';
import { createCacheKey } from '@/utils/cache.util';
import { transformSingleDto } from '@/utils/transformers/transform-dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Response } from 'express';
import ms from 'ms';
import { randomUUID } from 'node:crypto';
import { PDFDocument, rgb } from 'pdf-lib';
import { chromium, Page } from 'playwright';
import { Repository } from 'typeorm/repository/Repository';
import { GetResumeResDto } from './dto/get-resume.res.dto';
import { ResumeEntity } from './entities/resume.entity';

function parseCssRgb(color?: string) {
  if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') {
    return null;
  }

  const match = color.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);

  if (!match) {
    return null;
  }

  return rgb(
    Number(match[1]) / 255,
    Number(match[2]) / 255,
    Number(match[3]) / 255,
  );
}

/**
 * Chromium can treat a horizontal flex/grid entry as an atomic print fragment.
 * If the entry's own border box fits at the bottom of an A4 page but its
 * authored bottom margin crosses the boundary, Chromium may move the whole
 * entry to the next page and leave a large blank hole.
 *
 * Permanent export rule:
 * - Never shorten the user's designed spacing.
 * - Never target a particular work-experience/education item.
 * - Only intervene when geometry proves that a horizontal row itself fits but
 *   its trailing margin is the thing crossing an A4 boundary.
 * - Detach only the overflowing part of that margin from the atomic row and
 *   preserve it as an ordinary spacer immediately after the row.
 *
 * The total visual spacing remains the same:
 *
 *   original margin = margin kept on row + preserved spacer
 *
 * The difference is that Chromium no longer has to fit the row AND all of its
 * trailing whitespace as one indivisible fragment.
 */
async function stabilizePrintFragmentation(page: Page): Promise<void> {
  const MAX_PASSES = 6;

  for (let pass = 0; pass < MAX_PASSES; pass++) {
    const adjustments = await page.evaluate(() => {
      const template = document.querySelector<HTMLElement>('.cv-template');

      if (!template) {
        return [] as Array<{
          className: string;
          oldMarginBottom: number;
          keptMarginBottom: number;
          preservedSpacer: number;
          page: number;
        }>;
      }

      const templateRect = template.getBoundingClientRect();
      const pageHeightPx = templateRect.width * (297 / 210);

      /*
       * A small reserve handles Chromium/sub-pixel print rounding without
       * visibly changing the template.
       */
      const SAFETY_PX = 3;

      const changed: Array<{
        className: string;
        oldMarginBottom: number;
        keptMarginBottom: number;
        preservedSpacer: number;
        page: number;
      }> = [];

      const elements = Array.from(template.querySelectorAll<HTMLElement>('*'));

      const classNameOf = (element: HTMLElement) =>
        typeof element.className === 'string' ? element.className : '';

      for (const element of elements) {
        /*
         * Never process the same row twice across the outer passes.
         */
        if (element.dataset.pdfFragmentSpacingHandled === '1') {
          continue;
        }

        const rect = element.getBoundingClientRect();

        if (rect.width <= 0 || rect.height <= 0) {
          continue;
        }

        const styles = getComputedStyle(element);

        /*
         * The known Chromium fragmentation problem occurs on horizontal
         * multi-column rows. Detect by computed layout, not by class name,
         * section type, content text or item position.
         */
        const isHorizontalFlex =
          (styles.display === 'flex' || styles.display === 'inline-flex') &&
          (styles.flexDirection === 'row' ||
            styles.flexDirection === 'row-reverse');

        let isHorizontalGrid = false;

        if (styles.display === 'grid' || styles.display === 'inline-grid') {
          const columns = styles.gridTemplateColumns
            .trim()
            .split(/\s+/)
            .filter(Boolean);

          isHorizontalGrid = columns.length > 1;
        }

        if (!isHorizontalFlex && !isHorizontalGrid) {
          continue;
        }

        const marginBottom = parseFloat(styles.marginBottom) || 0;

        if (marginBottom <= 0) {
          continue;
        }

        const relativeTop = rect.top - templateRect.top;
        const relativeBottom = rect.bottom - templateRect.top;

        const pageIndex = Math.max(
          0,
          Math.floor(Math.max(0, relativeTop) / pageHeightPx),
        );

        const pageBottom = (pageIndex + 1) * pageHeightPx;

        /*
         * The row's actual content/border box must already fit. If the row
         * itself crosses the page, this is not the margin-only problem and we
         * leave it untouched.
         */
        if (relativeBottom > pageBottom + 0.5) {
          continue;
        }

        const outerBottom = relativeBottom + marginBottom;

        /*
         * The authored margin also fits: no intervention.
         */
        if (outerBottom <= pageBottom - SAFETY_PX) {
          continue;
        }

        const keptMarginBottom = Math.max(
          0,
          Math.min(marginBottom, pageBottom - relativeBottom - SAFETY_PX),
        );

        const preservedSpacer = Math.max(0, marginBottom - keptMarginBottom);

        if (preservedSpacer < 0.5) {
          continue;
        }

        /*
         * Keep the part that physically fits attached to the row.
         */
        element.style.setProperty(
          'margin-bottom',
          `${keptMarginBottom}px`,
          'important',
        );

        /*
         * Preserve every pixel we detached from the margin as a normal flow
         * spacer directly after the row. This is what keeps the visible gap
         * identical to the editor instead of pulling the next border/section
         * upward.
         */
        const spacer = document.createElement('div');
        spacer.setAttribute('data-pdf-preserved-spacing', 'true');
        spacer.setAttribute('aria-hidden', 'true');

        spacer.style.setProperty('display', 'block', 'important');
        spacer.style.setProperty('width', '100%', 'important');
        spacer.style.setProperty('height', `${preservedSpacer}px`, 'important');
        spacer.style.setProperty('min-height', '0', 'important');
        spacer.style.setProperty('margin', '0', 'important');
        spacer.style.setProperty('padding', '0', 'important');
        spacer.style.setProperty('border', '0', 'important');
        spacer.style.setProperty('background', 'transparent', 'important');
        spacer.style.setProperty('box-sizing', 'border-box', 'important');
        spacer.style.setProperty('break-inside', 'auto', 'important');
        spacer.style.setProperty('page-break-inside', 'auto', 'important');
        spacer.style.setProperty('pointer-events', 'none', 'important');

        /*
         * If the parent itself is a grid, make the spacer span all columns so
         * it remains purely vertical spacing rather than becoming another
         * content column.
         */
        const parent = element.parentElement;

        if (parent) {
          const parentStyles = getComputedStyle(parent);

          if (
            parentStyles.display === 'grid' ||
            parentStyles.display === 'inline-grid'
          ) {
            spacer.style.setProperty('grid-column', '1 / -1', 'important');
          }

          if (
            (parentStyles.display === 'flex' ||
              parentStyles.display === 'inline-flex') &&
            (parentStyles.flexDirection === 'row' ||
              parentStyles.flexDirection === 'row-reverse')
          ) {
            /*
             * A spacer inserted into a horizontal flex parent would become a
             * third column. In that uncommon structure, preserve layout by
             * declining the transformation entirely.
             */
            element.style.removeProperty('margin-bottom');
            continue;
          }
        }

        element.insertAdjacentElement('afterend', spacer);
        element.dataset.pdfFragmentSpacingHandled = '1';

        changed.push({
          className: classNameOf(element),
          oldMarginBottom: marginBottom,
          keptMarginBottom,
          preservedSpacer,
          page: pageIndex + 1,
        });
      }

      /* Force layout before deciding whether another pass is required. */
      void template.offsetHeight;

      return changed;
    });

    if (adjustments.length === 0) {
      break;
    }

    console.log('[PDF FRAGMENT SPACING PRESERVED]', adjustments);

    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => resolve());
          });
        }),
    );
  }
}

async function addSafePageSpacing(
  rawPdf: Buffer,
  sidebarInfo: SidebarInfo | null,
  headerInfo: HeaderInfo | null,
  marginMm: number,
): Promise<Buffer> {
  const sourcePdf = await PDFDocument.load(rawPdf);
  const outputPdf = await PDFDocument.create();

  const pageIndices = sourcePdf.getPageIndices();

  const embeddedPages = await outputPdf.embedPdf(sourcePdf, pageIndices);

  const sidebarBackground = sidebarInfo
    ? parseCssRgb(sidebarInfo.backgroundColor)
    : null;

  const leftBorderColor = sidebarInfo
    ? parseCssRgb(sidebarInfo.borderLeftColor)
    : null;

  const rightBorderColor = sidebarInfo
    ? parseCssRgb(sidebarInfo.borderRightColor)
    : null;

  for (let i = 0; i < embeddedPages.length; i++) {
    const embeddedPage = embeddedPages[i];

    const sourcePage = sourcePdf.getPage(i);

    const pageWidth = sourcePage.getWidth();
    const pageHeight = sourcePage.getHeight();

    /*
     * PDF points per millimetre.
     * We derive it from A4 width instead of hardcoding DPI.
     */
    const ptPerMm = pageWidth / 210;

    const marginPt = marginMm * ptPerMm;

    /*
     * Small overlap removes the tiny white seam
     * between the original page and our added decoration.
     */
    const overlapPt = 1.5;

    /*
     * Create a fresh page with EXACTLY the same physical size.
     */
    const outputPage = outputPdf.addPage([pageWidth, pageHeight]);

    /*
     * Detect templates structured like:
     *
     *       HEADER
     * -------------------
     * Sidebar | Main
     *
     * A normal sidebar template will have topMm ≈ 0.
     */
    /*
     * =====================================================
     * HEADER DETECTION
     * =====================================================
     */

    const hasHeader = headerInfo?.exists === true;

    const isFirstPage = i === 0;

    /*
     * =====================================================
     * ORIGINAL RESUME
     * =====================================================
     */

    if (isFirstPage && hasHeader) {
      /*
       * ANY TEMPLATE WITH A HEADER:
       *
       * Do not add another top margin.
       *
       * The source PDF already contains whatever top margin
       * that particular header was designed with.
       *
       * Therefore:
       *
       * Header A:
       *   no original top margin
       *   -> stays flush
       *
       * Header B:
       *   already has 5mm top margin
       *   -> keeps approximately that 5mm
       *
       * We create breathing room only at the bottom.
       */
      outputPage.drawPage(embeddedPage, {
        x: 0,
        y: marginPt,

        /*
         * Only overscan if the ORIGINAL header actually
         * touches the right edge.
         *
         * If the header was designed with a right margin,
         * preserve that margin exactly.
         */
        width: pageWidth + 0.5,

        height: pageHeight - marginPt,
      });
    } else {
      /*
       * No header / continuation pages:
       *
       * Keep your existing working behaviour.
       */
      outputPage.drawPage(embeddedPage, {
        x: 0,
        y: marginPt,

        width: pageWidth,

        height: pageHeight - marginPt * 2,
      });
    }

    if (!sidebarInfo) {
      continue;
    }

    const sidebarX = sidebarInfo.leftMm * ptPerMm;

    const sidebarWidth = sidebarInfo.widthMm * ptPerMm;

    /*
     * =====================================================
     * COLOURED SIDEBAR
     * =====================================================
     */

    if (sidebarBackground) {
      /*
       * BOTTOM
       *
       * Slightly overlap the compressed source PDF.
       * This removes the tiny gap completely.
       */
      outputPage.drawRectangle({
        x: sidebarX,
        y: 0,

        width: sidebarWidth,
        height: marginPt + overlapPt,

        color: sidebarBackground,
      });

      /*
       * TOP
       *
       * If the sidebar originally began at the top,
       * continue its colour through the top margin.
       *
       * If the template has a full-width header above
       * the sidebar, DON'T paint sidebar colour over it.
       */
      const hasHeaderAboveSidebar = headerInfo?.exists === true;

      if (!hasHeaderAboveSidebar || i > 0) {
        outputPage.drawRectangle({
          x: sidebarX,

          y: pageHeight - marginPt - overlapPt,

          width: sidebarWidth,
          height: marginPt + overlapPt,

          color: sidebarBackground,
        });
      }
    }

    /*
     * =====================================================
     * LEFT SIDEBAR BORDER
     * =====================================================
     */

    if (sidebarInfo.borderLeftWidthMm > 0 && leftBorderColor) {
      const borderWidth = sidebarInfo.borderLeftWidthMm * ptPerMm;

      /*
       * Bottom continuation.
       */
      outputPage.drawRectangle({
        x: sidebarX,
        y: 0,

        width: borderWidth,
        height: marginPt + overlapPt,

        color: leftBorderColor,
      });

      /*
       * On page 1, don't draw through a full-width header.
       * On page 2+, continue from the physical top.
       */
      if (sidebarInfo.topMm <= 2 || i > 0) {
        outputPage.drawRectangle({
          x: sidebarX,

          y: pageHeight - marginPt - overlapPt,

          width: borderWidth,
          height: marginPt + overlapPt,

          color: leftBorderColor,
        });
      }
    }

    /*
     * =====================================================
     * RIGHT SIDEBAR BORDER
     * =====================================================
     */

    if (sidebarInfo.borderRightWidthMm > 0 && rightBorderColor) {
      const borderWidth = sidebarInfo.borderRightWidthMm * ptPerMm;

      const borderX = sidebarX + sidebarWidth - borderWidth;

      /*
       * Bottom continuation.
       */
      outputPage.drawRectangle({
        x: borderX,
        y: 0,

        width: borderWidth,
        height: marginPt + overlapPt,

        color: rightBorderColor,
      });

      /*
       * Page 1 respects a header above the sidebar.
       * Subsequent pages continue from the physical top.
       */
      if (sidebarInfo.topMm <= 2 || i > 0) {
        outputPage.drawRectangle({
          x: borderX,

          y: pageHeight - marginPt - overlapPt,

          width: borderWidth,
          height: marginPt + overlapPt,

          color: rightBorderColor,
        });
      }
    }
  }

  const bytes = await outputPdf.save();

  return Buffer.from(bytes);
}

interface SidebarInfo {
  leftMm: number;
  topMm: number;
  widthMm: number;

  backgroundColor: string;

  borderLeftWidthMm: number;
  borderLeftColor: string;

  borderRightWidthMm: number;
  borderRightColor: string;
}

interface HeaderInfo {
  exists: boolean;
  topMm: number;
  rightGapMm: number;
}

@Injectable()
export class ResumeExportService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    @InjectRepository(ResumeEntity)
    private readonly resumeRepository: Repository<ResumeEntity>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  // async exportPdf(userId: Uuid, id: Uuid, res: Response): Promise<void> {
  //   if (!userId) {
  //     throw new ValidationException(ErrorCode.R000);
  //   }

  //   const resume = await this.resumeRepository.findOne({
  //     where: {
  //       id,
  //       userId,
  //     },
  //   });

  //   if (!resume) {
  //     throw new ValidationException(ErrorCode.R001);
  //   }

  //   const exportId = toUuid(randomUUID());
  //   console.log(`exportId: ${exportId}`);

  //   await this.setCache(exportId, userId, id);

  //   const browser = await chromium.launch({
  //     headless: true,
  //   });

  //   try {
  //     const page = await browser.newPage({
  //       viewport: { width: 794, height: 1123 }, // A4 at 96 DPI: 210mm × 297mm
  //     });

  //     page.on('console', (msg) => console.log('[PAGE LOG]', msg.text()));
  //     page.on('pageerror', (err) => console.log('[PAGE ERROR]', err.message));

  //     await page.emulateMedia({
  //       media: 'print',
  //     });

  //     await page.goto(
  //       `${process.env.APP_FRONT_URL}/resume/export/${exportId}`,
  //       {
  //         waitUntil: 'domcontentloaded',
  //         timeout: 60000,
  //       },
  //     );

  //     await page.waitForFunction(
  //       () => (window as any).__EXPORT_READY__ === true,
  //       {
  //         timeout: 15000,
  //       },
  //     );

  //     // await page.screenshot({
  //     //   path: '/app/debug-export.png',
  //     //   fullPage: true,
  //     // });

  //     // const pdf = await page.pdf({
  //     //   format: 'A4',
  //     //   preferCSSPageSize: true,
  //     //   printBackground: true,
  //     //   margin: {
  //     //     top: '0',
  //     //     right: '0',
  //     //     bottom: '0',
  //     //     left: '0',
  //     //   },
  //     // });

  //     const PAGE_MARGIN_MM = 8;

  //     const pdf = await page.pdf({
  //       format: 'A4',
  //       printBackground: true,
  //       margin: {
  //         top: `${PAGE_MARGIN_MM}mm`,
  //         right: '0',
  //         bottom: `${PAGE_MARGIN_MM}mm`,
  //         left: '0',
  //       },
  //     });

  //     res.set({
  //       'Content-Type': 'application/pdf',
  //       'Content-Disposition': 'attachment; filename="resume.pdf"',
  //       'Content-Length': pdf.length,
  //     });

  //     res.end(pdf);
  //   } finally {
  //     await browser.close();
  //   }
  // }

  async exportPdf(userId: Uuid, id: Uuid, res: Response): Promise<void> {
    if (!userId) {
      throw new ValidationException(ErrorCode.R000);
    }

    const resume = await this.resumeRepository.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!resume) {
      throw new ValidationException(ErrorCode.R001);
    }

    const exportId = toUuid(randomUUID());

    console.log(`exportId: ${exportId}`);

    await this.setCache(exportId, userId, id);

    const browser = await chromium.launch({
      headless: true,
    });

    try {
      const page = await browser.newPage({
        viewport: {
          width: 794,
          height: 1123,
        },
      });

      page.on('console', (msg) => console.log('[PAGE LOG]', msg.text()));

      page.on('pageerror', (err) => console.log('[PAGE ERROR]', err.message));

      await page.emulateMedia({
        media: 'print',
      });

      await page.goto(
        `${process.env.APP_FRONT_URL}/resume/export/${exportId}`,
        {
          waitUntil: 'domcontentloaded',
          timeout: 60000,
        },
      );

      await page.waitForFunction(
        () => (window as any).__EXPORT_READY__ === true,
        {
          timeout: 15000,
        },
      );

      /*
       * ===================================================
       * NORMALIZE ONLY ROW MARGINS THAT CAUSE FALSE PAGE GAPS
       * ===================================================
       */
      await stabilizePrintFragmentation(page);

      /*
       * ===================================================
       * MEASURE HEADER + SIDEBAR INDEPENDENTLY
       * ===================================================
       */

      const layoutInfo = await page.evaluate(() => {
        const template = document.querySelector<HTMLElement>('.cv-template');

        if (!template) {
          return {
            sidebar: null,
            header: null,
          };
        }

        const templateRect = template.getBoundingClientRect();
        const pxToMm = 210 / templateRect.width;

        /*
         * HEADER IS MEASURED INDEPENDENTLY OF SIDEBAR.
         * This is required for templates that have a header but no sidebar.
         */
        const header = template.querySelector<HTMLElement>('[data-cv-header]');

        let headerInfo = null;

        if (header) {
          const headerRect = header.getBoundingClientRect();

          headerInfo = {
            exists: true,
            topMm: (headerRect.top - templateRect.top) * pxToMm,
            rightGapMm: (templateRect.right - headerRect.right) * pxToMm,
          };
        }

        /*
         * SIDEBAR IS ALSO OPTIONAL AND INDEPENDENT.
         */
        const sidebar =
          template.querySelector<HTMLElement>('[data-cv-sidebar]');

        let sidebarInfo = null;

        if (sidebar) {
          const sidebarRect = sidebar.getBoundingClientRect();
          const styles = getComputedStyle(sidebar);

          sidebarInfo = {
            leftMm: (sidebarRect.left - templateRect.left) * pxToMm,
            topMm: (sidebarRect.top - templateRect.top) * pxToMm,
            widthMm: sidebarRect.width * pxToMm,
            backgroundColor: styles.backgroundColor,
            borderLeftWidthMm:
              (parseFloat(styles.borderLeftWidth) || 0) * pxToMm,
            borderLeftColor: styles.borderLeftColor,
            borderRightWidthMm:
              (parseFloat(styles.borderRightWidth) || 0) * pxToMm,
            borderRightColor: styles.borderRightColor,
          };
        }

        return {
          sidebar: sidebarInfo,
          header: headerInfo,
        };
      });

      const sidebarInfo = layoutInfo.sidebar as SidebarInfo | null;
      const headerInfo = layoutInfo.header as HeaderInfo | null;

      console.log('[PDF SIDEBAR]', sidebarInfo);
      console.log('[PDF HEADER]', headerInfo);

      /*
       * ===================================================
       * STEP 1:
       * Generate PDF with ZERO margins.
       *
       * This preserves Chromium's ORIGINAL page count.
       * A 2-page resume remains 2 pages.
       * ===================================================
       */

      const rawPdf = await page.pdf({
        format: 'A4',

        printBackground: true,

        margin: {
          top: '0',
          right: '0',
          bottom: '0',
          left: '0',
        },
      });

      /*
       * ===================================================
       * STEP 2:
       * Add visual top/bottom spacing AFTER pagination.
       *
       * Changing this value WILL NOT create another page.
       * ===================================================
       */

      const PAGE_SPACING_MM = 6;

      const pdf = await addSafePageSpacing(
        rawPdf,
        sidebarInfo,
        headerInfo,
        PAGE_SPACING_MM,
      );

      /*
       * ===================================================
       * SEND FINAL PDF ONCE
       * ===================================================
       */

      res.set({
        'Content-Type': 'application/pdf',

        'Content-Disposition': 'attachment; filename="resume.pdf"',

        'Content-Length': pdf.length,
      });

      res.end(pdf);
    } finally {
      await browser.close();
    }
  }

  async fetchExportedResume(
    id: Uuid,
  ): Promise<SuccessResponse<GetResumeResDto>> {
    if (!id) {
      throw new ValidationException(ErrorCode.R000);
    }

    const cacheKey = createCacheKey(CacheKey.RESUME_EXPORT, id);
    const cachedData = await this.cacheManager.get<{
      userId: Uuid;
      resumeId: Uuid;
    }>(cacheKey);

    console.log('cachedData', { cachedData, id });

    if (!cachedData) {
      throw new ValidationException(ErrorCode.R001);
    }

    const { userId, resumeId } = cachedData;

    const resume = await this.resumeRepository.findOne({
      where: {
        id: resumeId,
        userId,
      },
    });

    if (!resume) {
      throw new ValidationException(ErrorCode.R001);
    }

    const {
      createdAt,
      updatedAt,
      createdBy,
      updatedBy,
      id: _id,
      userId: _userId,
      ...filteredResume
    } = resume;

    const finalData = {
      cvId: resumeId,
      ...filteredResume,
    };

    return transformSingleDto(
      GetResumeResDto,
      {
        cvData: finalData,
      },
      undefined,
      false,
    );
  }

  private async setCache(
    exportId: Uuid,
    userId: Uuid,
    resumeId: Uuid,
  ): Promise<void> {
    const tokenExpiresIn = this.configService.getOrThrow('auth.exportExpires', {
      infer: true,
    });

    await this.cacheManager.set(
      createCacheKey(CacheKey.RESUME_EXPORT, exportId),
      {
        userId,
        resumeId,
      },
      ms(tokenExpiresIn),
    );
  }
}
