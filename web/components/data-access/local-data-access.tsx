type DonationItem = {
  icon: string;
  value: string;
  plural: string;
};

type ThemeColor = {
  value: string;
  title: string;
};

const availableThemeColors: ThemeColor[] = [
  {
    value: 'creator-theme-blue',
    title: 'Blue',
  },
  {
    value: 'creator-theme-green',
    title: 'Green',
  },
  {
    value: 'creator-theme-yellow',
    title: 'Yellow',
  },
  {
    value: 'creator-theme-orange',
    title: 'Orange',
  },
  {
    value: 'creator-theme-red',
    title: 'Red',
  },
  {
    value: 'creator-theme-purple',
    title: 'Purple',
  },
];

const availableDonationItems: DonationItem[] = [
  {
    icon: '☕',
    value: 'coffee',
    plural: 'coffees',
  },
  {
    icon: '🍺',
    value: 'beer',
    plural: 'beers',
  },
  {
    icon: '🍵',
    value: 'tea',
    plural: 'teas',
  },
  {
    icon: '🍕',
    value: 'pizza',
    plural: 'pizzas',
  },
  {
    icon: '🍪',
    value: 'cookie',
    plural: 'cookies',
  },
];

export const getDonationItems = () => {
  return availableDonationItems;
};

export const getDonationItem = (value: string) => {
  const item = availableDonationItems.find((item) => item.value === value);

  if (!item) {
    return availableDonationItems[0];
  }

  return item;
};

export const getThemeColors = () => {
  return availableThemeColors;
};
