import { MenuTemplate } from 'grammy-inline-menu';
import { getAvailableLocales } from '../../../translation.js';
import { backButtons } from '../general.js';
export const menu = new MenuTemplate(ctx => ctx.t('settings-language'));
menu.select('lang', {
    choices: getAvailableLocales,
    isSet: async (ctx, key) => await ctx.i18n.getLocale() === key,
    async set(ctx, key) {
        await ctx.i18n.setLocale(key);
        return true;
    },
});
menu.manualRow(backButtons);
//# sourceMappingURL=language.js.map