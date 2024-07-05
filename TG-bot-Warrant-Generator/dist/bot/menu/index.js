import { MenuTemplate } from 'grammy-inline-menu';
import { menu as settingsMenu } from './settings/index.js';
export const menu = new MenuTemplate(ctx => ctx.t('welcome', { name: ctx.from.first_name }));
menu.url({
    text: 'Telegram API Documentation',
    url: 'https://core.telegram.org/bots/api',
});
menu.url({
    text: 'grammY Documentation',
    url: 'https://grammy.dev/',
});
menu.url({
    text: 'Inline Menu Documentation',
    url: 'https://github.com/EdJoPaTo/grammy-inline-menu',
});
menu.submenu('settings', settingsMenu, {
    text: ctx => '⚙️' + ctx.t('menu-settings'),
});
//# sourceMappingURL=index.js.map