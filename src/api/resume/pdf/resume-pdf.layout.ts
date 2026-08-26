import { Page } from 'playwright';

import {
  HeaderInfo,
  ResumeLayoutInfo,
  SidebarInfo,
} from './resume-pdf.types';

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
export async function stabilizePrintFragmentation(
  page: Page,
): Promise<void> {
  const MAX_PASSES = 6;

  for (let pass = 0; pass < MAX_PASSES; pass++) {
    const adjustments = await page.evaluate(() => {
      const template =
        document.querySelector<HTMLElement>(
          '.cv-template',
        );

      if (!template) {
        return [] as Array<{
          className: string;
          oldMarginBottom: number;
          keptMarginBottom: number;
          preservedSpacer: number;
          page: number;
        }>;
      }

      const templateRect =
        template.getBoundingClientRect();

      const pageHeightPx =
        templateRect.width *
        (297 / 210);

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

      const elements =
        Array.from(
          template.querySelectorAll<HTMLElement>(
            '*',
          ),
        );

      const classNameOf = (
        element: HTMLElement,
      ) =>
        typeof element.className === 'string'
          ? element.className
          : '';

      for (const element of elements) {
        /*
         * Never process the same row twice across the outer passes.
         */
        if (
          element.dataset
            .pdfFragmentSpacingHandled ===
          '1'
        ) {
          continue;
        }

        const rect =
          element.getBoundingClientRect();

        if (
          rect.width <= 0 ||
          rect.height <= 0
        ) {
          continue;
        }

        const styles =
          getComputedStyle(element);

        /*
         * The known Chromium fragmentation problem occurs on horizontal
         * multi-column rows. Detect by computed layout, not by class name,
         * section type, content text or item position.
         */
        const isHorizontalFlex =
          (
            styles.display === 'flex' ||
            styles.display === 'inline-flex'
          ) &&
          (
            styles.flexDirection === 'row' ||
            styles.flexDirection ===
              'row-reverse'
          );

        let isHorizontalGrid = false;

        if (
          styles.display === 'grid' ||
          styles.display === 'inline-grid'
        ) {
          const columns =
            styles.gridTemplateColumns
              .trim()
              .split(/\s+/)
              .filter(Boolean);

          isHorizontalGrid =
            columns.length > 1;
        }

        if (
          !isHorizontalFlex &&
          !isHorizontalGrid
        ) {
          continue;
        }

        const marginBottom =
          parseFloat(
            styles.marginBottom,
          ) || 0;

        if (marginBottom <= 0) {
          continue;
        }

        const relativeTop =
          rect.top -
          templateRect.top;

        const relativeBottom =
          rect.bottom -
          templateRect.top;

        const pageIndex =
          Math.max(
            0,
            Math.floor(
              Math.max(
                0,
                relativeTop,
              ) / pageHeightPx,
            ),
          );

        const pageBottom =
          (pageIndex + 1) *
          pageHeightPx;

        /*
         * The row's actual content/border box must already fit. If the row
         * itself crosses the page, this is not the margin-only problem and we
         * leave it untouched.
         */
        if (
          relativeBottom >
          pageBottom + 0.5
        ) {
          continue;
        }

        const outerBottom =
          relativeBottom +
          marginBottom;

        /*
         * The authored margin also fits: no intervention.
         */
        if (
          outerBottom <=
          pageBottom -
            SAFETY_PX
        ) {
          continue;
        }

        const keptMarginBottom =
          Math.max(
            0,
            Math.min(
              marginBottom,
              pageBottom -
                relativeBottom -
                SAFETY_PX,
            ),
          );

        const preservedSpacer =
          Math.max(
            0,
            marginBottom -
              keptMarginBottom,
          );

        if (
          preservedSpacer <
          0.5
        ) {
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
        const spacer =
          document.createElement(
            'div',
          );

        spacer.setAttribute(
          'data-pdf-preserved-spacing',
          'true',
        );

        spacer.setAttribute(
          'aria-hidden',
          'true',
        );

        spacer.style.setProperty(
          'display',
          'block',
          'important',
        );

        spacer.style.setProperty(
          'width',
          '100%',
          'important',
        );

        spacer.style.setProperty(
          'height',
          `${preservedSpacer}px`,
          'important',
        );

        spacer.style.setProperty(
          'min-height',
          '0',
          'important',
        );

        spacer.style.setProperty(
          'margin',
          '0',
          'important',
        );

        spacer.style.setProperty(
          'padding',
          '0',
          'important',
        );

        spacer.style.setProperty(
          'border',
          '0',
          'important',
        );

        spacer.style.setProperty(
          'background',
          'transparent',
          'important',
        );

        spacer.style.setProperty(
          'box-sizing',
          'border-box',
          'important',
        );

        spacer.style.setProperty(
          'break-inside',
          'auto',
          'important',
        );

        spacer.style.setProperty(
          'page-break-inside',
          'auto',
          'important',
        );

        spacer.style.setProperty(
          'pointer-events',
          'none',
          'important',
        );

        /*
         * If the parent itself is a grid, make the spacer span all columns so
         * it remains purely vertical spacing rather than becoming another
         * content column.
         */
        const parent =
          element.parentElement;

        if (parent) {
          const parentStyles =
            getComputedStyle(parent);

          if (
            parentStyles.display ===
              'grid' ||
            parentStyles.display ===
              'inline-grid'
          ) {
            spacer.style.setProperty(
              'grid-column',
              '1 / -1',
              'important',
            );
          }

          if (
            (
              parentStyles.display ===
                'flex' ||
              parentStyles.display ===
                'inline-flex'
            ) &&
            (
              parentStyles.flexDirection ===
                'row' ||
              parentStyles.flexDirection ===
                'row-reverse'
            )
          ) {
            /*
             * A spacer inserted into a horizontal flex parent would become a
             * third column. In that uncommon structure, preserve layout by
             * declining the transformation entirely.
             */
            element.style.removeProperty(
              'margin-bottom',
            );

            continue;
          }
        }

        element.insertAdjacentElement(
          'afterend',
          spacer,
        );

        element.dataset
          .pdfFragmentSpacingHandled =
          '1';

        changed.push({
          className:
            classNameOf(element),

          oldMarginBottom:
            marginBottom,

          keptMarginBottom,

          preservedSpacer,

          page:
            pageIndex + 1,
        });
      }

      /*
       * Force layout before deciding whether another pass is required.
       */
      void template.offsetHeight;

      return changed;
    });

    if (
      adjustments.length === 0
    ) {
      break;
    }

    console.log(
      '[PDF FRAGMENT SPACING PRESERVED]',
      adjustments,
    );

    await page.evaluate(
      () =>
        new Promise<void>(
          (resolve) => {
            requestAnimationFrame(
              () => {
                requestAnimationFrame(
                  () =>
                    resolve(),
                );
              },
            );
          },
        ),
    );
  }
}

/**
 * Measure the header and sidebar from the actual rendered template.
 *
 * Header and sidebar are intentionally independent.
 *
 * A template can have:
 * - header + sidebar
 * - header only
 * - sidebar only
 * - neither
 */
export async function measureResumeLayout(
  page: Page,
): Promise<ResumeLayoutInfo> {
  const layoutInfo =
    await page.evaluate(() => {
      const template =
        document.querySelector<HTMLElement>(
          '.cv-template',
        );

      if (!template) {
        return {
          sidebar: null,
          header: null,
        };
      }

      const templateRect =
        template.getBoundingClientRect();

      const pxToMm =
        210 /
        templateRect.width;

      /*
       * =================================================
       * HEADER
       * =================================================
       */

      const header =
        template.querySelector<HTMLElement>(
          '[data-cv-header]',
        );

      let headerInfo = null;

      if (header) {
        const headerRect =
          header.getBoundingClientRect();

        headerInfo = {
          exists: true,

          topMm:
            (
              headerRect.top -
              templateRect.top
            ) * pxToMm,

          rightGapMm:
            (
              templateRect.right -
              headerRect.right
            ) * pxToMm,
        };
      }

      /*
       * =================================================
       * SIDEBAR
       * =================================================
       */

      const sidebar =
        template.querySelector<HTMLElement>(
          '[data-cv-sidebar]',
        );

      let sidebarInfo = null;

      if (sidebar) {
        const sidebarRect =
          sidebar.getBoundingClientRect();

        const styles =
          getComputedStyle(sidebar);

        sidebarInfo = {
          leftMm:
            (
              sidebarRect.left -
              templateRect.left
            ) * pxToMm,

          topMm:
            (
              sidebarRect.top -
              templateRect.top
            ) * pxToMm,

          widthMm:
            sidebarRect.width *
            pxToMm,

          backgroundColor:
            styles.backgroundColor,

          borderLeftWidthMm:
            (
              parseFloat(
                styles.borderLeftWidth,
              ) || 0
            ) * pxToMm,

          borderLeftColor:
            styles.borderLeftColor,

          borderRightWidthMm:
            (
              parseFloat(
                styles.borderRightWidth,
              ) || 0
            ) * pxToMm,

          borderRightColor:
            styles.borderRightColor,
        };
      }

      return {
        sidebar:
          sidebarInfo,

        header:
          headerInfo,
      };
    });

  return {
    sidebar:
      layoutInfo.sidebar as
        | SidebarInfo
        | null,

    header:
      layoutInfo.header as
        | HeaderInfo
        | null,
  };
}