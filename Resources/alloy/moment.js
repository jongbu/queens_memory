!function (global, factory) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = factory() : "function" == typeof define && define.amd ? define(factory) : global.moment = factory();
}(this, function () {
    "use strict";

    function hooks() {
        return hookCallback.apply(null, arguments);
    }
    function setHookCallback(callback) {
        hookCallback = callback;
    }
    function isArray(input) {
        return input instanceof Array || "[object Array]" === Object.prototype.toString.call(input);
    }
    function isObject(input) {
        return null != input && "[object Object]" === Object.prototype.toString.call(input);
    }
    function isObjectEmpty(obj) {
        var k;
        for (k in obj) return false;
        return true;
    }
    function isNumber(input) {
        return "number" == typeof value || "[object Number]" === Object.prototype.toString.call(input);
    }
    function isDate(input) {
        return input instanceof Date || "[object Date]" === Object.prototype.toString.call(input);
    }
    function map(arr, fn) {
        var i,
            res = [];
        for (i = 0; i < arr.length; ++i) res.push(fn(arr[i], i));
        return res;
    }
    function hasOwnProp(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b);
    }
    function extend(a, b) {
        for (var i in b) hasOwnProp(b, i) && (a[i] = b[i]);
        hasOwnProp(b, "toString") && (a.toString = b.toString);
        hasOwnProp(b, "valueOf") && (a.valueOf = b.valueOf);
        return a;
    }
    function createUTC(input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, true).utc();
    }
    function defaultParsingFlags() {
        return {
            empty: false,
            unusedTokens: [],
            unusedInput: [],
            overflow: -2,
            charsLeftOver: 0,
            nullInput: false,
            invalidMonth: null,
            invalidFormat: false,
            userInvalidated: false,
            iso: false,
            parsedDateParts: [],
            meridiem: null
        };
    }
    function getParsingFlags(m) {
        null == m._pf && (m._pf = defaultParsingFlags());
        return m._pf;
    }
    function isValid(m) {
        if (null == m._isValid) {
            var flags = getParsingFlags(m);
            var parsedParts = some$1.call(flags.parsedDateParts, function (i) {
                return null != i;
            });
            var isNowValid = !isNaN(m._d.getTime()) && flags.overflow < 0 && !flags.empty && !flags.invalidMonth && !flags.invalidWeekday && !flags.nullInput && !flags.invalidFormat && !flags.userInvalidated && (!flags.meridiem || flags.meridiem && parsedParts);
            m._strict && (isNowValid = isNowValid && 0 === flags.charsLeftOver && 0 === flags.unusedTokens.length && void 0 === flags.bigHour);
            if (null != Object.isFrozen && Object.isFrozen(m)) return isNowValid;
            m._isValid = isNowValid;
        }
        return m._isValid;
    }
    function createInvalid(flags) {
        var m = createUTC(NaN);
        null != flags ? extend(getParsingFlags(m), flags) : getParsingFlags(m).userInvalidated = true;
        return m;
    }
    function isUndefined(input) {
        return void 0 === input;
    }
    function copyConfig(to, from) {
        var i, prop, val;
        isUndefined(from._isAMomentObject) || (to._isAMomentObject = from._isAMomentObject);
        isUndefined(from._i) || (to._i = from._i);
        isUndefined(from._f) || (to._f = from._f);
        isUndefined(from._l) || (to._l = from._l);
        isUndefined(from._strict) || (to._strict = from._strict);
        isUndefined(from._tzm) || (to._tzm = from._tzm);
        isUndefined(from._isUTC) || (to._isUTC = from._isUTC);
        isUndefined(from._offset) || (to._offset = from._offset);
        isUndefined(from._pf) || (to._pf = getParsingFlags(from));
        isUndefined(from._locale) || (to._locale = from._locale);
        if (momentProperties.length > 0) for (i in momentProperties) {
            prop = momentProperties[i];
            val = from[prop];
            isUndefined(val) || (to[prop] = val);
        }
        return to;
    }
    function Moment(config) {
        copyConfig(this, config);
        this._d = new Date(null != config._d ? config._d.getTime() : NaN);
        if (false === updateInProgress) {
            updateInProgress = true;
            hooks.updateOffset(this);
            updateInProgress = false;
        }
    }
    function isMoment(obj) {
        return obj instanceof Moment || null != obj && null != obj._isAMomentObject;
    }
    function absFloor(number) {
        return 0 > number ? Math.ceil(number) || 0 : Math.floor(number);
    }
    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;
        0 !== coercedNumber && isFinite(coercedNumber) && (value = absFloor(coercedNumber));
        return value;
    }
    function compareArrays(array1, array2, dontConvert) {
        var i,
            len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0;
        for (i = 0; len > i; i++) (dontConvert && array1[i] !== array2[i] || !dontConvert && toInt(array1[i]) !== toInt(array2[i])) && diffs++;
        return diffs + lengthDiff;
    }
    function warn(msg) {
        false === hooks.suppressDeprecationWarnings && "undefined" != typeof console && console.warn && console.warn("Deprecation warning: " + msg);
    }
    function deprecate(msg, fn) {
        var firstTime = true;
        return extend(function () {
            null != hooks.deprecationHandler && hooks.deprecationHandler(null, msg);
            if (firstTime) {
                var args = [];
                var arg;
                for (var i = 0; i < arguments.length; i++) {
                    arg = "";
                    if ("object" == typeof arguments[i]) {
                        arg += "\n[" + i + "] ";
                        for (var key in arguments[0]) arg += key + ": " + arguments[0][key] + ", ";
                        arg = arg.slice(0, -2);
                    } else arg = arguments[i];
                    args.push(arg);
                }
                warn(msg + "\nArguments: " + Array.prototype.slice.call(args).join("") + "\n" + new Error().stack);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }
    function deprecateSimple(name, msg) {
        null != hooks.deprecationHandler && hooks.deprecationHandler(name, msg);
        if (!deprecations[name]) {
            warn(msg);
            deprecations[name] = true;
        }
    }
    function isFunction(input) {
        return input instanceof Function || "[object Function]" === Object.prototype.toString.call(input);
    }
    function set(config) {
        var prop, i;
        for (i in config) {
            prop = config[i];
            isFunction(prop) ? this[i] = prop : this["_" + i] = prop;
        }
        this._config = config;
        this._ordinalParseLenient = new RegExp(this._ordinalParse.source + "|" + /\d{1,2}/.source);
    }
    function mergeConfigs(parentConfig, childConfig) {
        var prop,
            res = extend({}, parentConfig);
        for (prop in childConfig) if (hasOwnProp(childConfig, prop)) if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
            res[prop] = {};
            extend(res[prop], parentConfig[prop]);
            extend(res[prop], childConfig[prop]);
        } else null != childConfig[prop] ? res[prop] = childConfig[prop] : delete res[prop];
        for (prop in parentConfig) hasOwnProp(parentConfig, prop) && !hasOwnProp(childConfig, prop) && isObject(parentConfig[prop]) && (res[prop] = extend({}, res[prop]));
        return res;
    }
    function Locale(config) {
        null != config && this.set(config);
    }
    function calendar(key, mom, now) {
        var output = this._calendar[key] || this._calendar["sameElse"];
        return isFunction(output) ? output.call(mom, now) : output;
    }
    function longDateFormat(key) {
        var format = this._longDateFormat[key],
            formatUpper = this._longDateFormat[key.toUpperCase()];
        if (format || !formatUpper) return format;
        this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
            return val.slice(1);
        });
        return this._longDateFormat[key];
    }
    function invalidDate() {
        return this._invalidDate;
    }
    function ordinal(number) {
        return this._ordinal.replace("%d", number);
    }
    function relativeTime(number, withoutSuffix, string, isFuture) {
        var output = this._relativeTime[string];
        return isFunction(output) ? output(number, withoutSuffix, string, isFuture) : output.replace(/%d/i, number);
    }
    function pastFuture(diff, output) {
        var format = this._relativeTime[diff > 0 ? "future" : "past"];
        return isFunction(format) ? format(output) : format.replace(/%s/i, output);
    }
    function addUnitAlias(unit, shorthand) {
        var lowerCase = unit.toLowerCase();
        aliases[lowerCase] = aliases[lowerCase + "s"] = aliases[shorthand] = unit;
    }
    function normalizeUnits(units) {
        return "string" == typeof units ? aliases[units] || aliases[units.toLowerCase()] : void 0;
    }
    function normalizeObjectUnits(inputObject) {
        var normalizedProp,
            prop,
            normalizedInput = {};
        for (prop in inputObject) if (hasOwnProp(inputObject, prop)) {
            normalizedProp = normalizeUnits(prop);
            normalizedProp && (normalizedInput[normalizedProp] = inputObject[prop]);
        }
        return normalizedInput;
    }
    function addUnitPriority(unit, priority) {
        priorities[unit] = priority;
    }
    function getPrioritizedUnits(unitsObj) {
        var units = [];
        for (var u in unitsObj) units.push({
            unit: u,
            priority: priorities[u]
        });
        units.sort(function (a, b) {
            return a.priority - b.priority;
        });
        return units;
    }
    function makeGetSet(unit, keepTime) {
        return function (value) {
            if (null != value) {
                set$1(this, unit, value);
                hooks.updateOffset(this, keepTime);
                return this;
            }
            return get(this, unit);
        };
    }
    function get(mom, unit) {
        return mom.isValid() ? mom._d["get" + (mom._isUTC ? "UTC" : "") + unit]() : NaN;
    }
    function set$1(mom, unit, value) {
        mom.isValid() && mom._d["set" + (mom._isUTC ? "UTC" : "") + unit](value);
    }
    function stringGet(units) {
        units = normalizeUnits(units);
        if (isFunction(this[units])) return this[units]();
        return this;
    }
    function stringSet(units, value) {
        if ("object" == typeof units) {
            units = normalizeObjectUnits(units);
            var prioritized = getPrioritizedUnits(units);
            for (var i = 0; i < prioritized.length; i++) this[prioritized[i].unit](units[prioritized[i].unit]);
        } else {
            units = normalizeUnits(units);
            if (isFunction(this[units])) return this[units](value);
        }
        return this;
    }
    function zeroFill(number, targetLength, forceSign) {
        var absNumber = "" + Math.abs(number),
            zerosToFill = targetLength - absNumber.length,
            sign = number >= 0;
        return (sign ? forceSign ? "+" : "" : "-") + Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
    }
    function addFormatToken(token, padded, ordinal, callback) {
        var func = callback;
        "string" == typeof callback && (func = function () {
            return this[callback]();
        });
        token && (formatTokenFunctions[token] = func);
        padded && (formatTokenFunctions[padded[0]] = function () {
            return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
        });
        ordinal && (formatTokenFunctions[ordinal] = function () {
            return this.localeData().ordinal(func.apply(this, arguments), token);
        });
    }
    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) return input.replace(/^\[|\]$/g, "");
        return input.replace(/\\/g, "");
    }
    function makeFormatFunction(format) {
        var i,
            length,
            array = format.match(formattingTokens);
        for (i = 0, length = array.length; length > i; i++) formatTokenFunctions[array[i]] ? array[i] = formatTokenFunctions[array[i]] : array[i] = removeFormattingTokens(array[i]);
        return function (mom) {
            var i,
                output = "";
            for (i = 0; length > i; i++) output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
            return output;
        };
    }
    function formatMoment(m, format) {
        if (!m.isValid()) return m.localeData().invalidDate();
        format = expandFormat(format, m.localeData());
        formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);
        return formatFunctions[format](m);
    }
    function expandFormat(format, locale) {
        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }
        var i = 5;
        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }
        return format;
    }
    function addRegexToken(token, regex, strictRegex) {
        regexes[token] = isFunction(regex) ? regex : function (isStrict, localeData) {
            return isStrict && strictRegex ? strictRegex : regex;
        };
    }
    function getParseRegexForToken(token, config) {
        if (!hasOwnProp(regexes, token)) return new RegExp(unescapeFormat(token));
        return regexes[token](config._strict, config._locale);
    }
    function unescapeFormat(s) {
        return regexEscape(s.replace("\\", "").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        }));
    }
    function regexEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    }
    function addParseToken(token, callback) {
        var i,
            func = callback;
        "string" == typeof token && (token = [token]);
        isNumber(callback) && (func = function (input, array) {
            array[callback] = toInt(input);
        });
        for (i = 0; i < token.length; i++) tokens[token[i]] = func;
    }
    function addWeekParseToken(token, callback) {
        addParseToken(token, function (input, array, config, token) {
            config._w = config._w || {};
            callback(input, config._w, config, token);
        });
    }
    function addTimeToArrayFromToken(token, input, config) {
        null != input && hasOwnProp(tokens, token) && tokens[token](input, config._a, config, token);
    }
    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }
    function localeMonths(m, format) {
        if (!m) return this._months;
        return isArray(this._months) ? this._months[m.month()] : this._months[(this._months.isFormat || MONTHS_IN_FORMAT).test(format) ? "format" : "standalone"][m.month()];
    }
    function localeMonthsShort(m, format) {
        if (!m) return this._monthsShort;
        return isArray(this._monthsShort) ? this._monthsShort[m.month()] : this._monthsShort[MONTHS_IN_FORMAT.test(format) ? "format" : "standalone"][m.month()];
    }
    function handleStrictParse(monthName, format, strict) {
        var i,
            ii,
            mom,
            llc = monthName.toLocaleLowerCase();
        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
            for (i = 0; 12 > i; ++i) {
                mom = createUTC([2e3, i]);
                this._shortMonthsParse[i] = this.monthsShort(mom, "").toLocaleLowerCase();
                this._longMonthsParse[i] = this.months(mom, "").toLocaleLowerCase();
            }
        }
        if (strict) {
            if ("MMM" === format) {
                ii = indexOf$1.call(this._shortMonthsParse, llc);
                return -1 !== ii ? ii : null;
            }
            ii = indexOf$1.call(this._longMonthsParse, llc);
            return -1 !== ii ? ii : null;
        }
        if ("MMM" === format) {
            ii = indexOf$1.call(this._shortMonthsParse, llc);
            if (-1 !== ii) return ii;
            ii = indexOf$1.call(this._longMonthsParse, llc);
            return -1 !== ii ? ii : null;
        }
        ii = indexOf$1.call(this._longMonthsParse, llc);
        if (-1 !== ii) return ii;
        ii = indexOf$1.call(this._shortMonthsParse, llc);
        return -1 !== ii ? ii : null;
    }
    function localeMonthsParse(monthName, format, strict) {
        var i, mom, regex;
        if (this._monthsParseExact) return handleStrictParse.call(this, monthName, format, strict);
        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
        }
        for (i = 0; 12 > i; i++) {
            mom = createUTC([2e3, i]);
            if (strict && !this._longMonthsParse[i]) {
                this._longMonthsParse[i] = new RegExp("^" + this.months(mom, "").replace(".", "") + "$", "i");
                this._shortMonthsParse[i] = new RegExp("^" + this.monthsShort(mom, "").replace(".", "") + "$", "i");
            }
            if (!strict && !this._monthsParse[i]) {
                regex = "^" + this.months(mom, "") + "|^" + this.monthsShort(mom, "");
                this._monthsParse[i] = new RegExp(regex.replace(".", ""), "i");
            }
            if (strict && "MMMM" === format && this._longMonthsParse[i].test(monthName)) return i;
            if (strict && "MMM" === format && this._shortMonthsParse[i].test(monthName)) return i;
            if (!strict && this._monthsParse[i].test(monthName)) return i;
        }
    }
    function setMonth(mom, value) {
        var dayOfMonth;
        if (!mom.isValid()) return mom;
        if ("string" == typeof value) if (/^\d+$/.test(value)) value = toInt(value);else {
            value = mom.localeData().monthsParse(value);
            if (!isNumber(value)) return mom;
        }
        dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
        mom._d["set" + (mom._isUTC ? "UTC" : "") + "Month"](value, dayOfMonth);
        return mom;
    }
    function getSetMonth(value) {
        if (null != value) {
            setMonth(this, value);
            hooks.updateOffset(this, true);
            return this;
        }
        return get(this, "Month");
    }
    function getDaysInMonth() {
        return daysInMonth(this.year(), this.month());
    }
    function monthsShortRegex(isStrict) {
        if (this._monthsParseExact) {
            hasOwnProp(this, "_monthsRegex") || computeMonthsParse.call(this);
            return isStrict ? this._monthsShortStrictRegex : this._monthsShortRegex;
        }
        hasOwnProp(this, "_monthsShortRegex") || (this._monthsShortRegex = defaultMonthsShortRegex);
        return this._monthsShortStrictRegex && isStrict ? this._monthsShortStrictRegex : this._monthsShortRegex;
    }
    function monthsRegex(isStrict) {
        if (this._monthsParseExact) {
            hasOwnProp(this, "_monthsRegex") || computeMonthsParse.call(this);
            return isStrict ? this._monthsStrictRegex : this._monthsRegex;
        }
        hasOwnProp(this, "_monthsRegex") || (this._monthsRegex = defaultMonthsRegex);
        return this._monthsStrictRegex && isStrict ? this._monthsStrictRegex : this._monthsRegex;
    }
    function computeMonthsParse() {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }
        var i,
            mom,
            shortPieces = [],
            longPieces = [],
            mixedPieces = [];
        for (i = 0; 12 > i; i++) {
            mom = createUTC([2e3, i]);
            shortPieces.push(this.monthsShort(mom, ""));
            longPieces.push(this.months(mom, ""));
            mixedPieces.push(this.months(mom, ""));
            mixedPieces.push(this.monthsShort(mom, ""));
        }
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; 12 > i; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
        }
        for (i = 0; 24 > i; i++) mixedPieces[i] = regexEscape(mixedPieces[i]);
        this._monthsRegex = new RegExp("^(" + mixedPieces.join("|") + ")", "i");
        this._monthsShortRegex = this._monthsRegex;
        this._monthsStrictRegex = new RegExp("^(" + longPieces.join("|") + ")", "i");
        this._monthsShortStrictRegex = new RegExp("^(" + shortPieces.join("|") + ")", "i");
    }
    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }
    function isLeapYear(year) {
        return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
    }
    function getIsLeapYear() {
        return isLeapYear(this.year());
    }
    function createDate(y, m, d, h, M, s, ms) {
        var date = new Date(y, m, d, h, M, s, ms);
        100 > y && y >= 0 && isFinite(date.getFullYear()) && date.setFullYear(y);
        return date;
    }
    function createUTCDate(y) {
        var date = new Date(Date.UTC.apply(null, arguments));
        100 > y && y >= 0 && isFinite(date.getUTCFullYear()) && date.setUTCFullYear(y);
        return date;
    }
    function firstWeekOffset(year, dow, doy) {
        var fwd = 7 + dow - doy,
            fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;
        return -fwdlw + fwd - 1;
    }
    function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
        var resYear,
            resDayOfYear,
            localWeekday = (7 + weekday - dow) % 7,
            weekOffset = firstWeekOffset(year, dow, doy),
            dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset;
        if (0 >= dayOfYear) {
            resYear = year - 1;
            resDayOfYear = daysInYear(resYear) + dayOfYear;
        } else if (dayOfYear > daysInYear(year)) {
            resYear = year + 1;
            resDayOfYear = dayOfYear - daysInYear(year);
        } else {
            resYear = year;
            resDayOfYear = dayOfYear;
        }
        return {
            year: resYear,
            dayOfYear: resDayOfYear
        };
    }
    function weekOfYear(mom, dow, doy) {
        var resWeek,
            resYear,
            weekOffset = firstWeekOffset(mom.year(), dow, doy),
            week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1;
        if (1 > week) {
            resYear = mom.year() - 1;
            resWeek = week + weeksInYear(resYear, dow, doy);
        } else if (week > weeksInYear(mom.year(), dow, doy)) {
            resWeek = week - weeksInYear(mom.year(), dow, doy);
            resYear = mom.year() + 1;
        } else {
            resYear = mom.year();
            resWeek = week;
        }
        return {
            week: resWeek,
            year: resYear
        };
    }
    function weeksInYear(year, dow, doy) {
        var weekOffset = firstWeekOffset(year, dow, doy),
            weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
        return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
    }
    function localeWeek(mom) {
        return weekOfYear(mom, this._week.dow, this._week.doy).week;
    }
    function localeFirstDayOfWeek() {
        return this._week.dow;
    }
    function localeFirstDayOfYear() {
        return this._week.doy;
    }
    function getSetWeek(input) {
        var week = this.localeData().week(this);
        return null == input ? week : this.add(7 * (input - week), "d");
    }
    function getSetISOWeek(input) {
        var week = weekOfYear(this, 1, 4).week;
        return null == input ? week : this.add(7 * (input - week), "d");
    }
    function parseWeekday(input, locale) {
        if ("string" != typeof input) return input;
        if (!isNaN(input)) return parseInt(input, 10);
        input = locale.weekdaysParse(input);
        if ("number" == typeof input) return input;
        return null;
    }
    function parseIsoWeekday(input, locale) {
        if ("string" == typeof input) return locale.weekdaysParse(input) % 7 || 7;
        return isNaN(input) ? null : input;
    }
    function localeWeekdays(m, format) {
        if (!m) return this._weekdays;
        return isArray(this._weekdays) ? this._weekdays[m.day()] : this._weekdays[this._weekdays.isFormat.test(format) ? "format" : "standalone"][m.day()];
    }
    function localeWeekdaysShort(m) {
        return m ? this._weekdaysShort[m.day()] : this._weekdaysShort;
    }
    function localeWeekdaysMin(m) {
        return m ? this._weekdaysMin[m.day()] : this._weekdaysMin;
    }
    function handleStrictParse$1(weekdayName, format, strict) {
        var i,
            ii,
            mom,
            llc = weekdayName.toLocaleLowerCase();
        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._minWeekdaysParse = [];
            for (i = 0; 7 > i; ++i) {
                mom = createUTC([2e3, 1]).day(i);
                this._minWeekdaysParse[i] = this.weekdaysMin(mom, "").toLocaleLowerCase();
                this._shortWeekdaysParse[i] = this.weekdaysShort(mom, "").toLocaleLowerCase();
                this._weekdaysParse[i] = this.weekdays(mom, "").toLocaleLowerCase();
            }
        }
        if (strict) {
            if ("dddd" === format) {
                ii = indexOf$1.call(this._weekdaysParse, llc);
                return -1 !== ii ? ii : null;
            }
            if ("ddd" === format) {
                ii = indexOf$1.call(this._shortWeekdaysParse, llc);
                return -1 !== ii ? ii : null;
            }
            ii = indexOf$1.call(this._minWeekdaysParse, llc);
            return -1 !== ii ? ii : null;
        }
        if ("dddd" === format) {
            ii = indexOf$1.call(this._weekdaysParse, llc);
            if (-1 !== ii) return ii;
            ii = indexOf$1.call(this._shortWeekdaysParse, llc);
            if (-1 !== ii) return ii;
            ii = indexOf$1.call(this._minWeekdaysParse, llc);
            return -1 !== ii ? ii : null;
        }
        if ("ddd" === format) {
            ii = indexOf$1.call(this._shortWeekdaysParse, llc);
            if (-1 !== ii) return ii;
            ii = indexOf$1.call(this._weekdaysParse, llc);
            if (-1 !== ii) return ii;
            ii = indexOf$1.call(this._minWeekdaysParse, llc);
            return -1 !== ii ? ii : null;
        }
        ii = indexOf$1.call(this._minWeekdaysParse, llc);
        if (-1 !== ii) return ii;
        ii = indexOf$1.call(this._weekdaysParse, llc);
        if (-1 !== ii) return ii;
        ii = indexOf$1.call(this._shortWeekdaysParse, llc);
        return -1 !== ii ? ii : null;
    }
    function localeWeekdaysParse(weekdayName, format, strict) {
        var i, mom, regex;
        if (this._weekdaysParseExact) return handleStrictParse$1.call(this, weekdayName, format, strict);
        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._minWeekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._fullWeekdaysParse = [];
        }
        for (i = 0; 7 > i; i++) {
            mom = createUTC([2e3, 1]).day(i);
            if (strict && !this._fullWeekdaysParse[i]) {
                this._fullWeekdaysParse[i] = new RegExp("^" + this.weekdays(mom, "").replace(".", ".?") + "$", "i");
                this._shortWeekdaysParse[i] = new RegExp("^" + this.weekdaysShort(mom, "").replace(".", ".?") + "$", "i");
                this._minWeekdaysParse[i] = new RegExp("^" + this.weekdaysMin(mom, "").replace(".", ".?") + "$", "i");
            }
            if (!this._weekdaysParse[i]) {
                regex = "^" + this.weekdays(mom, "") + "|^" + this.weekdaysShort(mom, "") + "|^" + this.weekdaysMin(mom, "");
                this._weekdaysParse[i] = new RegExp(regex.replace(".", ""), "i");
            }
            if (strict && "dddd" === format && this._fullWeekdaysParse[i].test(weekdayName)) return i;
            if (strict && "ddd" === format && this._shortWeekdaysParse[i].test(weekdayName)) return i;
            if (strict && "dd" === format && this._minWeekdaysParse[i].test(weekdayName)) return i;
            if (!strict && this._weekdaysParse[i].test(weekdayName)) return i;
        }
    }
    function getSetDayOfWeek(input) {
        if (!this.isValid()) return null != input ? this : NaN;
        var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
        if (null != input) {
            input = parseWeekday(input, this.localeData());
            return this.add(input - day, "d");
        }
        return day;
    }
    function getSetLocaleDayOfWeek(input) {
        if (!this.isValid()) return null != input ? this : NaN;
        var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
        return null == input ? weekday : this.add(input - weekday, "d");
    }
    function getSetISODayOfWeek(input) {
        if (!this.isValid()) return null != input ? this : NaN;
        if (null != input) {
            var weekday = parseIsoWeekday(input, this.localeData());
            return this.day(this.day() % 7 ? weekday : weekday - 7);
        }
        return this.day() || 7;
    }
    function weekdaysRegex(isStrict) {
        if (this._weekdaysParseExact) {
            hasOwnProp(this, "_weekdaysRegex") || computeWeekdaysParse.call(this);
            return isStrict ? this._weekdaysStrictRegex : this._weekdaysRegex;
        }
        hasOwnProp(this, "_weekdaysRegex") || (this._weekdaysRegex = defaultWeekdaysRegex);
        return this._weekdaysStrictRegex && isStrict ? this._weekdaysStrictRegex : this._weekdaysRegex;
    }
    function weekdaysShortRegex(isStrict) {
        if (this._weekdaysParseExact) {
            hasOwnProp(this, "_weekdaysRegex") || computeWeekdaysParse.call(this);
            return isStrict ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex;
        }
        hasOwnProp(this, "_weekdaysShortRegex") || (this._weekdaysShortRegex = defaultWeekdaysShortRegex);
        return this._weekdaysShortStrictRegex && isStrict ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex;
    }
    function weekdaysMinRegex(isStrict) {
        if (this._weekdaysParseExact) {
            hasOwnProp(this, "_weekdaysRegex") || computeWeekdaysParse.call(this);
            return isStrict ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex;
        }
        hasOwnProp(this, "_weekdaysMinRegex") || (this._weekdaysMinRegex = defaultWeekdaysMinRegex);
        return this._weekdaysMinStrictRegex && isStrict ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex;
    }
    function computeWeekdaysParse() {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }
        var i,
            mom,
            minp,
            shortp,
            longp,
            minPieces = [],
            shortPieces = [],
            longPieces = [],
            mixedPieces = [];
        for (i = 0; 7 > i; i++) {
            mom = createUTC([2e3, 1]).day(i);
            minp = this.weekdaysMin(mom, "");
            shortp = this.weekdaysShort(mom, "");
            longp = this.weekdays(mom, "");
            minPieces.push(minp);
            shortPieces.push(shortp);
            longPieces.push(longp);
            mixedPieces.push(minp);
            mixedPieces.push(shortp);
            mixedPieces.push(longp);
        }
        minPieces.sort(cmpLenRev);
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; 7 > i; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }
        this._weekdaysRegex = new RegExp("^(" + mixedPieces.join("|") + ")", "i");
        this._weekdaysShortRegex = this._weekdaysRegex;
        this._weekdaysMinRegex = this._weekdaysRegex;
        this._weekdaysStrictRegex = new RegExp("^(" + longPieces.join("|") + ")", "i");
        this._weekdaysShortStrictRegex = new RegExp("^(" + shortPieces.join("|") + ")", "i");
        this._weekdaysMinStrictRegex = new RegExp("^(" + minPieces.join("|") + ")", "i");
    }
    function hFormat() {
        return this.hours() % 12 || 12;
    }
    function kFormat() {
        return this.hours() || 24;
    }
    function meridiem(token, lowercase) {
        addFormatToken(token, 0, 0, function () {
            return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
        });
    }
    function matchMeridiem(isStrict, locale) {
        return locale._meridiemParse;
    }
    function localeIsPM(input) {
        return "p" === (input + "").toLowerCase().charAt(0);
    }
    function localeMeridiem(hours, minutes, isLower) {
        return hours > 11 ? isLower ? "pm" : "PM" : isLower ? "am" : "AM";
    }
    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace("_", "-") : key;
    }
    function chooseLocale(names) {
        var j,
            next,
            locale,
            split,
            i = 0;
        while (i < names.length) {
            split = normalizeLocale(names[i]).split("-");
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split("-") : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join("-"));
                if (locale) return locale;
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) break;
                j--;
            }
            i++;
        }
        return null;
    }
    function loadLocale(name) {
        var oldLocale = null;
        if (!locales[name] && "undefined" != typeof module && module && module.exports) try {
            oldLocale = globalLocale._abbr;
            require("/alloy/moment/lang/" + name);
            getSetGlobalLocale(oldLocale);
        } catch (e) {}
        return locales[name];
    }
    function getSetGlobalLocale(key, values) {
        var data;
        if (key) {
            data = isUndefined(values) ? getLocale(key) : defineLocale(key, values);
            data && (globalLocale = data);
        }
        return globalLocale._abbr;
    }
    function defineLocale(name, config) {
        if (null !== config) {
            var parentConfig = baseConfig;
            config.abbr = name;
            if (null != locales[name]) {
                deprecateSimple("defineLocaleOverride", "use moment.updateLocale(localeName, config) to change an existing locale. moment.defineLocale(localeName, config) should only be used for creating a new locale See http://momentjs.com/guides/#/warnings/define-locale/ for more info.");
                parentConfig = locales[name]._config;
            } else if (null != config.parentLocale) {
                if (null == locales[config.parentLocale]) {
                    localeFamilies[config.parentLocale] || (localeFamilies[config.parentLocale] = []);
                    localeFamilies[config.parentLocale].push({
                        name: name,
                        config: config
                    });
                    return null;
                }
                parentConfig = locales[config.parentLocale]._config;
            }
            locales[name] = new Locale(mergeConfigs(parentConfig, config));
            localeFamilies[name] && localeFamilies[name].forEach(function (x) {
                defineLocale(x.name, x.config);
            });
            getSetGlobalLocale(name);
            return locales[name];
        }
        delete locales[name];
        return null;
    }
    function updateLocale(name, config) {
        if (null != config) {
            var locale,
                parentConfig = baseConfig;
            null != locales[name] && (parentConfig = locales[name]._config);
            config = mergeConfigs(parentConfig, config);
            locale = new Locale(config);
            locale.parentLocale = locales[name];
            locales[name] = locale;
            getSetGlobalLocale(name);
        } else null != locales[name] && (null != locales[name].parentLocale ? locales[name] = locales[name].parentLocale : null != locales[name] && delete locales[name]);
        return locales[name];
    }
    function getLocale(key) {
        var locale;
        key && key._locale && key._locale._abbr && (key = key._locale._abbr);
        if (!key) return globalLocale;
        if (!isArray(key)) {
            locale = loadLocale(key);
            if (locale) return locale;
            key = [key];
        }
        return chooseLocale(key);
    }
    function listLocales() {
        return keys$1(locales);
    }
    function checkOverflow(m) {
        var overflow;
        var a = m._a;
        if (a && -2 === getParsingFlags(m).overflow) {
            overflow = a[MONTH] < 0 || a[MONTH] > 11 ? MONTH : a[DATE] < 1 || a[DATE] > daysInMonth(a[YEAR], a[MONTH]) ? DATE : a[HOUR] < 0 || a[HOUR] > 24 || 24 === a[HOUR] && (0 !== a[MINUTE] || 0 !== a[SECOND] || 0 !== a[MILLISECOND]) ? HOUR : a[MINUTE] < 0 || a[MINUTE] > 59 ? MINUTE : a[SECOND] < 0 || a[SECOND] > 59 ? SECOND : a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND : -1;
            getParsingFlags(m)._overflowDayOfYear && (YEAR > overflow || overflow > DATE) && (overflow = DATE);
            getParsingFlags(m)._overflowWeeks && -1 === overflow && (overflow = WEEK);
            getParsingFlags(m)._overflowWeekday && -1 === overflow && (overflow = WEEKDAY);
            getParsingFlags(m).overflow = overflow;
        }
        return m;
    }
    function configFromISO(config) {
        var i,
            l,
            allowTime,
            dateFormat,
            timeFormat,
            tzFormat,
            string = config._i,
            match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string);
        if (match) {
            getParsingFlags(config).iso = true;
            for (i = 0, l = isoDates.length; l > i; i++) if (isoDates[i][1].exec(match[1])) {
                dateFormat = isoDates[i][0];
                allowTime = false !== isoDates[i][2];
                break;
            }
            if (null == dateFormat) {
                config._isValid = false;
                return;
            }
            if (match[3]) {
                for (i = 0, l = isoTimes.length; l > i; i++) if (isoTimes[i][1].exec(match[3])) {
                    timeFormat = (match[2] || " ") + isoTimes[i][0];
                    break;
                }
                if (null == timeFormat) {
                    config._isValid = false;
                    return;
                }
            }
            if (!allowTime && null != timeFormat) {
                config._isValid = false;
                return;
            }
            if (match[4]) {
                if (!tzRegex.exec(match[4])) {
                    config._isValid = false;
                    return;
                }
                tzFormat = "Z";
            }
            config._f = dateFormat + (timeFormat || "") + (tzFormat || "");
            configFromStringAndFormat(config);
        } else config._isValid = false;
    }
    function configFromString(config) {
        var matched = aspNetJsonRegex.exec(config._i);
        if (null !== matched) {
            config._d = new Date(+matched[1]);
            return;
        }
        configFromISO(config);
        if (false === config._isValid) {
            delete config._isValid;
            hooks.createFromInputFallback(config);
        }
    }
    function defaults(a, b, c) {
        if (null != a) return a;
        if (null != b) return b;
        return c;
    }
    function currentDateArray(config) {
        var nowValue = new Date(hooks.now());
        if (config._useUTC) return [nowValue.getUTCFullYear(), nowValue.getUTCMonth(), nowValue.getUTCDate()];
        return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
    }
    function configFromArray(config) {
        var i,
            date,
            currentDate,
            yearToUse,
            input = [];
        if (config._d) return;
        currentDate = currentDateArray(config);
        config._w && null == config._a[DATE] && null == config._a[MONTH] && dayOfYearFromWeekInfo(config);
        if (config._dayOfYear) {
            yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);
            config._dayOfYear > daysInYear(yearToUse) && (getParsingFlags(config)._overflowDayOfYear = true);
            date = createUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }
        for (i = 0; 3 > i && null == config._a[i]; ++i) config._a[i] = input[i] = currentDate[i];
        for (; 7 > i; i++) config._a[i] = input[i] = null == config._a[i] ? 2 === i ? 1 : 0 : config._a[i];
        if (24 === config._a[HOUR] && 0 === config._a[MINUTE] && 0 === config._a[SECOND] && 0 === config._a[MILLISECOND]) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }
        config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
        null != config._tzm && config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        config._nextDay && (config._a[HOUR] = 24);
    }
    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow;
        w = config._w;
        if (null != w.GG || null != w.W || null != w.E) {
            dow = 1;
            doy = 4;
            weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(createLocal(), 1, 4).year);
            week = defaults(w.W, 1);
            weekday = defaults(w.E, 1);
            (1 > weekday || weekday > 7) && (weekdayOverflow = true);
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;
            var curWeek = weekOfYear(createLocal(), dow, doy);
            weekYear = defaults(w.gg, config._a[YEAR], curWeek.year);
            week = defaults(w.w, curWeek.week);
            if (null != w.d) {
                weekday = w.d;
                (0 > weekday || weekday > 6) && (weekdayOverflow = true);
            } else if (null != w.e) {
                weekday = w.e + dow;
                (w.e < 0 || w.e > 6) && (weekdayOverflow = true);
            } else weekday = dow;
        }
        if (1 > week || week > weeksInYear(weekYear, dow, doy)) getParsingFlags(config)._overflowWeeks = true;else if (null != weekdayOverflow) getParsingFlags(config)._overflowWeekday = true;else {
            temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
            config._a[YEAR] = temp.year;
            config._dayOfYear = temp.dayOfYear;
        }
    }
    function configFromStringAndFormat(config) {
        if (config._f === hooks.ISO_8601) {
            configFromISO(config);
            return;
        }
        config._a = [];
        getParsingFlags(config).empty = true;
        var i,
            parsedInput,
            tokens,
            token,
            skipped,
            string = "" + config._i,
            stringLength = string.length,
            totalParsedInputLength = 0;
        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];
        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                skipped.length > 0 && getParsingFlags(config).unusedInput.push(skipped);
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            if (formatTokenFunctions[token]) {
                parsedInput ? getParsingFlags(config).empty = false : getParsingFlags(config).unusedTokens.push(token);
                addTimeToArrayFromToken(token, parsedInput, config);
            } else config._strict && !parsedInput && getParsingFlags(config).unusedTokens.push(token);
        }
        getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
        string.length > 0 && getParsingFlags(config).unusedInput.push(string);
        config._a[HOUR] <= 12 && true === getParsingFlags(config).bigHour && config._a[HOUR] > 0 && (getParsingFlags(config).bigHour = void 0);
        getParsingFlags(config).parsedDateParts = config._a.slice(0);
        getParsingFlags(config).meridiem = config._meridiem;
        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);
        configFromArray(config);
        checkOverflow(config);
    }
    function meridiemFixWrap(locale, hour, meridiem) {
        var isPm;
        if (null == meridiem) return hour;
        if (null != locale.meridiemHour) return locale.meridiemHour(hour, meridiem);
        if (null != locale.isPM) {
            isPm = locale.isPM(meridiem);
            isPm && 12 > hour && (hour += 12);
            isPm || 12 !== hour || (hour = 0);
            return hour;
        }
        return hour;
    }
    function configFromStringAndArray(config) {
        var tempConfig, bestMoment, scoreToBeat, i, currentScore;
        if (0 === config._f.length) {
            getParsingFlags(config).invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }
        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = copyConfig({}, config);
            null != config._useUTC && (tempConfig._useUTC = config._useUTC);
            tempConfig._f = config._f[i];
            configFromStringAndFormat(tempConfig);
            if (!isValid(tempConfig)) continue;
            currentScore += getParsingFlags(tempConfig).charsLeftOver;
            currentScore += 10 * getParsingFlags(tempConfig).unusedTokens.length;
            getParsingFlags(tempConfig).score = currentScore;
            if (null == scoreToBeat || scoreToBeat > currentScore) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }
        extend(config, bestMoment || tempConfig);
    }
    function configFromObject(config) {
        if (config._d) return;
        var i = normalizeObjectUnits(config._i);
        config._a = map([i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond], function (obj) {
            return obj && parseInt(obj, 10);
        });
        configFromArray(config);
    }
    function createFromConfig(config) {
        var res = new Moment(checkOverflow(prepareConfig(config)));
        if (res._nextDay) {
            res.add(1, "d");
            res._nextDay = void 0;
        }
        return res;
    }
    function prepareConfig(config) {
        var input = config._i,
            format = config._f;
        config._locale = config._locale || getLocale(config._l);
        if (null === input || void 0 === format && "" === input) return createInvalid({
            nullInput: true
        });
        "string" == typeof input && (config._i = input = config._locale.preparse(input));
        if (isMoment(input)) return new Moment(checkOverflow(input));
        isDate(input) ? config._d = input : isArray(format) ? configFromStringAndArray(config) : format ? configFromStringAndFormat(config) : configFromInput(config);
        isValid(config) || (config._d = null);
        return config;
    }
    function configFromInput(config) {
        var input = config._i;
        if (void 0 === input) config._d = new Date(hooks.now());else if (isDate(input)) config._d = new Date(input.valueOf());else if ("string" == typeof input) configFromString(config);else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            configFromArray(config);
        } else "object" == typeof input ? configFromObject(config) : isNumber(input) ? config._d = new Date(input) : hooks.createFromInputFallback(config);
    }
    function createLocalOrUTC(input, format, locale, strict, isUTC) {
        var c = {};
        if (true === locale || false === locale) {
            strict = locale;
            locale = void 0;
        }
        (isObject(input) && isObjectEmpty(input) || isArray(input) && 0 === input.length) && (input = void 0);
        c._isAMomentObject = true;
        c._useUTC = c._isUTC = isUTC;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;
        return createFromConfig(c);
    }
    function createLocal(input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, false);
    }
    function pickBy(fn, moments) {
        var res, i;
        1 === moments.length && isArray(moments[0]) && (moments = moments[0]);
        if (!moments.length) return createLocal();
        res = moments[0];
        for (i = 1; i < moments.length; ++i) (!moments[i].isValid() || moments[i][fn](res)) && (res = moments[i]);
        return res;
    }
    function min() {
        var args = [].slice.call(arguments, 0);
        return pickBy("isBefore", args);
    }
    function max() {
        var args = [].slice.call(arguments, 0);
        return pickBy("isAfter", args);
    }
    function Duration(duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;
        this._milliseconds = +milliseconds + 1e3 * seconds + 6e4 * minutes + 1e3 * hours * 60 * 60;
        this._days = +days + 7 * weeks;
        this._months = +months + 3 * quarters + 12 * years;
        this._data = {};
        this._locale = getLocale();
        this._bubble();
    }
    function isDuration(obj) {
        return obj instanceof Duration;
    }
    function absRound(number) {
        return 0 > number ? -1 * Math.round(-1 * number) : Math.round(number);
    }
    function offset(token, separator) {
        addFormatToken(token, 0, 0, function () {
            var offset = this.utcOffset();
            var sign = "+";
            if (0 > offset) {
                offset = -offset;
                sign = "-";
            }
            return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~offset % 60, 2);
        });
    }
    function offsetFromString(matcher, string) {
        var matches = (string || "").match(matcher);
        if (null === matches) return null;
        var chunk = matches[matches.length - 1] || [];
        var parts = (chunk + "").match(chunkOffset) || ["-", 0, 0];
        var minutes = +(60 * parts[1]) + toInt(parts[2]);
        return 0 === minutes ? 0 : "+" === parts[0] ? minutes : -minutes;
    }
    function cloneWithOffset(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff = (isMoment(input) || isDate(input) ? input.valueOf() : createLocal(input).valueOf()) - res.valueOf();
            res._d.setTime(res._d.valueOf() + diff);
            hooks.updateOffset(res, false);
            return res;
        }
        return createLocal(input).local();
    }
    function getDateOffset(m) {
        return 15 * -Math.round(m._d.getTimezoneOffset() / 15);
    }
    function getSetOffset(input, keepLocalTime) {
        var localAdjust,
            offset = this._offset || 0;
        if (!this.isValid()) return null != input ? this : NaN;
        if (null != input) {
            if ("string" == typeof input) {
                input = offsetFromString(matchShortOffset, input);
                if (null === input) return this;
            } else Math.abs(input) < 16 && (input = 60 * input);
            !this._isUTC && keepLocalTime && (localAdjust = getDateOffset(this));
            this._offset = input;
            this._isUTC = true;
            null != localAdjust && this.add(localAdjust, "m");
            if (offset !== input) if (!keepLocalTime || this._changeInProgress) addSubtract(this, createDuration(input - offset, "m"), 1, false);else if (!this._changeInProgress) {
                this._changeInProgress = true;
                hooks.updateOffset(this, true);
                this._changeInProgress = null;
            }
            return this;
        }
        return this._isUTC ? offset : getDateOffset(this);
    }
    function getSetZone(input, keepLocalTime) {
        if (null != input) {
            "string" != typeof input && (input = -input);
            this.utcOffset(input, keepLocalTime);
            return this;
        }
        return -this.utcOffset();
    }
    function setOffsetToUTC(keepLocalTime) {
        return this.utcOffset(0, keepLocalTime);
    }
    function setOffsetToLocal(keepLocalTime) {
        if (this._isUTC) {
            this.utcOffset(0, keepLocalTime);
            this._isUTC = false;
            keepLocalTime && this.subtract(getDateOffset(this), "m");
        }
        return this;
    }
    function setOffsetToParsedOffset() {
        if (null != this._tzm) this.utcOffset(this._tzm);else if ("string" == typeof this._i) {
            var tZone = offsetFromString(matchOffset, this._i);
            null != tZone ? this.utcOffset(tZone) : this.utcOffset(0, true);
        }
        return this;
    }
    function hasAlignedHourOffset(input) {
        if (!this.isValid()) return false;
        input = input ? createLocal(input).utcOffset() : 0;
        return (this.utcOffset() - input) % 60 === 0;
    }
    function isDaylightSavingTime() {
        return this.utcOffset() > this.clone().month(0).utcOffset() || this.utcOffset() > this.clone().month(5).utcOffset();
    }
    function isDaylightSavingTimeShifted() {
        if (!isUndefined(this._isDSTShifted)) return this._isDSTShifted;
        var c = {};
        copyConfig(c, this);
        c = prepareConfig(c);
        if (c._a) {
            var other = c._isUTC ? createUTC(c._a) : createLocal(c._a);
            this._isDSTShifted = this.isValid() && compareArrays(c._a, other.toArray()) > 0;
        } else this._isDSTShifted = false;
        return this._isDSTShifted;
    }
    function isLocal() {
        return this.isValid() ? !this._isUTC : false;
    }
    function isUtcOffset() {
        return this.isValid() ? this._isUTC : false;
    }
    function isUtc() {
        return this.isValid() ? this._isUTC && 0 === this._offset : false;
    }
    function createDuration(input, key) {
        var sign,
            ret,
            diffRes,
            duration = input,
            match = null;
        if (isDuration(input)) duration = {
            ms: input._milliseconds,
            d: input._days,
            M: input._months
        };else if (isNumber(input)) {
            duration = {};
            key ? duration[key] = input : duration.milliseconds = input;
        } else if (match = aspNetRegex.exec(input)) {
            sign = "-" === match[1] ? -1 : 1;
            duration = {
                y: 0,
                d: toInt(match[DATE]) * sign,
                h: toInt(match[HOUR]) * sign,
                m: toInt(match[MINUTE]) * sign,
                s: toInt(match[SECOND]) * sign,
                ms: toInt(absRound(1e3 * match[MILLISECOND])) * sign
            };
        } else if (match = isoRegex.exec(input)) {
            sign = "-" === match[1] ? -1 : 1;
            duration = {
                y: parseIso(match[2], sign),
                M: parseIso(match[3], sign),
                w: parseIso(match[4], sign),
                d: parseIso(match[5], sign),
                h: parseIso(match[6], sign),
                m: parseIso(match[7], sign),
                s: parseIso(match[8], sign)
            };
        } else if (null == duration) duration = {};else if ("object" == typeof duration && ("from" in duration || "to" in duration)) {
            diffRes = momentsDifference(createLocal(duration.from), createLocal(duration.to));
            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }
        ret = new Duration(duration);
        isDuration(input) && hasOwnProp(input, "_locale") && (ret._locale = input._locale);
        return ret;
    }
    function parseIso(inp, sign) {
        var res = inp && parseFloat(inp.replace(",", "."));
        return (isNaN(res) ? 0 : res) * sign;
    }
    function positiveMomentsDifference(base, other) {
        var res = {
            milliseconds: 0,
            months: 0
        };
        res.months = other.month() - base.month() + 12 * (other.year() - base.year());
        base.clone().add(res.months, "M").isAfter(other) && --res.months;
        res.milliseconds = +other - +base.clone().add(res.months, "M");
        return res;
    }
    function momentsDifference(base, other) {
        var res;
        if (!(base.isValid() && other.isValid())) return {
            milliseconds: 0,
            months: 0
        };
        other = cloneWithOffset(other, base);
        if (base.isBefore(other)) res = positiveMomentsDifference(base, other);else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }
        return res;
    }
    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            if (null !== period && !isNaN(+period)) {
                deprecateSimple(name, "moment()." + name + "(period, number) is deprecated. Please use moment()." + name + "(number, period). See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.");
                tmp = val;
                val = period;
                period = tmp;
            }
            val = "string" == typeof val ? +val : val;
            dur = createDuration(val, period);
            addSubtract(this, dur, direction);
            return this;
        };
    }
    function addSubtract(mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = absRound(duration._days),
            months = absRound(duration._months);
        if (!mom.isValid()) return;
        updateOffset = null == updateOffset ? true : updateOffset;
        milliseconds && mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
        days && set$1(mom, "Date", get(mom, "Date") + days * isAdding);
        months && setMonth(mom, get(mom, "Month") + months * isAdding);
        updateOffset && hooks.updateOffset(mom, days || months);
    }
    function getCalendarFormat(myMoment, now) {
        var diff = myMoment.diff(now, "days", true);
        return -6 > diff ? "sameElse" : -1 > diff ? "lastWeek" : 0 > diff ? "lastDay" : 1 > diff ? "sameDay" : 2 > diff ? "nextDay" : 7 > diff ? "nextWeek" : "sameElse";
    }
    function calendar$1(time, formats) {
        var now = time || createLocal(),
            sod = cloneWithOffset(now, this).startOf("day"),
            format = hooks.calendarFormat(this, sod) || "sameElse";
        var output = formats && (isFunction(formats[format]) ? formats[format].call(this, now) : formats[format]);
        return this.format(output || this.localeData().calendar(format, this, createLocal(now)));
    }
    function clone() {
        return new Moment(this);
    }
    function isAfter(input, units) {
        var localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) return false;
        units = normalizeUnits(isUndefined(units) ? "millisecond" : units);
        return "millisecond" === units ? this.valueOf() > localInput.valueOf() : localInput.valueOf() < this.clone().startOf(units).valueOf();
    }
    function isBefore(input, units) {
        var localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) return false;
        units = normalizeUnits(isUndefined(units) ? "millisecond" : units);
        return "millisecond" === units ? this.valueOf() < localInput.valueOf() : this.clone().endOf(units).valueOf() < localInput.valueOf();
    }
    function isBetween(from, to, units, inclusivity) {
        inclusivity = inclusivity || "()";
        return ("(" === inclusivity[0] ? this.isAfter(from, units) : !this.isBefore(from, units)) && (")" === inclusivity[1] ? this.isBefore(to, units) : !this.isAfter(to, units));
    }
    function isSame(input, units) {
        var inputMs,
            localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) return false;
        units = normalizeUnits(units || "millisecond");
        if ("millisecond" === units) return this.valueOf() === localInput.valueOf();
        inputMs = localInput.valueOf();
        return this.clone().startOf(units).valueOf() <= inputMs && inputMs <= this.clone().endOf(units).valueOf();
    }
    function isSameOrAfter(input, units) {
        return this.isSame(input, units) || this.isAfter(input, units);
    }
    function isSameOrBefore(input, units) {
        return this.isSame(input, units) || this.isBefore(input, units);
    }
    function diff(input, units, asFloat) {
        var that, zoneDelta, delta, output;
        if (!this.isValid()) return NaN;
        that = cloneWithOffset(input, this);
        if (!that.isValid()) return NaN;
        zoneDelta = 6e4 * (that.utcOffset() - this.utcOffset());
        units = normalizeUnits(units);
        if ("year" === units || "month" === units || "quarter" === units) {
            output = monthDiff(this, that);
            "quarter" === units ? output /= 3 : "year" === units && (output /= 12);
        } else {
            delta = this - that;
            output = "second" === units ? delta / 1e3 : "minute" === units ? delta / 6e4 : "hour" === units ? delta / 36e5 : "day" === units ? (delta - zoneDelta) / 864e5 : "week" === units ? (delta - zoneDelta) / 6048e5 : delta;
        }
        return asFloat ? output : absFloor(output);
    }
    function monthDiff(a, b) {
        var anchor2,
            adjust,
            wholeMonthDiff = 12 * (b.year() - a.year()) + (b.month() - a.month()),
            anchor = a.clone().add(wholeMonthDiff, "months");
        if (0 > b - anchor) {
            anchor2 = a.clone().add(wholeMonthDiff - 1, "months");
            adjust = (b - anchor) / (anchor - anchor2);
        } else {
            anchor2 = a.clone().add(wholeMonthDiff + 1, "months");
            adjust = (b - anchor) / (anchor2 - anchor);
        }
        return -(wholeMonthDiff + adjust) || 0;
    }
    function toString() {
        return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
    }
    function toISOString() {
        var m = this.clone().utc();
        return 0 < m.year() && m.year() <= 9999 ? isFunction(Date.prototype.toISOString) ? this.toDate().toISOString() : formatMoment(m, "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]") : formatMoment(m, "YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]");
    }
    function inspect() {
        if (!this.isValid()) return "moment.invalid(/* " + this._i + " */)";
        var func = "moment";
        var zone = "";
        if (!this.isLocal()) {
            func = 0 === this.utcOffset() ? "moment.utc" : "moment.parseZone";
            zone = "Z";
        }
        var prefix = "[" + func + '("]';
        var year = 0 < this.year() && this.year() <= 9999 ? "YYYY" : "YYYYYY";
        var datetime = "-MM-DD[T]HH:mm:ss.SSS";
        var suffix = zone + '[")]';
        return this.format(prefix + year + datetime + suffix);
    }
    function format(inputString) {
        inputString || (inputString = this.isUtc() ? hooks.defaultFormatUtc : hooks.defaultFormat);
        var output = formatMoment(this, inputString);
        return this.localeData().postformat(output);
    }
    function from(time, withoutSuffix) {
        return this.isValid() && (isMoment(time) && time.isValid() || createLocal(time).isValid()) ? createDuration({
            to: this,
            from: time
        }).locale(this.locale()).humanize(!withoutSuffix) : this.localeData().invalidDate();
    }
    function fromNow(withoutSuffix) {
        return this.from(createLocal(), withoutSuffix);
    }
    function to(time, withoutSuffix) {
        return this.isValid() && (isMoment(time) && time.isValid() || createLocal(time).isValid()) ? createDuration({
            from: this,
            to: time
        }).locale(this.locale()).humanize(!withoutSuffix) : this.localeData().invalidDate();
    }
    function toNow(withoutSuffix) {
        return this.to(createLocal(), withoutSuffix);
    }
    function locale(key) {
        var newLocaleData;
        if (void 0 === key) return this._locale._abbr;
        newLocaleData = getLocale(key);
        null != newLocaleData && (this._locale = newLocaleData);
        return this;
    }
    function localeData() {
        return this._locale;
    }
    function startOf(units) {
        units = normalizeUnits(units);
        switch (units) {
            case "year":
                this.month(0);

            case "quarter":
            case "month":
                this.date(1);

            case "week":
            case "isoWeek":
            case "day":
            case "date":
                this.hours(0);

            case "hour":
                this.minutes(0);

            case "minute":
                this.seconds(0);

            case "second":
                this.milliseconds(0);
        }
        "week" === units && this.weekday(0);
        "isoWeek" === units && this.isoWeekday(1);
        "quarter" === units && this.month(3 * Math.floor(this.month() / 3));
        return this;
    }
    function endOf(units) {
        units = normalizeUnits(units);
        if (void 0 === units || "millisecond" === units) return this;
        "date" === units && (units = "day");
        return this.startOf(units).add(1, "isoWeek" === units ? "week" : units).subtract(1, "ms");
    }
    function valueOf() {
        return this._d.valueOf() - 6e4 * (this._offset || 0);
    }
    function unix() {
        return Math.floor(this.valueOf() / 1e3);
    }
    function toDate() {
        return new Date(this.valueOf());
    }
    function toArray() {
        var m = this;
        return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
    }
    function toObject() {
        var m = this;
        return {
            years: m.year(),
            months: m.month(),
            date: m.date(),
            hours: m.hours(),
            minutes: m.minutes(),
            seconds: m.seconds(),
            milliseconds: m.milliseconds()
        };
    }
    function toJSON() {
        return this.isValid() ? this.toISOString() : null;
    }
    function isValid$1() {
        return isValid(this);
    }
    function parsingFlags() {
        return extend({}, getParsingFlags(this));
    }
    function invalidAt() {
        return getParsingFlags(this).overflow;
    }
    function creationData() {
        return {
            input: this._i,
            format: this._f,
            locale: this._locale,
            isUTC: this._isUTC,
            strict: this._strict
        };
    }
    function addWeekYearFormatToken(token, getter) {
        addFormatToken(0, [token, token.length], 0, getter);
    }
    function getSetWeekYear(input) {
        return getSetWeekYearHelper.call(this, input, this.week(), this.weekday(), this.localeData()._week.dow, this.localeData()._week.doy);
    }
    function getSetISOWeekYear(input) {
        return getSetWeekYearHelper.call(this, input, this.isoWeek(), this.isoWeekday(), 1, 4);
    }
    function getISOWeeksInYear() {
        return weeksInYear(this.year(), 1, 4);
    }
    function getWeeksInYear() {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
    }
    function getSetWeekYearHelper(input, week, weekday, dow, doy) {
        var weeksTarget;
        if (null == input) return weekOfYear(this, dow, doy).year;
        weeksTarget = weeksInYear(input, dow, doy);
        week > weeksTarget && (week = weeksTarget);
        return setWeekAll.call(this, input, week, weekday, dow, doy);
    }
    function setWeekAll(weekYear, week, weekday, dow, doy) {
        var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
            date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);
        this.year(date.getUTCFullYear());
        this.month(date.getUTCMonth());
        this.date(date.getUTCDate());
        return this;
    }
    function getSetQuarter(input) {
        return null == input ? Math.ceil((this.month() + 1) / 3) : this.month(3 * (input - 1) + this.month() % 3);
    }
    function getSetDayOfYear(input) {
        var dayOfYear = Math.round((this.clone().startOf("day") - this.clone().startOf("year")) / 864e5) + 1;
        return null == input ? dayOfYear : this.add(input - dayOfYear, "d");
    }
    function parseMs(input, array) {
        array[MILLISECOND] = toInt(1e3 * ("0." + input));
    }
    function getZoneAbbr() {
        return this._isUTC ? "UTC" : "";
    }
    function getZoneName() {
        return this._isUTC ? "Coordinated Universal Time" : "";
    }
    function createUnix(input) {
        return createLocal(1e3 * input);
    }
    function createInZone() {
        return createLocal.apply(null, arguments).parseZone();
    }
    function preParsePostFormat(string) {
        return string;
    }
    function get$1(format, index, field, setter) {
        var locale = getLocale();
        var utc = createUTC().set(setter, index);
        return locale[field](utc, format);
    }
    function listMonthsImpl(format, index, field) {
        if (isNumber(format)) {
            index = format;
            format = void 0;
        }
        format = format || "";
        if (null != index) return get$1(format, index, field, "month");
        var i;
        var out = [];
        for (i = 0; 12 > i; i++) out[i] = get$1(format, i, field, "month");
        return out;
    }
    function listWeekdaysImpl(localeSorted, format, index, field) {
        if ("boolean" == typeof localeSorted) {
            if (isNumber(format)) {
                index = format;
                format = void 0;
            }
            format = format || "";
        } else {
            format = localeSorted;
            index = format;
            localeSorted = false;
            if (isNumber(format)) {
                index = format;
                format = void 0;
            }
            format = format || "";
        }
        var locale = getLocale(),
            shift = localeSorted ? locale._week.dow : 0;
        if (null != index) return get$1(format, (index + shift) % 7, field, "day");
        var i;
        var out = [];
        for (i = 0; 7 > i; i++) out[i] = get$1(format, (i + shift) % 7, field, "day");
        return out;
    }
    function listMonths(format, index) {
        return listMonthsImpl(format, index, "months");
    }
    function listMonthsShort(format, index) {
        return listMonthsImpl(format, index, "monthsShort");
    }
    function listWeekdays(localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, "weekdays");
    }
    function listWeekdaysShort(localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, "weekdaysShort");
    }
    function listWeekdaysMin(localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, "weekdaysMin");
    }
    function abs() {
        var data = this._data;
        this._milliseconds = mathAbs(this._milliseconds);
        this._days = mathAbs(this._days);
        this._months = mathAbs(this._months);
        data.milliseconds = mathAbs(data.milliseconds);
        data.seconds = mathAbs(data.seconds);
        data.minutes = mathAbs(data.minutes);
        data.hours = mathAbs(data.hours);
        data.months = mathAbs(data.months);
        data.years = mathAbs(data.years);
        return this;
    }
    function addSubtract$1(duration, input, value, direction) {
        var other = createDuration(input, value);
        duration._milliseconds += direction * other._milliseconds;
        duration._days += direction * other._days;
        duration._months += direction * other._months;
        return duration._bubble();
    }
    function add$1(input, value) {
        return addSubtract$1(this, input, value, 1);
    }
    function subtract$1(input, value) {
        return addSubtract$1(this, input, value, -1);
    }
    function absCeil(number) {
        return 0 > number ? Math.floor(number) : Math.ceil(number);
    }
    function bubble() {
        var milliseconds = this._milliseconds;
        var days = this._days;
        var months = this._months;
        var data = this._data;
        var seconds, minutes, hours, years, monthsFromDays;
        if (!(milliseconds >= 0 && days >= 0 && months >= 0 || 0 >= milliseconds && 0 >= days && 0 >= months)) {
            milliseconds += 864e5 * absCeil(monthsToDays(months) + days);
            days = 0;
            months = 0;
        }
        data.milliseconds = milliseconds % 1e3;
        seconds = absFloor(milliseconds / 1e3);
        data.seconds = seconds % 60;
        minutes = absFloor(seconds / 60);
        data.minutes = minutes % 60;
        hours = absFloor(minutes / 60);
        data.hours = hours % 24;
        days += absFloor(hours / 24);
        monthsFromDays = absFloor(daysToMonths(days));
        months += monthsFromDays;
        days -= absCeil(monthsToDays(monthsFromDays));
        years = absFloor(months / 12);
        months %= 12;
        data.days = days;
        data.months = months;
        data.years = years;
        return this;
    }
    function daysToMonths(days) {
        return 4800 * days / 146097;
    }
    function monthsToDays(months) {
        return 146097 * months / 4800;
    }
    function as(units) {
        var days;
        var months;
        var milliseconds = this._milliseconds;
        units = normalizeUnits(units);
        if ("month" === units || "year" === units) {
            days = this._days + milliseconds / 864e5;
            months = this._months + daysToMonths(days);
            return "month" === units ? months : months / 12;
        }
        days = this._days + Math.round(monthsToDays(this._months));
        switch (units) {
            case "week":
                return days / 7 + milliseconds / 6048e5;

            case "day":
                return days + milliseconds / 864e5;

            case "hour":
                return 24 * days + milliseconds / 36e5;

            case "minute":
                return 1440 * days + milliseconds / 6e4;

            case "second":
                return 86400 * days + milliseconds / 1e3;

            case "millisecond":
                return Math.floor(864e5 * days) + milliseconds;

            default:
                throw new Error("Unknown unit " + units);
        }
    }
    function valueOf$1() {
        return this._milliseconds + 864e5 * this._days + this._months % 12 * 2592e6 + 31536e6 * toInt(this._months / 12);
    }
    function makeAs(alias) {
        return function () {
            return this.as(alias);
        };
    }
    function get$2(units) {
        units = normalizeUnits(units);
        return this[units + "s"]();
    }
    function makeGetter(name) {
        return function () {
            return this._data[name];
        };
    }
    function weeks() {
        return absFloor(this.days() / 7);
    }
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }
    function relativeTime$1(posNegDuration, withoutSuffix, locale) {
        var duration = createDuration(posNegDuration).abs();
        var seconds = round(duration.as("s"));
        var minutes = round(duration.as("m"));
        var hours = round(duration.as("h"));
        var days = round(duration.as("d"));
        var months = round(duration.as("M"));
        var years = round(duration.as("y"));
        var a = seconds < thresholds.s && ["s", seconds] || 1 >= minutes && ["m"] || minutes < thresholds.m && ["mm", minutes] || 1 >= hours && ["h"] || hours < thresholds.h && ["hh", hours] || 1 >= days && ["d"] || days < thresholds.d && ["dd", days] || 1 >= months && ["M"] || months < thresholds.M && ["MM", months] || 1 >= years && ["y"] || ["yy", years];
        a[2] = withoutSuffix;
        a[3] = +posNegDuration > 0;
        a[4] = locale;
        return substituteTimeAgo.apply(null, a);
    }
    function getSetRelativeTimeRounding(roundingFunction) {
        if (void 0 === roundingFunction) return round;
        if ("function" == typeof roundingFunction) {
            round = roundingFunction;
            return true;
        }
        return false;
    }
    function getSetRelativeTimeThreshold(threshold, limit) {
        if (void 0 === thresholds[threshold]) return false;
        if (void 0 === limit) return thresholds[threshold];
        thresholds[threshold] = limit;
        return true;
    }
    function humanize(withSuffix) {
        var locale = this.localeData();
        var output = relativeTime$1(this, !withSuffix, locale);
        withSuffix && (output = locale.pastFuture(+this, output));
        return locale.postformat(output);
    }
    function toISOString$1() {
        var seconds = abs$1(this._milliseconds) / 1e3;
        var days = abs$1(this._days);
        var months = abs$1(this._months);
        var minutes, hours, years;
        minutes = absFloor(seconds / 60);
        hours = absFloor(minutes / 60);
        seconds %= 60;
        minutes %= 60;
        years = absFloor(months / 12);
        months %= 12;
        var Y = years;
        var M = months;
        var D = days;
        var h = hours;
        var m = minutes;
        var s = seconds;
        var total = this.asSeconds();
        if (!total) return "P0D";
        return (0 > total ? "-" : "") + "P" + (Y ? Y + "Y" : "") + (M ? M + "M" : "") + (D ? D + "D" : "") + (h || m || s ? "T" : "") + (h ? h + "H" : "") + (m ? m + "M" : "") + (s ? s + "S" : "");
    }
    var hookCallback;
    var some;
    some = Array.prototype.some ? Array.prototype.some : function (fun) {
        var t = Object(this);
        var len = t.length >>> 0;
        for (var i = 0; len > i; i++) if (i in t && fun.call(this, t[i], i, t)) return true;
        return false;
    };
    var some$1 = some;
    var momentProperties = hooks.momentProperties = [];
    var updateInProgress = false;
    var deprecations = {};
    hooks.suppressDeprecationWarnings = false;
    hooks.deprecationHandler = null;
    var keys;
    keys = Object.keys ? Object.keys : function (obj) {
        var i,
            res = [];
        for (i in obj) hasOwnProp(obj, i) && res.push(i);
        return res;
    };
    var keys$1 = keys;
    var defaultCalendar = {
        sameDay: "[Today at] LT",
        nextDay: "[Tomorrow at] LT",
        nextWeek: "dddd [at] LT",
        lastDay: "[Yesterday at] LT",
        lastWeek: "[Last] dddd [at] LT",
        sameElse: "L"
    };
    var defaultLongDateFormat = {
        LTS: "h:mm:ss A",
        LT: "h:mm A",
        L: "MM/DD/YYYY",
        LL: "MMMM D, YYYY",
        LLL: "MMMM D, YYYY h:mm A",
        LLLL: "dddd, MMMM D, YYYY h:mm A"
    };
    var defaultInvalidDate = "Invalid date";
    var defaultOrdinal = "%d";
    var defaultOrdinalParse = /\d{1,2}/;
    var defaultRelativeTime = {
        future: "in %s",
        past: "%s ago",
        s: "a few seconds",
        m: "a minute",
        mm: "%d minutes",
        h: "an hour",
        hh: "%d hours",
        d: "a day",
        dd: "%d days",
        M: "a month",
        MM: "%d months",
        y: "a year",
        yy: "%d years"
    };
    var aliases = {};
    var priorities = {};
    var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;
    var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;
    var formatFunctions = {};
    var formatTokenFunctions = {};
    var match1 = /\d/;
    var match2 = /\d\d/;
    var match3 = /\d{3}/;
    var match4 = /\d{4}/;
    var match6 = /[+-]?\d{6}/;
    var match1to2 = /\d\d?/;
    var match3to4 = /\d\d\d\d?/;
    var match5to6 = /\d\d\d\d\d\d?/;
    var match1to3 = /\d{1,3}/;
    var match1to4 = /\d{1,4}/;
    var match1to6 = /[+-]?\d{1,6}/;
    var matchUnsigned = /\d+/;
    var matchSigned = /[+-]?\d+/;
    var matchOffset = /Z|[+-]\d\d:?\d\d/gi;
    var matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi;
    var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/;
    var matchWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;
    var regexes = {};
    var tokens = {};
    var YEAR = 0;
    var MONTH = 1;
    var DATE = 2;
    var HOUR = 3;
    var MINUTE = 4;
    var SECOND = 5;
    var MILLISECOND = 6;
    var WEEK = 7;
    var WEEKDAY = 8;
    var indexOf;
    indexOf = Array.prototype.indexOf ? Array.prototype.indexOf : function (o) {
        var i;
        for (i = 0; i < this.length; ++i) if (this[i] === o) return i;
        return -1;
    };
    var indexOf$1 = indexOf;
    addFormatToken("M", ["MM", 2], "Mo", function () {
        return this.month() + 1;
    });
    addFormatToken("MMM", 0, 0, function (format) {
        return this.localeData().monthsShort(this, format);
    });
    addFormatToken("MMMM", 0, 0, function (format) {
        return this.localeData().months(this, format);
    });
    addUnitAlias("month", "M");
    addUnitPriority("month", 8);
    addRegexToken("M", match1to2);
    addRegexToken("MM", match1to2, match2);
    addRegexToken("MMM", function (isStrict, locale) {
        return locale.monthsShortRegex(isStrict);
    });
    addRegexToken("MMMM", function (isStrict, locale) {
        return locale.monthsRegex(isStrict);
    });
    addParseToken(["M", "MM"], function (input, array) {
        array[MONTH] = toInt(input) - 1;
    });
    addParseToken(["MMM", "MMMM"], function (input, array, config, token) {
        var month = config._locale.monthsParse(input, token, config._strict);
        null != month ? array[MONTH] = month : getParsingFlags(config).invalidMonth = input;
    });
    var MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/;
    var defaultLocaleMonths = "January_February_March_April_May_June_July_August_September_October_November_December".split("_");
    var defaultLocaleMonthsShort = "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_");
    var defaultMonthsShortRegex = matchWord;
    var defaultMonthsRegex = matchWord;
    addFormatToken("Y", 0, 0, function () {
        var y = this.year();
        return 9999 >= y ? "" + y : "+" + y;
    });
    addFormatToken(0, ["YY", 2], 0, function () {
        return this.year() % 100;
    });
    addFormatToken(0, ["YYYY", 4], 0, "year");
    addFormatToken(0, ["YYYYY", 5], 0, "year");
    addFormatToken(0, ["YYYYYY", 6, true], 0, "year");
    addUnitAlias("year", "y");
    addUnitPriority("year", 1);
    addRegexToken("Y", matchSigned);
    addRegexToken("YY", match1to2, match2);
    addRegexToken("YYYY", match1to4, match4);
    addRegexToken("YYYYY", match1to6, match6);
    addRegexToken("YYYYYY", match1to6, match6);
    addParseToken(["YYYYY", "YYYYYY"], YEAR);
    addParseToken("YYYY", function (input, array) {
        array[YEAR] = 2 === input.length ? hooks.parseTwoDigitYear(input) : toInt(input);
    });
    addParseToken("YY", function (input, array) {
        array[YEAR] = hooks.parseTwoDigitYear(input);
    });
    addParseToken("Y", function (input, array) {
        array[YEAR] = parseInt(input, 10);
    });
    hooks.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2e3);
    };
    var getSetYear = makeGetSet("FullYear", true);
    addFormatToken("w", ["ww", 2], "wo", "week");
    addFormatToken("W", ["WW", 2], "Wo", "isoWeek");
    addUnitAlias("week", "w");
    addUnitAlias("isoWeek", "W");
    addUnitPriority("week", 5);
    addUnitPriority("isoWeek", 5);
    addRegexToken("w", match1to2);
    addRegexToken("ww", match1to2, match2);
    addRegexToken("W", match1to2);
    addRegexToken("WW", match1to2, match2);
    addWeekParseToken(["w", "ww", "W", "WW"], function (input, week, config, token) {
        week[token.substr(0, 1)] = toInt(input);
    });
    var defaultLocaleWeek = {
        dow: 0,
        doy: 6
    };
    addFormatToken("d", 0, "do", "day");
    addFormatToken("dd", 0, 0, function (format) {
        return this.localeData().weekdaysMin(this, format);
    });
    addFormatToken("ddd", 0, 0, function (format) {
        return this.localeData().weekdaysShort(this, format);
    });
    addFormatToken("dddd", 0, 0, function (format) {
        return this.localeData().weekdays(this, format);
    });
    addFormatToken("e", 0, 0, "weekday");
    addFormatToken("E", 0, 0, "isoWeekday");
    addUnitAlias("day", "d");
    addUnitAlias("weekday", "e");
    addUnitAlias("isoWeekday", "E");
    addUnitPriority("day", 11);
    addUnitPriority("weekday", 11);
    addUnitPriority("isoWeekday", 11);
    addRegexToken("d", match1to2);
    addRegexToken("e", match1to2);
    addRegexToken("E", match1to2);
    addRegexToken("dd", function (isStrict, locale) {
        return locale.weekdaysMinRegex(isStrict);
    });
    addRegexToken("ddd", function (isStrict, locale) {
        return locale.weekdaysShortRegex(isStrict);
    });
    addRegexToken("dddd", function (isStrict, locale) {
        return locale.weekdaysRegex(isStrict);
    });
    addWeekParseToken(["dd", "ddd", "dddd"], function (input, week, config, token) {
        var weekday = config._locale.weekdaysParse(input, token, config._strict);
        null != weekday ? week.d = weekday : getParsingFlags(config).invalidWeekday = input;
    });
    addWeekParseToken(["d", "e", "E"], function (input, week, config, token) {
        week[token] = toInt(input);
    });
    var defaultLocaleWeekdays = "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_");
    var defaultLocaleWeekdaysShort = "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_");
    var defaultLocaleWeekdaysMin = "Su_Mo_Tu_We_Th_Fr_Sa".split("_");
    var defaultWeekdaysRegex = matchWord;
    var defaultWeekdaysShortRegex = matchWord;
    var defaultWeekdaysMinRegex = matchWord;
    addFormatToken("H", ["HH", 2], 0, "hour");
    addFormatToken("h", ["hh", 2], 0, hFormat);
    addFormatToken("k", ["kk", 2], 0, kFormat);
    addFormatToken("hmm", 0, 0, function () {
        return "" + hFormat.apply(this) + zeroFill(this.minutes(), 2);
    });
    addFormatToken("hmmss", 0, 0, function () {
        return "" + hFormat.apply(this) + zeroFill(this.minutes(), 2) + zeroFill(this.seconds(), 2);
    });
    addFormatToken("Hmm", 0, 0, function () {
        return "" + this.hours() + zeroFill(this.minutes(), 2);
    });
    addFormatToken("Hmmss", 0, 0, function () {
        return "" + this.hours() + zeroFill(this.minutes(), 2) + zeroFill(this.seconds(), 2);
    });
    meridiem("a", true);
    meridiem("A", false);
    addUnitAlias("hour", "h");
    addUnitPriority("hour", 13);
    addRegexToken("a", matchMeridiem);
    addRegexToken("A", matchMeridiem);
    addRegexToken("H", match1to2);
    addRegexToken("h", match1to2);
    addRegexToken("HH", match1to2, match2);
    addRegexToken("hh", match1to2, match2);
    addRegexToken("hmm", match3to4);
    addRegexToken("hmmss", match5to6);
    addRegexToken("Hmm", match3to4);
    addRegexToken("Hmmss", match5to6);
    addParseToken(["H", "HH"], HOUR);
    addParseToken(["a", "A"], function (input, array, config) {
        config._isPm = config._locale.isPM(input);
        config._meridiem = input;
    });
    addParseToken(["h", "hh"], function (input, array, config) {
        array[HOUR] = toInt(input);
        getParsingFlags(config).bigHour = true;
    });
    addParseToken("hmm", function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken("hmmss", function (input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken("Hmm", function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
    });
    addParseToken("Hmmss", function (input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
    });
    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
    var getSetHour = makeGetSet("Hours", true);
    var baseConfig = {
        calendar: defaultCalendar,
        longDateFormat: defaultLongDateFormat,
        invalidDate: defaultInvalidDate,
        ordinal: defaultOrdinal,
        ordinalParse: defaultOrdinalParse,
        relativeTime: defaultRelativeTime,
        months: defaultLocaleMonths,
        monthsShort: defaultLocaleMonthsShort,
        week: defaultLocaleWeek,
        weekdays: defaultLocaleWeekdays,
        weekdaysMin: defaultLocaleWeekdaysMin,
        weekdaysShort: defaultLocaleWeekdaysShort,
        meridiemParse: defaultLocaleMeridiemParse
    };
    var locales = {};
    var localeFamilies = {};
    var globalLocale;
    var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;
    var basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;
    var tzRegex = /Z|[+-]\d\d(?::?\d\d)?/;
    var isoDates = [["YYYYYY-MM-DD", /[+-]\d{6}-\d\d-\d\d/], ["YYYY-MM-DD", /\d{4}-\d\d-\d\d/], ["GGGG-[W]WW-E", /\d{4}-W\d\d-\d/], ["GGGG-[W]WW", /\d{4}-W\d\d/, false], ["YYYY-DDD", /\d{4}-\d{3}/], ["YYYY-MM", /\d{4}-\d\d/, false], ["YYYYYYMMDD", /[+-]\d{10}/], ["YYYYMMDD", /\d{8}/], ["GGGG[W]WWE", /\d{4}W\d{3}/], ["GGGG[W]WW", /\d{4}W\d{2}/, false], ["YYYYDDD", /\d{7}/]];
    var isoTimes = [["HH:mm:ss.SSSS", /\d\d:\d\d:\d\d\.\d+/], ["HH:mm:ss,SSSS", /\d\d:\d\d:\d\d,\d+/], ["HH:mm:ss", /\d\d:\d\d:\d\d/], ["HH:mm", /\d\d:\d\d/], ["HHmmss.SSSS", /\d\d\d\d\d\d\.\d+/], ["HHmmss,SSSS", /\d\d\d\d\d\d,\d+/], ["HHmmss", /\d\d\d\d\d\d/], ["HHmm", /\d\d\d\d/], ["HH", /\d\d/]];
    var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;
    hooks.createFromInputFallback = deprecate("value provided is not in a recognized ISO format. moment construction falls back to js Date(), which is not reliable across all browsers and versions. Non ISO date formats are discouraged and will be removed in an upcoming major release. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.", function (config) {
        config._d = new Date(config._i + (config._useUTC ? " UTC" : ""));
    });
    hooks.ISO_8601 = function () {};
    var prototypeMin = deprecate("moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/", function () {
        var other = createLocal.apply(null, arguments);
        return this.isValid() && other.isValid() ? this > other ? this : other : createInvalid();
    });
    var prototypeMax = deprecate("moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/", function () {
        var other = createLocal.apply(null, arguments);
        return this.isValid() && other.isValid() ? other > this ? this : other : createInvalid();
    });
    var now = function () {
        return Date.now ? Date.now() : +new Date();
    };
    offset("Z", ":");
    offset("ZZ", "");
    addRegexToken("Z", matchShortOffset);
    addRegexToken("ZZ", matchShortOffset);
    addParseToken(["Z", "ZZ"], function (input, array, config) {
        config._useUTC = true;
        config._tzm = offsetFromString(matchShortOffset, input);
    });
    var chunkOffset = /([\+\-]|\d\d)/gi;
    hooks.updateOffset = function () {};
    var aspNetRegex = /^(\-)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/;
    var isoRegex = /^(-)?P(?:(-?[0-9,.]*)Y)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)W)?(?:(-?[0-9,.]*)D)?(?:T(?:(-?[0-9,.]*)H)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)S)?)?$/;
    createDuration.fn = Duration.prototype;
    var add = createAdder(1, "add");
    var subtract = createAdder(-1, "subtract");
    hooks.defaultFormat = "YYYY-MM-DDTHH:mm:ssZ";
    hooks.defaultFormatUtc = "YYYY-MM-DDTHH:mm:ss[Z]";
    var lang = deprecate("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.", function (key) {
        return void 0 === key ? this.localeData() : this.locale(key);
    });
    addFormatToken(0, ["gg", 2], 0, function () {
        return this.weekYear() % 100;
    });
    addFormatToken(0, ["GG", 2], 0, function () {
        return this.isoWeekYear() % 100;
    });
    addWeekYearFormatToken("gggg", "weekYear");
    addWeekYearFormatToken("ggggg", "weekYear");
    addWeekYearFormatToken("GGGG", "isoWeekYear");
    addWeekYearFormatToken("GGGGG", "isoWeekYear");
    addUnitAlias("weekYear", "gg");
    addUnitAlias("isoWeekYear", "GG");
    addUnitPriority("weekYear", 1);
    addUnitPriority("isoWeekYear", 1);
    addRegexToken("G", matchSigned);
    addRegexToken("g", matchSigned);
    addRegexToken("GG", match1to2, match2);
    addRegexToken("gg", match1to2, match2);
    addRegexToken("GGGG", match1to4, match4);
    addRegexToken("gggg", match1to4, match4);
    addRegexToken("GGGGG", match1to6, match6);
    addRegexToken("ggggg", match1to6, match6);
    addWeekParseToken(["gggg", "ggggg", "GGGG", "GGGGG"], function (input, week, config, token) {
        week[token.substr(0, 2)] = toInt(input);
    });
    addWeekParseToken(["gg", "GG"], function (input, week, config, token) {
        week[token] = hooks.parseTwoDigitYear(input);
    });
    addFormatToken("Q", 0, "Qo", "quarter");
    addUnitAlias("quarter", "Q");
    addUnitPriority("quarter", 7);
    addRegexToken("Q", match1);
    addParseToken("Q", function (input, array) {
        array[MONTH] = 3 * (toInt(input) - 1);
    });
    addFormatToken("D", ["DD", 2], "Do", "date");
    addUnitAlias("date", "D");
    addUnitPriority("date", 9);
    addRegexToken("D", match1to2);
    addRegexToken("DD", match1to2, match2);
    addRegexToken("Do", function (isStrict, locale) {
        return isStrict ? locale._ordinalParse : locale._ordinalParseLenient;
    });
    addParseToken(["D", "DD"], DATE);
    addParseToken("Do", function (input, array) {
        array[DATE] = toInt(input.match(match1to2)[0], 10);
    });
    var getSetDayOfMonth = makeGetSet("Date", true);
    addFormatToken("DDD", ["DDDD", 3], "DDDo", "dayOfYear");
    addUnitAlias("dayOfYear", "DDD");
    addUnitPriority("dayOfYear", 4);
    addRegexToken("DDD", match1to3);
    addRegexToken("DDDD", match3);
    addParseToken(["DDD", "DDDD"], function (input, array, config) {
        config._dayOfYear = toInt(input);
    });
    addFormatToken("m", ["mm", 2], 0, "minute");
    addUnitAlias("minute", "m");
    addUnitPriority("minute", 14);
    addRegexToken("m", match1to2);
    addRegexToken("mm", match1to2, match2);
    addParseToken(["m", "mm"], MINUTE);
    var getSetMinute = makeGetSet("Minutes", false);
    addFormatToken("s", ["ss", 2], 0, "second");
    addUnitAlias("second", "s");
    addUnitPriority("second", 15);
    addRegexToken("s", match1to2);
    addRegexToken("ss", match1to2, match2);
    addParseToken(["s", "ss"], SECOND);
    var getSetSecond = makeGetSet("Seconds", false);
    addFormatToken("S", 0, 0, function () {
        return ~~(this.millisecond() / 100);
    });
    addFormatToken(0, ["SS", 2], 0, function () {
        return ~~(this.millisecond() / 10);
    });
    addFormatToken(0, ["SSS", 3], 0, "millisecond");
    addFormatToken(0, ["SSSS", 4], 0, function () {
        return 10 * this.millisecond();
    });
    addFormatToken(0, ["SSSSS", 5], 0, function () {
        return 100 * this.millisecond();
    });
    addFormatToken(0, ["SSSSSS", 6], 0, function () {
        return 1e3 * this.millisecond();
    });
    addFormatToken(0, ["SSSSSSS", 7], 0, function () {
        return 1e4 * this.millisecond();
    });
    addFormatToken(0, ["SSSSSSSS", 8], 0, function () {
        return 1e5 * this.millisecond();
    });
    addFormatToken(0, ["SSSSSSSSS", 9], 0, function () {
        return 1e6 * this.millisecond();
    });
    addUnitAlias("millisecond", "ms");
    addUnitPriority("millisecond", 16);
    addRegexToken("S", match1to3, match1);
    addRegexToken("SS", match1to3, match2);
    addRegexToken("SSS", match1to3, match3);
    var token;
    for (token = "SSSS"; token.length <= 9; token += "S") addRegexToken(token, matchUnsigned);
    for (token = "S"; token.length <= 9; token += "S") addParseToken(token, parseMs);
    var getSetMillisecond = makeGetSet("Milliseconds", false);
    addFormatToken("z", 0, 0, "zoneAbbr");
    addFormatToken("zz", 0, 0, "zoneName");
    var proto = Moment.prototype;
    proto.add = add;
    proto.calendar = calendar$1;
    proto.clone = clone;
    proto.diff = diff;
    proto.endOf = endOf;
    proto.format = format;
    proto.from = from;
    proto.fromNow = fromNow;
    proto.to = to;
    proto.toNow = toNow;
    proto.get = stringGet;
    proto.invalidAt = invalidAt;
    proto.isAfter = isAfter;
    proto.isBefore = isBefore;
    proto.isBetween = isBetween;
    proto.isSame = isSame;
    proto.isSameOrAfter = isSameOrAfter;
    proto.isSameOrBefore = isSameOrBefore;
    proto.isValid = isValid$1;
    proto.lang = lang;
    proto.locale = locale;
    proto.localeData = localeData;
    proto.max = prototypeMax;
    proto.min = prototypeMin;
    proto.parsingFlags = parsingFlags;
    proto.set = stringSet;
    proto.startOf = startOf;
    proto.subtract = subtract;
    proto.toArray = toArray;
    proto.toObject = toObject;
    proto.toDate = toDate;
    proto.toISOString = toISOString;
    proto.inspect = inspect;
    proto.toJSON = toJSON;
    proto.toString = toString;
    proto.unix = unix;
    proto.valueOf = valueOf;
    proto.creationData = creationData;
    proto.year = getSetYear;
    proto.isLeapYear = getIsLeapYear;
    proto.weekYear = getSetWeekYear;
    proto.isoWeekYear = getSetISOWeekYear;
    proto.quarter = proto.quarters = getSetQuarter;
    proto.month = getSetMonth;
    proto.daysInMonth = getDaysInMonth;
    proto.week = proto.weeks = getSetWeek;
    proto.isoWeek = proto.isoWeeks = getSetISOWeek;
    proto.weeksInYear = getWeeksInYear;
    proto.isoWeeksInYear = getISOWeeksInYear;
    proto.date = getSetDayOfMonth;
    proto.day = proto.days = getSetDayOfWeek;
    proto.weekday = getSetLocaleDayOfWeek;
    proto.isoWeekday = getSetISODayOfWeek;
    proto.dayOfYear = getSetDayOfYear;
    proto.hour = proto.hours = getSetHour;
    proto.minute = proto.minutes = getSetMinute;
    proto.second = proto.seconds = getSetSecond;
    proto.millisecond = proto.milliseconds = getSetMillisecond;
    proto.utcOffset = getSetOffset;
    proto.utc = setOffsetToUTC;
    proto.local = setOffsetToLocal;
    proto.parseZone = setOffsetToParsedOffset;
    proto.hasAlignedHourOffset = hasAlignedHourOffset;
    proto.isDST = isDaylightSavingTime;
    proto.isLocal = isLocal;
    proto.isUtcOffset = isUtcOffset;
    proto.isUtc = isUtc;
    proto.isUTC = isUtc;
    proto.zoneAbbr = getZoneAbbr;
    proto.zoneName = getZoneName;
    proto.dates = deprecate("dates accessor is deprecated. Use date instead.", getSetDayOfMonth);
    proto.months = deprecate("months accessor is deprecated. Use month instead", getSetMonth);
    proto.years = deprecate("years accessor is deprecated. Use year instead", getSetYear);
    proto.zone = deprecate("moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/", getSetZone);
    proto.isDSTShifted = deprecate("isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information", isDaylightSavingTimeShifted);
    var proto$1 = Locale.prototype;
    proto$1.calendar = calendar;
    proto$1.longDateFormat = longDateFormat;
    proto$1.invalidDate = invalidDate;
    proto$1.ordinal = ordinal;
    proto$1.preparse = preParsePostFormat;
    proto$1.postformat = preParsePostFormat;
    proto$1.relativeTime = relativeTime;
    proto$1.pastFuture = pastFuture;
    proto$1.set = set;
    proto$1.months = localeMonths;
    proto$1.monthsShort = localeMonthsShort;
    proto$1.monthsParse = localeMonthsParse;
    proto$1.monthsRegex = monthsRegex;
    proto$1.monthsShortRegex = monthsShortRegex;
    proto$1.week = localeWeek;
    proto$1.firstDayOfYear = localeFirstDayOfYear;
    proto$1.firstDayOfWeek = localeFirstDayOfWeek;
    proto$1.weekdays = localeWeekdays;
    proto$1.weekdaysMin = localeWeekdaysMin;
    proto$1.weekdaysShort = localeWeekdaysShort;
    proto$1.weekdaysParse = localeWeekdaysParse;
    proto$1.weekdaysRegex = weekdaysRegex;
    proto$1.weekdaysShortRegex = weekdaysShortRegex;
    proto$1.weekdaysMinRegex = weekdaysMinRegex;
    proto$1.isPM = localeIsPM;
    proto$1.meridiem = localeMeridiem;
    getSetGlobalLocale("en", {
        ordinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal: function (number) {
            var b = number % 10,
                output = 1 === toInt(number % 100 / 10) ? "th" : 1 === b ? "st" : 2 === b ? "nd" : 3 === b ? "rd" : "th";
            return number + output;
        }
    });
    hooks.lang = deprecate("moment.lang is deprecated. Use moment.locale instead.", getSetGlobalLocale);
    hooks.langData = deprecate("moment.langData is deprecated. Use moment.localeData instead.", getLocale);
    var mathAbs = Math.abs;
    var asMilliseconds = makeAs("ms");
    var asSeconds = makeAs("s");
    var asMinutes = makeAs("m");
    var asHours = makeAs("h");
    var asDays = makeAs("d");
    var asWeeks = makeAs("w");
    var asMonths = makeAs("M");
    var asYears = makeAs("y");
    var milliseconds = makeGetter("milliseconds");
    var seconds = makeGetter("seconds");
    var minutes = makeGetter("minutes");
    var hours = makeGetter("hours");
    var days = makeGetter("days");
    var months = makeGetter("months");
    var years = makeGetter("years");
    var round = Math.round;
    var thresholds = {
        s: 45,
        m: 45,
        h: 22,
        d: 26,
        M: 11
    };
    var abs$1 = Math.abs;
    var proto$2 = Duration.prototype;
    proto$2.abs = abs;
    proto$2.add = add$1;
    proto$2.subtract = subtract$1;
    proto$2.as = as;
    proto$2.asMilliseconds = asMilliseconds;
    proto$2.asSeconds = asSeconds;
    proto$2.asMinutes = asMinutes;
    proto$2.asHours = asHours;
    proto$2.asDays = asDays;
    proto$2.asWeeks = asWeeks;
    proto$2.asMonths = asMonths;
    proto$2.asYears = asYears;
    proto$2.valueOf = valueOf$1;
    proto$2._bubble = bubble;
    proto$2.get = get$2;
    proto$2.milliseconds = milliseconds;
    proto$2.seconds = seconds;
    proto$2.minutes = minutes;
    proto$2.hours = hours;
    proto$2.days = days;
    proto$2.weeks = weeks;
    proto$2.months = months;
    proto$2.years = years;
    proto$2.humanize = humanize;
    proto$2.toISOString = toISOString$1;
    proto$2.toString = toISOString$1;
    proto$2.toJSON = toISOString$1;
    proto$2.locale = locale;
    proto$2.localeData = localeData;
    proto$2.toIsoString = deprecate("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)", toISOString$1);
    proto$2.lang = lang;
    addFormatToken("X", 0, 0, "unix");
    addFormatToken("x", 0, 0, "valueOf");
    addRegexToken("x", matchSigned);
    addRegexToken("X", matchTimestamp);
    addParseToken("X", function (input, array, config) {
        config._d = new Date(1e3 * parseFloat(input, 10));
    });
    addParseToken("x", function (input, array, config) {
        config._d = new Date(toInt(input));
    });
    hooks.version = "2.16.0";
    setHookCallback(createLocal);
    hooks.fn = proto;
    hooks.min = min;
    hooks.max = max;
    hooks.now = now;
    hooks.utc = createUTC;
    hooks.unix = createUnix;
    hooks.months = listMonths;
    hooks.isDate = isDate;
    hooks.locale = getSetGlobalLocale;
    hooks.invalid = createInvalid;
    hooks.duration = createDuration;
    hooks.isMoment = isMoment;
    hooks.weekdays = listWeekdays;
    hooks.parseZone = createInZone;
    hooks.localeData = getLocale;
    hooks.isDuration = isDuration;
    hooks.monthsShort = listMonthsShort;
    hooks.weekdaysMin = listWeekdaysMin;
    hooks.defineLocale = defineLocale;
    hooks.updateLocale = updateLocale;
    hooks.locales = listLocales;
    hooks.weekdaysShort = listWeekdaysShort;
    hooks.normalizeUnits = normalizeUnits;
    hooks.relativeTimeRounding = getSetRelativeTimeRounding;
    hooks.relativeTimeThreshold = getSetRelativeTimeThreshold;
    hooks.calendarFormat = getCalendarFormat;
    hooks.prototype = proto;
    return hooks;
});