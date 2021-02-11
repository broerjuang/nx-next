import { generateProjectLint } from '@nrwl/workspace';
import { NormalizedSchema } from './normalize-options';
import {
  addProjectConfiguration,
  joinPathFragments,
  NxJsonProjectConfiguration,
  ProjectConfiguration,
  Tree,
} from '@nrwl/devkit';

export function addProject(host: Tree, options: NormalizedSchema) {
  const nxConfig: NxJsonProjectConfiguration = {
    tags: options.parsedTags,
  };

  const targets: Record<string, any> = {};

  targets.build = {
    builder: '@nrwl/next:build',
    outputs: ['{options.outputPath}'],
    options: {
      root: options.appProjectRoot,
      outputPath: joinPathFragments('dist', options.appProjectRoot),
    },
    // This has to be here so `nx serve [app] --prod` will work. Otherwise
    // a missing configuration error will be thrown.
    configurations: {
      production: {},
    },
  };

  targets.serve = {
    builder: '@nrwl/next:server',
    options: {
      buildTarget: `${options.projectName}:build`,
      dev: true,
    },
    configurations: {
      production: {
        buildTarget: `${options.projectName}:build:production`,
        dev: false,
      },
    },
  };

  if (options.server) {
    targets.serve.options = {
      ...targets.serve.options,
      customServerPath: options.server,
    };
  }

  targets.export = {
    builder: '@nrwl/next:export',
    options: {
      buildTarget: `${options.projectName}:build:production`,
    },
  };

  targets.lint = generateProjectLint(
    options.appProjectRoot,
    joinPathFragments(options.appProjectRoot, 'tsconfig.json'),
    options.linter,
    [`${options.appProjectRoot}/**/*.{ts,tsx,js,jsx}`]
  );

  const project: ProjectConfiguration = {
    root: options.appProjectRoot,
    sourceRoot: options.appProjectRoot,
    projectType: 'application',
    targets,
  };

  addProjectConfiguration(host, options.projectName, {
    ...project,
    ...nxConfig,
  });
}
