import { MenuTemplate } from 'grammy-inline-menu';
import { backButtons } from '../general.js';
import { menu as languageMenu } from './language.js';
export const menu = new MenuTemplate(ctx => ctx.t('settings-body'));
menu.submenu('lang', languageMenu, {
    text: ctx => '🏳️‍🌈' + ctx.t('menu-language'),
});
menu.manualRow(backButtons);
//# sourceMappingURL=index.js.map