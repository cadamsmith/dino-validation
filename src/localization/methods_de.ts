import dv from '..';

/*
 * Localized methods for locale: DE
 */
dv.localize({
  date: ({ blank, value }) => {
    return blank || /^\d\d?\.\d\d?\.\d\d\d?\d?$/.test(value);
  },
  number: ({ blank, value }) => {
    return blank || /^-?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d+)?$/.test(value);
  },
});
