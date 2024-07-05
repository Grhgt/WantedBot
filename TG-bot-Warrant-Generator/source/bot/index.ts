import {env} from 'node:process';
import {FileAdapter} from '@grammyjs/storage-file';
import {config as dotenv} from 'dotenv';
import {Bot, session, InputFile } from 'grammy';
import {generateUpdateMiddleware} from 'telegraf-middleware-console-time';
import {html as format} from 'telegram-format';
import {i18n} from '../translation.js';
import type {MyContext, Session} from './my-context.js';
import nodeHtmlToImage from 'node-html-to-image';
import { readFileSync } from 'fs';
import { EventEmitter } from 'events';
import font2base64 from 'node-font2base64';
import fetch from 'node-fetch';

const emitter = new EventEmitter();
emitter.setMaxListeners(150);

dotenv(); // Load from .env file
const token = env['BOT_TOKEN'];
if (!token) {
	throw new Error(
		'You have to provide the bot-token from @BotFather via environment variable (BOT_TOKEN)',
	);
}

let chat_id = 0; //chat id
let result_fn_image = '';

let xhandle_msg_id = 0;
let haveseen_msg_id = 0;
let wanted_msg_id = 0;
let funnycontext_msg_id = 0;
let haveseen_txt = '';
let wanted_txt = '';
let funnycontext_txt = '';
let requester = '';
const x_access_token = env['TWITTER_ACCESS_TOKEN'];
const api_endpoint = env['API_ENDPOINT']
const group_chatID = env['GROUP_CHATID_TEST']
const main_group_chatID = env['GROUP_CHATID_MAIN']

//for test
let avatar_base64 = '';
let username = '';

const leagueSpartan = font2base64.encodeToDataUrlSync('html-template/fonts/LeagueSpartan-Bold.ttf');
const cerebi_italic = font2base64.encodeToDataUrlSync('html-template/fonts/Cerebri Sans Bold Italic.ttf');

const htmlTemplate = `
<html>
	<head>
		<title>Template</title>
		<style>
			@font-face {
				font-family: 'League Spartan Bold';
				src: url(${leagueSpartan});
			}
			
			@font-face {
				font-family: 'Cerebri Sans Bold Italic';
				src: url(${cerebi_italic});
			}

			body {
				font-family: 'League Spartan Bold', League Spartan Bold;
				font-family: 'Cerebri Sans Bold Italic', Cerebri Sans Bold Italic;
				text-transform: uppercase;
			}
		</style>
	</head>
	<body style="width: 1586px !important; height: 2245px !important; margin: 0 !important;" >
		<div style="display: flex;position: relative;width: 100%;height: 100%;overflow: hidden;">
			<img src="{{ background }}" style="height: 100%;width: 100% !important;position: absolute;left: 0px;top: 0px;object-fit: cover;">
			<img src="{{ dontCross }}" style="width: 900px;height: 900px;position: absolute;left: -221px;top: -289px;">
			<div style="display: flex;flex-direction: column;align-items: center; position: relative;width: 100%;margin-top: 240px;">
				<img src="{{ wanted }}" style="width: 1100px;height: 1000px;position: absolute;">
				<div style="display: flex;align-items: center;justify-content: space-between; margin-top: 205px;">
					<img src="{{ star }}" style="width: 80px;height: 80px;">
					<img id="avatar" src={{ avatar }} style="width: 820px;height: 820px;border-radius: 50%;overflow: hidden;padding: 0 64px;">
					<img src="{{ star }}" style="width: 80px;height: 80px;">
					<img src="{{ new }}" style="width: 300px;height: 200px;position: absolute;left: 1150px;top: 307px;">
					<img src="{{ mostWanted }}" style="width: 500px;height: 500px; position: absolute; left: 50px;top: 680px;">
				</div>
				<div id="haveseen" style="font-family:'League Spartan Bold';font-size: 75px;color: white;text-align: center;margin-top: 90px;margin-bottom: 70px;width: 100%;">
					{{ haveseen }}
				</div>
				<div style="display: flex; flex-direction: column; justify-content: center; align-items: center; background-color:#EEB50D; width: 100%;">
					<div id="username" style="line-height: 1.0;color: black;font-size: 136px;font-family: 'League Spartan Bold';font-weight: bold;margin-top:  60px;margin-bottom: 26px;width: 100%;text-align: center;">{{ username }}</div>
					<div style="width: 80%; border: 1px solid #ffffff;"></div>
					<div id="wanted" style="line-height: 1.0;color: black;font-size: 78px;font-family: 'Cerebri Sans Bold Italic';margin-top: 38px;margin-bottom: 38px;width: 100%;text-align: center;">{{ wantedby }}</div>
				</div>
				<div style="width: 100%; flex-grow: 1; display: flex; align-items: center; justify-content: center;">
					<div id="content" style="font-family:'Cerebri Sans Bold Italic';font-size: 74px;color: white;font-style: italic;font-weight: bold;width: 95%;text-align: center;margin: 0px !important; word-wrap: break-word;">{{ funnyContext }}</div>
				</div>
			</div>
			</div>
		</div>
	</body>
</html>
`

const html2image = async (): Promise<void> => {

	// Write changes to a new file
	const background = readFileSync('html-template/' + 'background.png', { encoding: 'base64' })
	const dataURI_background = 'data:image/jpeg;base64,' + background

	const dontcross = readFileSync('html-template/' + 'DontCross.png', { encoding: 'base64' })
	const dataURI_dontcross = 'data:image/jpeg;base64,' + dontcross

	const wanted = readFileSync('html-template/' + 'wanted.png', { encoding: 'base64' })
	const dataURI_wanted = 'data:image/jpeg;base64,' + wanted

	const star = readFileSync('html-template/' + 'star.png', { encoding: 'base64' })
	const dataURI_star = 'data:image/jpeg;base64,' + star
	
	const newMark = readFileSync('html-template/' + 'new.png', { encoding: 'base64' })
	const dataURI_newMark = 'data:image/jpeg;base64,' + newMark
	
	const mostWanted = readFileSync('html-template/' + 'mostWanted.png', { encoding: 'base64' })
	const dataURI_mostWanted = 'data:image/jpeg;base64,' + mostWanted

	result_fn_image = 'img_' + chat_id + '.png'

	await nodeHtmlToImage({
		output: 'html-template/wanteds/' + result_fn_image,
		html: htmlTemplate,
		content: { 
			background: dataURI_background, 
			dontCross: dataURI_dontcross, 
			wanted: dataURI_wanted, 
			star: dataURI_star, 
			new: dataURI_newMark, 
			mostWanted: dataURI_mostWanted, 
			avatar: avatar_base64, 
			haveseen: haveseen_txt,
			username: username.toUpperCase(),
			wantedby: wanted_txt,
			funnyContext: funnycontext_txt,
		}
	});
}

const getImageBase64 = async (url: string): Promise<string> => {
	const response = await fetch(url);
	const buffer = await response.buffer();
	return buffer.toString('base64');
}

const getRequest = async (username: string): Promise<any> => {
	const real_url = api_endpoint + username + "?user.fields=name,profile_image_url";
	try {
		const response = await fetch(real_url, {
			method: 'GET',
			headers: {
				"authorization": "Bearer " + x_access_token
			}
		});
		
		if (!response.ok) {
			throw new Error(`Error! status: ${response.status}`);
		}
		
		const result = await response.json();
		return result;
	} catch (error) {
		if (error instanceof Error) {
			return Promise.reject(error.message);
		} 
		else {
		return Promise.reject('An unexpected error occurred');
		}
	}
}

const processImageUrl = (image_url: string): string => {
	return image_url.replace('_normal', '');
}

const bot = new Bot<MyContext>(token);

bot.use(session({
	initial: (): Session => ({}),
	storage: new FileAdapter(),
}));

bot.use(i18n.middleware());

if (env['NODE_ENV'] !== 'production') {
	bot.use(generateUpdateMiddleware());
}

bot.command('html', async ctx => {
	let text = '';
	text += format.bold('Some');
	text += ' ';
	text += format.spoiler('HTML');
	await ctx.reply(text, {parse_mode: format.parse_mode});
});

bot.command('start', async ctx => {
	ctx.replyWithPhoto(new InputFile('html-template/sample.jpg'), {
		caption: format.bold("This bot is a Arrest Warrant Poster Generate Bot." + '\n' + "You can follow these instructions.") + 
			'\n\n' + "1. Input your X @handle: " + 
			'\n' + format.italic('i.e: @xxxxx or xxxxx') +
			'\n\n' + "2. Input what have you seen: " + 
			'\n' + format.italic('i.e: AAAAA') +
			'\n\n' + "3. Input who is wanted by: " + 
			'\n' + format.italic('i.e: BBBBB') +
			'\n\n' + "4. Input a funny content: " + 
			'\n' + format.italic('i.e: CCCCC') + 
			'\n\n' + format.bold('Click here /poster to generate your own Warrant Poster.'),
		parse_mode: 'HTML',
	})
});

bot.command('poster', async ctx => {
	chat_id = ctx.chatId;
	if(ctx.message?.from.username){
		requester = ctx.message?.from.username;
	}
	const message = ctx.reply("Who are we arresting? X @handle")
	xhandle_msg_id = (await message).message_id + 1;
});

bot.on('message', async ctx => {
	if(ctx.chatId == chat_id) {
		switch (ctx?.message?.message_id) {
			case xhandle_msg_id:
				if(ctx.message.text !=null) {
					const loading_msg = ctx.reply("Processing your request...")

					let name = ctx.message.text;
					//normalize xhandle
					if(name.startsWith('@')) {
						name = name.slice(1);
					}

					//twitter user info fetch
					const res = await getRequest(name);
					let reply_msg;
					if(res != null && res.data != null) {
						let avatar_url = processImageUrl(res.data.profile_image_url)
						username = res.data.name
						//get base64
						avatar_base64 = await getImageBase64(avatar_url)
						avatar_base64 = 'data:image/jpeg;base64,' + avatar_base64;
						await ctx.api.deleteMessage(chat_id, (await loading_msg).message_id);
						reply_msg = await ctx.replyWithPhoto(avatar_url, {caption: "Criminal's name: " + username + '\n\n' + format.bold("Have you seen this?") + '\n' + "Note: The available word's length is 15.", parse_mode: 'HTML'});
						haveseen_msg_id = reply_msg.message_id + 1;
					}
					else {
						reply_msg = ctx.reply('This user doesn`t exist in X. Please enter the correct X @handle again.');
						xhandle_msg_id = (await reply_msg).message_id + 1;
					}
				}
				break;
			case haveseen_msg_id:
				const message = ctx.message.text;
				let haveseen_reply;
				if(message && message?.length < 16) {
					haveseen_txt = "have you seen this " + message;
					haveseen_reply = ctx.reply('Wanted by:' + '\n\n' + "Note: The available word's length is 20.");
					wanted_msg_id = (await haveseen_reply).message_id + 1;
				}
				else {
					haveseen_reply = ctx.reply("Your word's length: " + message?.length + "\n\n" + format.bold("The maximum length is 15.") + '\n' + "Please enter it again.", { parse_mode: 'HTML'});
					haveseen_msg_id = (await haveseen_reply).message_id + 1;
				}
				break;
			case wanted_msg_id:
				const wanted_msg = ctx.message.text;
				let wanted_reply;
				if(wanted_msg && wanted_msg?.length < 21) {
					wanted_txt = "wanted by " + wanted_msg;
					wanted_reply = ctx.reply("Funny context." + "\n\n" + "Note: The maximum length is 100.")
					funnycontext_msg_id = (await wanted_reply).message_id + 1;
				}
				else {
					wanted_reply = ctx.reply("The inputed word's length: " + wanted_msg?.length + "\n\n" + format.bold("The maximum length is 12.") + '\n' + "Please enter it again.",{ parse_mode: 'HTML'}); 
					wanted_msg_id = (await wanted_reply).message_id + 1;
				}
				break;
			case funnycontext_msg_id:
				let funny_reply;
				if(ctx.message.text && ctx.message.text.length > 101) {
					funny_reply = ctx.reply("The message length is " + ctx.message.text.length +"\n" + "The maximum length is 100. Please enter it again.");
					funnycontext_msg_id = (await funny_reply).message_id + 1;
				}
				else {
					if(ctx.message.text) {
						funnycontext_txt = ctx.message.text;
						const loading_msg = ctx.reply("Processing your request...")
						await html2image()
						await ctx.api.deleteMessage(chat_id, (await loading_msg).message_id);
						const reply_img = new InputFile('html-template/wanteds/' + result_fn_image)
						await ctx.replyWithPhoto(reply_img);
						if(group_chatID !=null && group_chatID != undefined) {
							await bot.api.sendPhoto(group_chatID, reply_img, { caption : format.bold(requester) + " generated this poster. Enjoy it.", parse_mode: 'HTML'} )
						}
						if(main_group_chatID !=null && main_group_chatID != undefined) {
							await bot.api.sendPhoto(main_group_chatID, reply_img, { caption : format.bold(requester) + " generated this poster. Enjoy it.", parse_mode: 'HTML'} )
						}
					}
				}
				break;
			default: ctx.reply("Please restart the process. Click here: /start")
		}
	}
	
});

// False positive as bot is not a promise
// eslint-disable-next-line unicorn/prefer-top-level-await
bot.catch(error => {
	console.error('ERROR on handling update occured', error);
});

export async function start(): Promise<void> {
	// The commands you set here will be shown as /commands like /start or /magic in your telegram client.
	await bot.api.setMyCommands([
		{command: 'start', description: 'open the menu'},
		{command: 'poster', description: 'generate poster'},
	]);

	await bot.start({
		onStart(botInfo) {
			console.log(new Date(), 'Bot starts as', botInfo.username);
		},
	});
}
