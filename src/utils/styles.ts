import { CSS_IN_JS_DEPENDENCIES } from '@nrwl/react';
import {
  babelPluginStyledComponentsVersion,
  emotionServerVersion,
  zeitNextCss,
  zeitNextLess,
  zeitNextSass,
  zeitNextStylus,
  nodeSass
} from './versions';

export const NEXT_SPECIFIC_STYLE_DEPENDENCIES = {
  'styled-components': {
    dependencies: CSS_IN_JS_DEPENDENCIES['styled-components'].dependencies,
    devDependencies: {
      ...CSS_IN_JS_DEPENDENCIES['styled-components'].devDependencies,
      'babel-plugin-styled-components': babelPluginStyledComponentsVersion
    }
  },
  '@emotion/styled': {
    dependencies: {
      ...CSS_IN_JS_DEPENDENCIES['@emotion/styled'].dependencies,
      'emotion-server': emotionServerVersion
    },
    devDependencies: CSS_IN_JS_DEPENDENCIES['@emotion/styled'].devDependencies
  },
  css: {
    dependencies: {
      '@zeit/next-css': zeitNextCss
    },
    devDependencies: {}
  },
  scss: {
    dependencies: {
      '@zeit/next-sass': zeitNextSass
    },
    devDependencies: {
      'node-sass': nodeSass
    }
  },
  less: {
    dependencies: {
      '@zeit/next-less': zeitNextLess
    },
    devDependencies: {}
  },
  styl: {
    dependencies: {
      '@zeit/next-stylus': zeitNextStylus
    },
    devDependencies: {}
  }
};
