# DiscordBotList

You've just landed on the source code of DiscordBotList (https://discordbotlist.com).

I'd appreciate PRs to improve this readme itself as I haven't had enough time to make it extensive.

## Important legal clarification

The [up and running website](https://discordbotlist.com) is merely a theft by a previous website (but not source code) co-owner. Read the full details [at this Medium article](https://medium.com/@overcoder0/discordbotlist-a-theft-that-led-to-going-open-source-24a4517abc22?sk=f8f54a5f94251002520f460bc548fa88)

MIT licensed.

## Building and running

Not that's I've tested but roughly:

```bash
git clone https://github.com/MicroDroid/discordbotlist
cd discordbotlist
npm i
cp .env.example .env
vim .env # add some things here
./node_modules/.bin/sequelize db:migrate
npm run webapp:dev
# now open another terminal
npm run dev
```

Then probably visit `http://localhost:8080/` or something.

## Navigating the project tree

The website is composed of many pieces stuck together:

-   `/` - This is where things like entry points and tool configs reside - `webapp/` - The entire source code of the front-end - `js/` - A Vue.JS web app, a bit similar in structure to [vue-hackernews-2.0](https://github.com/vuejs/vue-hackernews-2.0) - `scss/` - Styling is done using Boostrap, so here resides Bootstrap things and few other misc. styles - `models/` - These are [sequelize](https://github.com/sequelize/sequelize) models, the main persistent storage layer that's used. - `migrations/` - These tell sequelize how to build the SQL DB and its tables. - `middleware/` - These run on every HTTP request you make to us, heh. - `controllers/` - This is where the most important back-end logic resides. These controllers are hit after the back-end router figures out what do to with an HTTP request. - `bot.js` - The Discord bot.

The rest is pretty self-explanatory, I'm open to putting more things here if needed.

## Technical features

I think it's kinda good in a bunch of ways, might have to add something meaningful here later.
