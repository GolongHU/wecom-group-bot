const https = require('https');
const crypto = require('crypto');

const CORP_ID  = 'ww2495c9000fdccc32';
const SECRET   = 'yi2NG5s5Mbx79YSOTJOuv6XKh8oF9Z060picBsCBLAo';
const AGENT_ID = '1000002';

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });
}

function sign(ticket, nonce, ts, url) {
  const str = `jsapi_ticket=${ticket}&noncestr=${nonce}&timestamp=${ts}&url=${url}`;
  return crypto.createHash('sha1').update(str).digest('hex');
}

function nonce(n = 16) {
  return crypto.randomBytes(n).toString('hex').slice(0, n);
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const url = req.query.url || '';

  const { access_token } = await get(
    `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${CORP_ID}&corpsecret=${SECRET}`
  );
  const { ticket: jsapiTicket } = await get(
    `https://qyapi.weixin.qq.com/cgi-bin/ticket/get?access_token=${access_token}&type=jsapi`
  );
  const { ticket: agentTicket } = await get(
    `https://qyapi.weixin.qq.com/cgi-bin/ticket/get?access_token=${access_token}&type=agent_config`
  );

  const ts = String(Math.floor(Date.now() / 1000));
  const nc = nonce();

  res.json({
    corp_id:         CORP_ID,
    agent_id:        AGENT_ID,
    timestamp:       ts,
    nonce_str:       nc,
    signature:       sign(jsapiTicket, nc, ts, url),
    agent_signature: sign(agentTicket, nc, ts, url),
  });
};
