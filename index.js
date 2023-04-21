const dotenv = require('dotenv');
dotenv.config();

const { Telegraf } = require('telegraf')
const OpenAI = require('openai-api');
const whitelist = process.env.BOT_WHITELIST.split(',');
const API_KEYS = {};
whitelist.forEach((user) => {
  API_KEYS[user] = process.env[`API_KEY_${user}`];
});

const openai = new OpenAI(API_KEYS[0]);

const bot = new Telegraf(process.env.BOT_TOKEN);

const contextMap = {};

const resetContext = (userId) => {
  contextMap[userId] = {
    prompt: '',
    completions: [],
  };
};

bot.start((ctx) => {
  const message = `Привет, ${ctx.from.first_name}! Я бот для работы с OpenAI API. Для начала работы нужно авторизоваться командой /auth.`;
  ctx.reply(message);
});

bot.command('auth', (ctx) => {
  const userId = ctx.from.id.toString();
  if (!whitelist.includes(userId)) {
    ctx.reply('К сожалению, вы не имеете доступа к этому боту.');
    return;
  }
  API_KEYS[userId]
    ? ctx.reply('Вы уже авторизованы.')
    : ctx.reply('Введите свой API ключ:');
});

bot.on('text', async (ctx) => {
  const userId = ctx.from.id.toString();
  if (!whitelist.includes(userId)) {
    ctx.reply('К сожалению, вы не имеете доступа к этому боту.');
    return;
  }
  if (!API_KEYS[userId]) {
    API_KEYS[userId] = ctx.message.text;
    ctx.reply('Авторизация прошла успешно!');
    return;
  }
  const message = ctx.message.text;
  const prompt = contextMap[userId]?.prompt || '';
  const completions = contextMap[userId]?.completions || [];

  try {
    const response = await openai.completions.create({
      engine: 'gpt-3.5-turbo',
      prompt: `${prompt} ${message}`,
      max_tokens: 100,
      n: 1,
      stop: '\n',
      temperature: 0.7,
      apiKey: API_KEYS[userId],
    });

    const text = response.data.choices[0].text.trim();
    completions.push({
      prompt: message,
      text,
    });
    contextMap[userId] = { prompt: '', completions };

    if (ctx.session.stop) {
      bot.telegram.editMessageText(ctx.chat.id, ctx.session.messageId, null, 'Генерация текста остановлена.');
      ctx.session.stop = false;
      return;
    }

    if (text) {
      if (ctx.session.messageId) {
        bot.telegram.editMessageText(ctx.chat.id, ctx.session.messageId, null, text);
      } else {
        const sent = await ctx.reply(text);
        ctx.session.messageId = sent.message_id;
      }
    } else {
      ctx.reply('Ответ не получен от OpenAI API.');
    }
  } catch (err) {
    console.error(err);
    ctx.reply('Произошла ошибка, попробуйте еще раз.');
  }
});

bot.command('reset', (ctx) => {
  const userId = ctx.from.id.toString();
  if (!whitelist.includes(userId)) {
    ctx.reply('К сожалению, вы не имеете доступа к этому боту.');
    return;
  }
  resetContext(userId);
  ctx.reply('Контекст очищен.');
});

bot.command('stop', (ctx) => {
  ctx.session.stop = true;
});

bot.launch();