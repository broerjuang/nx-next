import { Linter } from '@nrwl/workspace';
import { runSchematic } from '../../utils/testing';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import {
  getProjects,
  readJson,
  readWorkspaceConfiguration,
  Tree,
} from '@nrwl/devkit';

import { applicationGenerator } from './application';

describe('app', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  describe('not nested', () => {
    it('should update workspace.json', async () => {
      await applicationGenerator(tree, { name: 'myApp', style: 'css' });

      const workspaceJson = readJson(tree, 'workspace.json');

      expect(workspaceJson.projects['my-app'].root).toEqual('apps/my-app');
      expect(workspaceJson.projects['my-app-e2e'].root).toEqual(
        'apps/my-app-e2e'
      );
      expect(workspaceJson.defaultProject).toEqual('my-app');
    });

    it('should update nx.json', async () => {
      await applicationGenerator(tree, {
        name: 'myApp',
        style: 'css',
        tags: 'one,two',
      });

      const nxJson = readJson(tree, 'nx.json');

      expect(nxJson.projects).toMatchObject({
        'my-app': {
          tags: ['one', 'two'],
        },
        'my-app-e2e': {
          tags: [],
          implicitDependencies: ['my-app'],
        },
      });
    });

    it('should generate files', async () => {
      await applicationGenerator(tree, { name: 'myApp', style: 'css' });
      expect(tree.exists('apps/my-app/tsconfig.json')).toBeTruthy();
      expect(tree.exists('apps/my-app/tsconfig.app.json')).toBeTruthy();
      expect(tree.exists('apps/my-app/pages/index.tsx')).toBeTruthy();
      expect(tree.exists('apps/my-app/specs/index.spec.tsx')).toBeTruthy();
      expect(tree.exists('apps/my-app/pages/index.module.css')).toBeTruthy();
    });
  });

  describe('--style scss', () => {
    it('should generate scss styles', async () => {
      await applicationGenerator(tree, {
        name: 'myApp',
        style: 'scss',
      });

      expect(tree.exists('apps/my-app/pages/index.module.scss')).toBeTruthy();
      expect(tree.exists('apps/my-app/pages/styles.css')).toBeTruthy();

      const indexContent = tree.read('apps/my-app/pages/index.tsx').toString();
      expect(indexContent).toContain(
        `import styles from './index.module.scss'`
      );
    });
  });

  describe('--style less', () => {
    it('should generate scss styles', async () => {
      await applicationGenerator(tree, {
        name: 'myApp',
        style: 'less',
      });

      expect(tree.exists('apps/my-app/pages/index.module.less')).toBeTruthy();
      expect(tree.exists('apps/my-app/pages/styles.less')).toBeTruthy();

      const indexContent = tree.read('apps/my-app/pages/index.tsx').toString();
      expect(indexContent).toContain(
        `import styles from './index.module.less'`
      );
    });
  });

  describe('--style styl', () => {
    it('should generate scss styles', async () => {
      await applicationGenerator(tree, {
        name: 'myApp',
        style: 'styl',
      });

      expect(tree.exists('apps/my-app/pages/index.module.styl')).toBeTruthy();
      expect(tree.exists('apps/my-app/pages/styles.styl')).toBeTruthy();

      const indexContent = tree.read('apps/my-app/pages/index.tsx').toString();
      expect(indexContent).toContain(
        `import styles from './index.module.styl'`
      );
    });
  });

  describe('--style styled-components', () => {
    it('should generate scss styles', async () => {
      await applicationGenerator(tree, {
        name: 'myApp',
        style: 'styled-components',
      });

      expect(
        tree.exists('apps/my-app/pages/index.module.styled-components')
      ).toBeFalsy();
      expect(tree.exists('apps/my-app/pages/styles.css')).toBeTruthy();

      const indexContent = tree.read('apps/my-app/pages/index.tsx').toString();
      expect(indexContent).not.toContain(`import styles from './index.module`);
      expect(indexContent).toContain(`import styled from 'styled-components'`);
    });
  });

  describe('--style @emotion/styled', () => {
    it('should generate scss styles', async () => {
      await applicationGenerator(tree, {
        name: 'myApp',
        style: '@emotion/styled',
      });

      expect(
        tree.exists('apps/my-app/pages/index.module.styled-components')
      ).toBeFalsy();
      expect(tree.exists('apps/my-app/pages/styles.css')).toBeTruthy();

      const indexContent = tree.read('apps/my-app/pages/index.tsx').toString();
      expect(indexContent).not.toContain(`import styles from './index.module`);
      expect(indexContent).toContain(`import styled from '@emotion/styled'`);
    });
  });

  describe('--style styled-jsx', () => {
    it('should use <style jsx> in index page', async () => {
      await applicationGenerator(tree, {
        name: 'myApp',
        style: 'styled-jsx',
      });

      const indexContent = tree.read('apps/my-app/pages/index.tsx').toString();

      const babelJestConfig = readJson(
        tree,
        'apps/my-app/babel-jest.config.json'
      );

      expect(indexContent).toMatch(/<style jsx>{`.page {}`}<\/style>/);
      expect(babelJestConfig.plugins).toContain('styled-jsx/babel');
      expect(
        tree.exists('apps/my-app/pages/index.module.styled-jsx')
      ).toBeFalsy();
      expect(tree.exists('apps/my-app/pages/styles.css')).toBeTruthy();

      expect(indexContent).not.toContain(`import styles from './index.module`);
      expect(indexContent).not.toContain(
        `import styled from 'styled-components'`
      );
    });
  });

  it('should setup jest with tsx support', async () => {
    await applicationGenerator(tree, { name: 'my-app', style: 'css' });

    expect(tree.read('apps/my-app/jest.config.js').toString('utf-8')).toContain(
      `moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],`
    );
  });

  it('should setup jest with SVGR support', async () => {
    await applicationGenerator(tree, { name: 'my-app', style: 'css' });

    expect(tree.read('apps/my-app/jest.config.js').toString('utf-8')).toContain(
      `'^(?!.*\\\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest'`
    );
  });

  it('should set up the nrwl next build builder', async () => {
    await applicationGenerator(tree, { name: 'my-app', style: 'css' });

    const workspaceJson = readJson(tree, 'workspace.json');
    const architectConfig = workspaceJson.projects['my-app'].architect;
    expect(architectConfig.build.builder).toEqual('@nrwl/next:build');
    expect(architectConfig.build.options).toEqual({
      root: 'apps/my-app',
      outputPath: 'dist/apps/my-app',
    });
  });

  it('should set up the nrwl next server builder', async () => {
    await applicationGenerator(tree, { name: 'my-app', style: 'css' });

    const workspaceJson = readJson(tree, 'workspace.json');
    const architectConfig = workspaceJson.projects['my-app'].architect;
    expect(architectConfig.serve.builder).toEqual('@nrwl/next:server');
    expect(architectConfig.serve.options).toEqual({
      buildTarget: 'my-app:build',
      dev: true,
    });
    expect(architectConfig.serve.configurations).toEqual({
      production: { dev: false, buildTarget: 'my-app:build:production' },
    });
  });

  it('should set up the nrwl next export builder', async () => {
    await applicationGenerator(tree, { name: 'my-app', style: 'css' });

    const workspaceJson = readJson(tree, 'workspace.json');
    const architectConfig = workspaceJson.projects['my-app'].architect;
    expect(architectConfig.export.builder).toEqual('@nrwl/next:export');
    expect(architectConfig.export.options).toEqual({
      buildTarget: 'my-app:build:production',
    });
  });

  describe('--unit-test-runner none', () => {
    it('should not generate test configuration', async () => {
      await applicationGenerator(tree, {
        name: 'myApp',
        style: 'css',
        unitTestRunner: 'none',
      });
      expect(tree.exists('jest.config.js')).toBeFalsy();
      expect(tree.exists('apps/my-app/specs/index.spec.tsx')).toBeFalsy();
    });
  });

  describe('--e2e-test-runner none', () => {
    it('should not generate test configuration', async () => {
      await applicationGenerator(tree, {
        name: 'myApp',
        style: 'css',
        e2eTestRunner: 'none',
      });
      expect(tree.exists('apps/my-app-e2e')).toBeFalsy();
      const workspaceJson = readJson(tree, 'workspace.json');
      expect(workspaceJson.projects['my-app-e2e']).toBeUndefined();
    });
  });

  it('should generate functional components by default', async () => {
    await applicationGenerator(tree, { name: 'myApp', style: 'css' });

    const appContent = tree.read('apps/my-app/pages/index.tsx').toString();

    expect(appContent).not.toMatch(/extends Component/);
  });

  describe('--linter=eslint', () => {
    it('should add .eslintrc.json and dependencies', async () => {
      await applicationGenerator(tree, {
        name: 'myApp',
        style: 'css',
        linter: Linter.EsLint,
      });

      const eslintJson = readJson(tree, '/apps/my-app/.eslintrc.json');
      const packageJson = readJson(tree, '/package.json');

      expect(eslintJson.extends).toEqual(
        expect.arrayContaining(['plugin:@nrwl/nx/react'])
      );
      expect(packageJson).toMatchObject({
        devDependencies: {
          'eslint-plugin-react': expect.anything(),
          'eslint-plugin-react-hooks': expect.anything(),
        },
      });
    });
  });

  describe('--js', () => {
    it('generates JS files', async () => {
      await applicationGenerator(tree, {
        name: 'myApp',
        style: 'css',
        js: true,
      });

      expect(tree.exists('apps/my-app/pages/index.js')).toBeTruthy();
      expect(tree.exists('apps/my-app/specs/index.spec.js')).toBeTruthy();
      expect(tree.exists('apps/my-app/index.d.js')).toBeFalsy();
      expect(tree.exists('apps/my-app/index.d.ts')).toBeFalsy();

      const tsConfig = readJson(tree, 'apps/my-app/tsconfig.json');
      expect(tsConfig.compilerOptions.allowJs).toEqual(true);

      const tsConfigApp = readJson(tree, 'apps/my-app/tsconfig.app.json');
      expect(tsConfigApp.include).toContain('**/*.js');
      expect(tsConfigApp.exclude).toContain('**/*.spec.js');
    });
  });
});
