# OpenAI Telegram Bot

This Telegram bot uses the OpenAI API to generate text based on user input. It only responds to authorized users, and each user has their own API key.

## Requirements

- Node.js
- Telegram Bot API access token
- OpenAI API access token

## Installation

1. Clone the repository: `git clone https://github.com/Nishikinov/telegramgpt.git`
2. Install dependencies: `npm install`
3. Rename `.env.example` to `.env`
4. Set your Telegram Bot API access token in `.env`
5. Set your OpenAI API access token in `.env`
6. Set the list of authorized users in `.env`
7. Set API keys for each authorized user in `.env`
8. Start the bot: `npm start`

## Usage

- Send `/auth` command to the bot to authenticate yourself and provide your API key.
- Send any text to the bot to generate a response based on previous messages.
- Send `/reset` command to clear the context for the current user.
- Send `/stop` command to stop the text generation.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
