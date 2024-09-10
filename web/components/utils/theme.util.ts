export function getCreatorTheme(color: string) {
  const primaryColor = getRGBColor(color, 'creator-theme-color');
  const textColor100 = getRGBColor(
    getAccessibleTextColor(color, 1),
    'creator-theme-text-color-100',
  );
  const textColor20 = getRGBColor(
    getAccessibleTextColor(color, 0.2),
    'creator-theme-text-color-20',
  );

  return {
    ...primaryColor,
    ...textColor100,
    ...textColor20,
  } as React.CSSProperties;
}

function hexToRgb(hex: string): [number, number, number] {
  let color = hex.replace(/^#/, '');

  // Check if the hex color is valid
  if (color.length !== 6 && color.length !== 3) {
    throw new Error('Invalid hex color format');
  }

  // Expand shorthand hex (e.g., #abc -> #aabbcc)
  if (color.length === 3) {
    color = color
      .split('')
      .map((c) => c + c)
      .join('');
  }

  // Convert to RGB values
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  return [r, g, b];
}

/**
 * This function calculates the luminance of a color, which is a measure of how bright the color appears.
 * @param r Red value
 * @param g Green value
 * @param b Blue value
 * @returns Luminance value (a number between 0 and 1).
 */
function luminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * This function computes the contrast ratio between two colors, which helps determine how readable text is against a background.
 * @param r1 Red value first color
 * @param g1 Green value first color
 * @param b1 Blue value first color
 * @param r2 Red value second color
 * @param g2 Green value second color
 * @param b2 Blue value second color
 * @returns Contrast ratio (a number representing the contrast between the two colors).
 */
function contrast(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number,
): number {
  const lum1 = luminance(r1, g1, b1);
  const lum2 = luminance(r2, g2, b2);
  const light = Math.max(lum1, lum2);
  const dark = Math.min(lum1, lum2);
  return (light + 0.05) / (dark + 0.05);
}

export const getRGBColor = (hex: string, type: string) => {
  const [r, g, b] = hexToRgb(hex);

  return {
    [`--${type}`]: `${r}, ${g}, ${b}`,
  };
};

export const getAccessibleTextColor = (hex: string, opacity: number = 1) => {
  const [rB, gB, bB] = hexToRgb(hex);
  const rW = 255,
    gW = 255,
    bW = 255; // Assuming white as the background for transparency calculation

  const rFinal = Math.round(rB * opacity + rW * (1 - opacity));
  const gFinal = Math.round(gB * opacity + gW * (1 - opacity));
  const bFinal = Math.round(bB * opacity + bW * (1 - opacity));

  const contrastWithBlack = contrast(rFinal, gFinal, bFinal, 0, 0, 0);
  const contrastWithWhite = contrast(rFinal, gFinal, bFinal, 255, 255, 255);

  return contrastWithBlack > contrastWithWhite ? '#000000' : '#FFFFFF';
};
