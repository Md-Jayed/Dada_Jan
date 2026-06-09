import { Product } from '../types';

const HIJRI_MONTHS_EN = [
  "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
  "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
];

const HIJRI_MONTHS_BN = [
  "মুহররম", "সফর", "রবিউল আউয়াল", "রবিউস সানি",
  "জমাদিউল আউয়াল", "জমাদিউস সানি", "রজব", "শাবান",
  "রমজান", "শাওয়াল", "জিলকদ", "জিলহজ"
];

const GREGORIAN_MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const GREGORIAN_MONTHS_BN = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
];

const DAYS_EN = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

const DAYS_BN = [
  "রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"
];

const FAITH_REMINDERS_BN: { [key: number]: string } = {
  0: "ইবাদাত ও রহমত",
  1: "সুন্নাত অনুসরণের বারাকাহ ও দিন",
  2: "সাফল্য ও বারাকাহ",
  3: "জ্ঞান ও হিকমাহ",
  4: "দোয়া কবুল ও সুন্নাহ সিয়াম",
  5: "জুম্মাহ মোবারক - সপ্তাহের শ্রেষ্ঠ মুমিন দিন",
  6: "সবর ও অধ্যবসায়"
};

const FAITH_REMINDERS_EN: { [key: number]: string } = {
  0: "Devotion & Mercy",
  1: "Sunnah Sunrising Fasting & Blessing Day",
  2: "Success & Barakah",
  3: "Knowledge & Wisdom",
  4: "Supplications & Sunnah Fasting",
  5: "Jummah Mubarak - Noble Day of Congregation",
  6: "Patience & Perseverance"
};

function toBengaliNumerals(num: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().split('').map(digit => {
    const d = parseInt(digit, 10);
    return isNaN(d) ? digit : bnDigits[d];
  }).join('');
}

/**
 * Robust Gregorian-to-Hijri Tabular conversion algorithm
 */
export function gregorianToHijri(date: Date): { day: number; month: number; year: number } {
  const JDEpoch = 1948439.5;
  const time = date.getTime();
  const jd = (time / 86400000) + 2440587.5;
  
  const days = jd - JDEpoch;
  const cycle = Math.floor(days / 10631);
  let remDays = days - cycle * 10631;
  
  let year = 30 * cycle;
  const leapPattern = [0, 2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];
  
  for (let y = 1; y <= 30; y++) {
    const isLeap = leapPattern.includes(y % 30);
    const yearLength = isLeap ? 355 : 354;
    if (remDays < yearLength) {
      year += y;
      break;
    }
    remDays -= yearLength;
    if (y === 30) {
      year += 30;
    }
  }
  
  const isLeapYear = leapPattern.includes(year % 30);
  let month = 1;
  let day = 1;
  
  for (let m = 1; m <= 12; m++) {
    let monthLength = (m % 2 === 1) ? 30 : 29;
    if (m === 12 && isLeapYear) {
      monthLength = 30;
    }
    if (remDays < monthLength) {
      month = m;
      day = Math.floor(remDays) + 1;
      break;
    }
    remDays -= monthLength;
  }
  
  day = Math.max(1, Math.min(30, day));
  month = Math.max(1, Math.min(12, month));
  
  return { day, month, year };
}

/**
 * Formats a Gregorian date into a premium, faith-based brand aesthetic.
 * Integrates both Gregorian & Hijri calculations, day name, and spiritual blessings.
 */
export function formatFaithDate(
  dateInput: Date | string | number,
  lang: 'bn' | 'en' = 'bn'
): string {
  const date = typeof dateInput === 'object' ? dateInput : new Date(dateInput);
  
  // Validate date context
  if (isNaN(date.getTime())) {
    return lang === 'bn' ? 'অজানা সময়' : 'N/A';
  }

  const dayOfWeek = date.getDay();
  const gregDay = date.getDate();
  const gregMonth = date.getMonth();
  const gregYear = date.getFullYear();

  const hijri = gregorianToHijri(date);

  if (lang === 'bn') {
    const gDayStr = toBengaliNumerals(gregDay);
    const gYearStr = toBengaliNumerals(gregYear);
    const hDayStr = toBengaliNumerals(hijri.day);
    const hYearStr = toBengaliNumerals(hijri.year);
    
    const dayName = DAYS_BN[dayOfWeek];
    const gMonthName = GREGORIAN_MONTHS_BN[gregMonth];
    const hMonthName = HIJRI_MONTHS_BN[hijri.month - 1];
    const reminderStr = FAITH_REMINDERS_BN[dayOfWeek];

    return `${dayName}, ${gDayStr} ${gMonthName} ${gYearStr} খ্রি. / ${hDayStr} ${hMonthName} ${hYearStr} হিজরি • ${reminderStr}`;
  } else {
    const dayName = DAYS_EN[dayOfWeek];
    const gMonthName = GREGORIAN_MONTHS_EN[gregMonth];
    const hMonthName = HIJRI_MONTHS_EN[hijri.month - 1];
    const reminderStr = FAITH_REMINDERS_EN[dayOfWeek];

    return `${dayName}, ${gMonthName} ${gregDay}, ${gregYear} AD / ${hMonthName} ${hijri.day}, ${hijri.year} AH • ${reminderStr}`;
  }
}

/**
 * Localizes a product name containing both English and Bengali parenthesis-wrapped name.
 * Format: "Arabian Jannatul Firdous Attar (জান্নাতুল ফেরদৌস আতর)"
 */
export function getLocalizedProductName(name: string, lang: 'bn' | 'en'): string {
  const match = name.match(/(.*?)\s*\((.*?)\)/);
  if (match) {
    const englishPart = match[1].trim();
    const bengaliPart = match[2].trim();
    return lang === 'bn' ? bengaliPart : englishPart;
  }
  return name;
}

/**
 * Translates categories dynamically.
 */
export function getCategoryLabel(cat: string, lang: 'bn' | 'en'): string {
  if (cat === 'All') return lang === 'bn' ? 'সকল পণ্য' : 'All Products';
  if (cat === 'Pure Food Collection') return lang === 'bn' ? 'বিশুদ্ধ খাদ্য সংগ্রহ' : 'Pure Food Collection';
  if (cat === 'Sunnah & Lifestyle') return lang === 'bn' ? 'সুন্নাহ ও লাইফস্টাইল' : 'Sunnah & Lifestyle';
  if (cat === 'Special Collections') return lang === 'bn' ? 'বিশেষ কালেকশন' : 'Special Collections';
  return cat;
}


