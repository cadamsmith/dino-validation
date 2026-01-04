import dv from '..';

/*
 * Localized methods for locale: PT_BR
 */
dv.localize({
  date: ({ blank, value }) => {
    return blank || /^\d\d?\/\d\d?\/\d\d\d?\d?$/.test(value);
  },
});
