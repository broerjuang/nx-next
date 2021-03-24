import { PHASE_PRODUCTION_BUILD } from 'next/dist/next-server/lib/constants';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import { createWebpackConfig, prepareConfig } from './config';
import { NextBuildBuilderOptions } from '@nrwl/next';
import { basename, dirname } from 'path';

jest.mock('tsconfig-paths-webpack-plugin');
jest.mock('next/dist/next-server/server/config', () => ({
  __esModule: true,
  default: () => ({
    webpack: () => ({}),
  }),
}));

describe('Next.js webpack config builder', () => {
  beforeEach(() => {
    (TsconfigPathsPlugin as any).mockClear();
  });

  describe('createWebpackConfig', () => {
    it('should set the resolve plugins', () => {
      const webpackConfig = createWebpackConfig('/root', 'apps/wibble', []);

      webpackConfig(
        { resolve: { alias: {} }, module: { rules: [] }, plugins: [] },
        { defaultLoaders: {} }
      );

      expect(TsconfigPathsPlugin).toHaveBeenCalledWith({
        configFile: '/root/apps/wibble/tsconfig.json',
        extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx'],
        mainFields: ['es2015', 'module', 'main'],
      });
    });

    it('should set the resolve aliases', () => {
      const webpackConfig = createWebpackConfig('/root', 'apps/wibble', [
        {
          replace: 'apps/wibble/src/environment.ts',
          with: 'apps/wibble/src/environment.prod.ts',
        },
      ]);

      const config = webpackConfig(
        { resolve: { alias: {} }, module: { rules: [] }, plugins: [] },
        { defaultLoaders: {} }
      );

      expect(config.resolve.alias).toEqual({
        '/root/apps/wibble/src/environment.ts':
          '/root/apps/wibble/src/environment.prod.ts',
      });
    });

    it('should set the rules', () => {
      const webpackConfig = createWebpackConfig('/root', 'apps/wibble', []);

      const config = webpackConfig(
        { resolve: { alias: {} }, module: { rules: [] }, plugins: [] },
        { defaultLoaders: {} }
      );

      // not much value in checking what they are
      // just check they get added
      expect(config.module.rules.length).toBe(2);
    });
  });

  describe('prepareConfig', () => {
    it('should set the dist and out directories', async () => {
      const config = await prepareConfig(
        PHASE_PRODUCTION_BUILD,
        {
          root: 'apps/wibble',
          outputPath: 'dist/apps/wibble',
          fileReplacements: [],
        },
        { root: '/root' } as any
      );

      expect(config).toEqual(
        expect.objectContaining({
          distDir: '../../dist/apps/wibble/.next',
          outdir: '../../dist/apps/wibble',
        })
      );
    });

    it('should support nextConfig option to customize the config', async () => {
      const fullPath = require.resolve('./config.fixture');
      const rootPath = dirname(fullPath);
      const config = await prepareConfig(
        PHASE_PRODUCTION_BUILD,
        {
          root: 'apps/wibble',
          outputPath: 'dist/apps/wibble',
          fileReplacements: [],
          nextConfig: 'config.fixture',
          customValue: 'test',
        } as NextBuildBuilderOptions,
        { root: rootPath } as any
      );

      expect(config).toMatchObject({
        myPhase: 'phase-production-build',
        myCustomValue: 'test',
      });
    });

    it('should provide error message when nextConfig path is invalid', async () => {
      await expect(() =>
        prepareConfig(
          PHASE_PRODUCTION_BUILD,
          {
            root: 'apps/wibble',
            outputPath: 'dist/apps/wibble',
            fileReplacements: [],
            nextConfig: 'config-does-not-exist.fixture',
            customValue: 'test',
          } as NextBuildBuilderOptions,
          { root: '/root' } as any
        )
      ).rejects.toThrow(/Could not find file/);
    });

    it('should provide error message when nextConfig does not export a function', async () => {
      await expect(() =>
        prepareConfig(
          PHASE_PRODUCTION_BUILD,
          {
            root: 'apps/wibble',
            outputPath: 'dist/apps/wibble',
            fileReplacements: [],
            nextConfig: require.resolve('./config-not-a-function.fixture'),
            customValue: 'test',
          } as NextBuildBuilderOptions,
          { root: '/root' } as any
        )
      ).rejects.toThrow(/option does not export a function/);
    });
  });
});
