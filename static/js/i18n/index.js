(function () {
    const DEFAULT_LOCALE = 'en';

    const deepKeys = (obj, path = '', result = []) => {
        Object.entries(obj).forEach(([key, value]) => {
            const nextPath = path ? `${path}.${key}` : key;
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                deepKeys(value, nextPath, result);
            } else {
                result.push(nextPath);
            }
        });
        return result;
    };

    const locales = window.APP_I18N_LOCALES || {};
    const localeCodes = Object.keys(locales);

    if (!localeCodes.includes(DEFAULT_LOCALE)) {
        throw new Error(`Missing default locale: ${DEFAULT_LOCALE}`);
    }

    const baseKeys = deepKeys(locales[DEFAULT_LOCALE]).sort();

    localeCodes.forEach((code) => {
        const keys = deepKeys(locales[code]).sort();
        if (keys.length !== baseKeys.length || keys.some((key, index) => key !== baseKeys[index])) {
            throw new Error(`Locale keys mismatch for ${code}. Keep all translation keys strictly synchronized.`);
        }
    });

    const getStoredLocale = () => {
        const stored = window.localStorage.getItem('app_locale');
        return localeCodes.includes(stored) ? stored : DEFAULT_LOCALE;
    };

    const format = (template, values = {}) =>
        template.replace(/\{(\w+)\}/g, (_, key) => (values[key] ?? `{${key}}`));

    window.APP_I18N = {
        DEFAULT_LOCALE,
        localeCodes,
        locales,
        getStoredLocale,
        setStoredLocale(locale) {
            if (localeCodes.includes(locale)) {
                window.localStorage.setItem('app_locale', locale);
            }
        },
        t(locale, key, values = {}) {
            const dict = locales[locale] || locales[DEFAULT_LOCALE];
            const resolved = key.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), dict);
            if (typeof resolved !== 'string') {
                throw new Error(`Missing translation string: ${locale}.${key}`);
            }
            return format(resolved, values);
        },
    };
})();
