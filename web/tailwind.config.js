const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}',
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      textColor: {
        creator: {
          primary: withOpacity('--creator-theme-color'),
          100: withOpacity('--creator-theme-text-color-100'),
          20: withOpacity('--creator-theme-text-color-20'),
        },
      },
      backgroundColor: {
        creator: {
          primary: withOpacity('--creator-theme-color'),
        },
      },
      borderColor: {
        creator: {
          primary: withOpacity('--creator-theme-color'),
        },
      },
    },
  },
  plugins: [require('daisyui')],
};

function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}
