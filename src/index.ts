import { AOEApi } from './aoe-api';
import { AOEBot } from './aoe-bot';

const { TELEGRAM_TOKEN = '' } = process.env;

const aoeApi = new AOEApi();
new AOEBot({ token: TELEGRAM_TOKEN, aoeApi });
console.log('AOE bot running');
