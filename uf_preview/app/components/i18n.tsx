// i18n.ts
'use client';

class I18N {
  private lang: string;
  private fallbackLang: string;
  private keysets: Record<string, Record<string, Record<string, string>>>;

  constructor(config: { lang: string; fallbackLang: string }) {
    this.lang = config.lang;
    this.fallbackLang = config.fallbackLang;
    this.keysets = {};
  }

  /**
   * Register translations for a specific language
   * @param lang - Language code (e.g., 'en', 'es', 'fr')
   * @param keysets - Object containing namespaces with translations
   */
  registerKeysets(lang: string, keysets: Record<string, Record<string, string>>) {
    if (!this.keysets[lang]) {
      this.keysets[lang] = {};
    }

    // Merge keysets for the language
    Object.keys(keysets).forEach((namespace) => {
      this.keysets[lang][namespace] = {
        ...this.keysets[lang][namespace],
        ...keysets[namespace],
      };
    });
  }

  /**
   * Set the current language
   * @param lang - Language code
   */
  setLang(lang: string) {
    this.lang = lang;
  }

  /**
   * Get the current language
   */
  getLang(): string {
    return this.lang;
  }

  /**
   * Get a keyset function for a specific namespace
   * @param namespace - The namespace (e.g., 'language')
   * @returns A function that retrieves translations
   */
  keyset(namespace: string = 'language') {
    return (key: string, params?: Record<string, any>): string => {
      // Try to get translation from current language
      let translation =
        this.keysets[this.lang]?.[namespace]?.[key] ||
        this.keysets[this.fallbackLang]?.[namespace]?.[key] ||
        key;

      // Replace parameters if provided
      if (params && typeof translation === 'string') {
        Object.keys(params).forEach((paramKey) => {
          const regex = new RegExp(`{{${paramKey}}}`, 'g');
          translation = translation.replace(regex, String(params[paramKey]));
        });
      }

      return translation;
    };
  }

  /**
   * Get a direct translation
   * @param key - Translation key
   * @param namespace - Namespace (default: 'language')
   */
  t(key: string, namespace: string = 'language'): string {
    return this.keyset(namespace)(key);
  }

  /**
   * Check if a key exists in the translations
   * @param key - Translation key
   * @param namespace - Namespace
   */
  has(key: string, namespace: string = 'language'): boolean {
    return !!(
      this.keysets[this.lang]?.[namespace]?.[key] ||
      this.keysets[this.fallbackLang]?.[namespace]?.[key]
    );
  }

  /**
   * Get all translations for a namespace
   * @param namespace - Namespace
   */
  getAll(namespace: string = 'language'): Record<string, string> {
    return {
      ...this.keysets[this.fallbackLang]?.[namespace],
      ...this.keysets[this.lang]?.[namespace],
    };
  }
}

const i18n = new I18N({
  lang: 'en',
  fallbackLang: 'en',
});

export default i18n;
