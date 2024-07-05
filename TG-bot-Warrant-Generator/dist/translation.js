import { I18n } from '@grammyjs/i18n';
export const i18n = new I18n({
    defaultLocale: 'en',
    useSession: true,
    directory: 'locales',
});
export function getAvailableLocales() {
    return i18n.locales;
}
//# sourceMappingURL=translation.js.map