import { assertValidStyle } from '@nrwl/react';
import { getWorkspaceLayout, names, Tree } from '@nrwl/devkit';

import { Schema } from '../schema';

export interface NormalizedSchema extends Schema {
  projectName: string;
  appProjectRoot: string;
  e2eProjectName: string;
  e2eProjectRoot: string;
  parsedTags: string[];
  fileName: string;
  styledModule: null | string;
  js?: boolean;
}

export function normalizeOptions(
  host: Tree,
  options: Schema
): NormalizedSchema {
  const appDirectory = options.directory
    ? `${names(options.directory).fileName}/${names(options.name).fileName}`
    : names(options.name).fileName;

  const { appsDir } = getWorkspaceLayout(host);

  const appProjectName = appDirectory.replace(new RegExp('/', 'g'), '-');
  const e2eProjectName = `${appProjectName}-e2e`;

  const appProjectRoot = `${appsDir}/${appDirectory}`;
  const e2eProjectRoot = `${appsDir}/${appDirectory}-e2e`;

  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  const fileName = 'index';

  const styledModule = /^(css|scss|less|styl)$/.test(options.style)
    ? null
    : options.style;

  assertValidStyle(options.style);

  return {
    ...options,
    name: names(options.name).fileName,
    projectName: appProjectName,
    unitTestRunner: options.unitTestRunner || 'jest',
    e2eTestRunner: options.e2eTestRunner || 'cypress',
    style: options.style || 'css',
    appProjectRoot,
    e2eProjectRoot,
    e2eProjectName,
    parsedTags,
    fileName,
    styledModule,
  };
}
