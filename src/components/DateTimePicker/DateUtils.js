import DateLanguages from './DateLanguages';

export default {

  /**
   * Validates a date object
   * @param {Date} date - an object instantiated with the new Date constructor
   * @return {Boolean}
   */
  isValidDate(date) {
    if (Object.prototype.toString.call(date) !== '[object Date]') {
      return false;
    }
    return !isNaN(date.getTime());
  },

  /**
   * Return abbreviated week day name
   * @param {Date}
   * @param {Array}
   * @return {String}
   */
  getDayNameAbbr(date, days) {
    if (typeof date !== 'object') {
      throw TypeError('Invalid Type');
    }
    return days[date.getDay()];
  },

  /**
   * Return name of the month
   * @param {Number|Date}
   * @param {Array}
   * @return {String}
   */
  getMonthName(month, months) {
    if (!months) {
      throw Error('missing 2nd parameter Months array');
    }
    if (typeof month === 'object') {
      return months[month.getMonth()];
    }
    if (typeof month === 'number') {
      return months[month];
    }
    throw TypeError('Invalid type');
  },

  /**
   * Return an abbreviated version of the month
   * @param {Number|Date}
   * @return {String}
   */
  getMonthNameAbbr(month, monthsAbbr) {
    if (!monthsAbbr) {
      throw Error('missing 2nd paramter Months array');
    }
    if (typeof month === 'object') {
      return monthsAbbr[month.getMonth()];
    }
    if (typeof month === 'number') {
      return monthsAbbr[month];
    }
    throw TypeError('Invalid type');
  },

  /**
   * Alternative get total number of days in month
   * @param {Number} year
   * @param {Number} m
   * @return {Number}
   */
  daysInMonth(year, month) {
    // return /8|3|5|10/.test(month) ? 30 :
    // month === 1 ? ((!(year % 4) && year % 100) || !(year % 400) ? 29 : 28) : 31;
    const daysOfFeb = (!(year % 4) && year % 100) || !(year % 400) ? 29 : 28;
    const numOfDays = month === 1 ? daysOfFeb : 31;
    return /8|3|5|10/.test(month) ? 30 : numOfDays;
  },

  /**
   * Get nth suffix for date
   * @param {Number} day
   * @return {String}
   */
  getNthSuffix(day) {
    switch (day) {
      case 1:
      case 21:
      case 31:
        return 'st';
      case 2:
      case 22:
        return 'nd';
      case 3:
      case 23:
        return 'rd';
      default:
        return 'th';
    }
  },

  /**
   * Formats date object
   * @param {Date}
   * @param {String}
   * @param {Object}
   * @return {String}
   */
  formatDate(date, format, translation) {
    const translationCopy = (!translation) ? DateLanguages.translations.en : translation;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const str = format
      .replace(/dd/, (`0${day}`).slice(-2))
      .replace(/d/, day)
      .replace(/yyyy/, year)
      .replace(/yy/, String(year).slice(2))
      .replace(/MMMM/, this.getMonthName(date.getMonth(), translationCopy.months.original))
      .replace(/MMM/, this.getMonthNameAbbr(date.getMonth(), translationCopy.months.abbr))
      .replace(/MM/, (`0${month}`).slice(-2))
      .replace(/M(?!a|ä)/, month)
      .replace(/su/, this.getNthSuffix(date.getDate()))
      .replace(/D(?!e|é|i)/, this.getDayNameAbbr(date, translationCopy.days));
    return str;
  },

  /**
   * Creates an array of dates for each day in between two dates.
   * @param {Date} start
   * @param {Date} end
   * @return {Array}
   */
  createDateArray(start, end) {
    const dates = [];
    let startCopy = start;
    while (startCopy <= end) {
      dates.push(new Date(start));
      startCopy = new Date(startCopy).setDate(new Date(startCopy).getDate() + 1);
    }
    return dates;
  },

};
