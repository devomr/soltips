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
    value: '#794BC4',
    title: 'Purple',
  },
  {
    value: '#FF5F5F',
    title: 'Red',
  },
  {
    value: '#F45D22',
    title: 'Orange',
  },
  {
    value: '#FCBF47',
    title: 'Yellow',
  },
  {
    value: '#5CB85C',
    title: 'Green',
  },
  {
    value: '#00B9FE',
    title: 'Blue',
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
