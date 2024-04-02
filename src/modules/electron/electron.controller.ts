import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ManifestQueryDto } from '@util/common';
import { Response } from 'express';
import { CheckManifestQuery, CreateManifestBody } from './electron.dto';
import { ElectronService } from './electron.service';
import { ElectronPlatform } from './electron.types';
import { GithubService } from './github';

@ApiTags('electron')
@Controller('electron')
export class ElectronController {
  constructor(
    private readonly electronService: ElectronService,
    private readonly githubService: GithubService,
  ) {}

  @ApiOperation({
    summary: '최신 electron manifest',
  })
  @Get('manifests/release/:releaseName/latest')
  async getLatestElectronManifest(
    @Query() query: ManifestQueryDto<ElectronPlatform>,
    @Param('releaseName') releaseName: string,
  ) {
    const manifest = await this.electronService.getElectronManifest({
      version: query.version,
      platform: query.platform,
      releaseName,
    });

    return manifest;
  }

  @ApiOperation({
    summary: 'github release asset 다운로드',
  })
  @Get('manifests/:manifestId/release/asset')
  async getManifest(@Param('manifestId') manifestId: number, @Res() res: Response) {
    const electronManifest = await this.electronService.getElectronManifestById(manifestId);

    if (!electronManifest?.githubReleaseName) {
      return res.status(404).send();
    }

    const downloadUrl = await this.githubService.getReleaseAssets(
      electronManifest?.githubReleaseName as string,
    );

    res.setHeader('Location', downloadUrl);
    res.status(302).send();
  }

  @ApiOperation({
    summary: 'create electron manifest',
  })
  @Post('manifests')
  async createManifest(@Body() createBody: CreateManifestBody) {
    return this.electronService.createManifest(createBody);
  }

  @ApiOperation({
    summary: 'check latest manifest',
  })
  @Get('manifests/release/:releaseName/check/latest')
  async checkLatestManifest(
    @Query() query: CheckManifestQuery,
    @Param('releaseName') releaseName: string,
  ) {
    return this.electronService.checkLatestManifest(releaseName, query);
  }
}
