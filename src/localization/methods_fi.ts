import dv from '..';

/*
 * Localized methods for locale: FI
 */
dv.localize({
  date: ({ blank, value }) => {
    return blank || /^\d{1,2}\.\d{1,2}\.\d{4}$/.test(value);
  },
  number: ({ blank, value }) => {
    return blank || /^-?\d+(?:,\d+)?$/.test(value);
  },
});
