import { AOE } from './aoe';
import { AOEApi } from './aoe-api';
import { AOEBot } from './aoe-bot';

const { TELEGRAM_TOKEN = '' } = process.env;

const aoeApi = new AOEApi();
const aoe = new AOE({ aoeApi });
new AOEBot({ token: TELEGRAM_TOKEN, aoe });
console.log('AOE bot running');
