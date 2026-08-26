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
import { chromium } from 'playwright';
import { Repository } from 'typeorm/repository/Repository';
import { GetResumeResDto } from './dto/get-resume.res.dto';
import { ResumeEntity } from './entities/resume.entity';
import {
  measureResumeLayout,
  stabilizePrintFragmentation,
} from './pdf/resume-pdf.layout';
import { addSafePageSpacing } from './pdf/resume-pdf.processor';

@Injectable()
export class ResumeExportService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,

    @InjectRepository(ResumeEntity)
    private readonly resumeRepository: Repository<ResumeEntity>,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

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

    // console.log(`exportId: ${exportId}`);

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

      // page.on('console', (msg) => console.log('[PAGE LOG]', msg.text()));

      // page.on('pageerror', (err) => console.log('[PAGE ERROR]', err.message));

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
       * STEP 1
       * Normalize only the horizontal-row margin condition
       * that causes Chromium to create large false page gaps.
       * ===================================================
       */

      await stabilizePrintFragmentation(page);

      /*
       * ===================================================
       * STEP 2
       * Measure optional header and sidebar independently.
       * ===================================================
       */

      const { sidebar: sidebarInfo, header: headerInfo } =
        await measureResumeLayout(page);

      // console.log('[PDF SIDEBAR]', sidebarInfo);
      // console.log('[PDF HEADER]', headerInfo);

      /*
       * ===================================================
       * STEP 3
       * Generate Chromium's zero-margin A4 PDF.
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
       * STEP 4
       * Add safe visual spacing after Chromium pagination.
       *
       * Because this happens after pagination, changing
       * PAGE_SPACING_MM does not create another Chromium page.
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
       * STEP 5
       * Return the final PDF.
       * ===================================================
       */

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${resume.cvTitle}.pdf`,
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

    // console.log('cachedData', {
    //   cachedData,
    //   id,
    // });

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
