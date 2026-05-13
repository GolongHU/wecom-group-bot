const https = require('https');

const CORP_ID = 'ww2495c9000fdccc32';
const SECRET  = 'yi2NG5s5Mbx79YSOTJOuv6XKh8oF9Z060picBsCBLAo';

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });
}

function post(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname, path: u.pathname + u.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { chat_id, partner_name = '新伙伴' } = req.body;

  const { access_token } = await get(
    `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${CORP_ID}&corpsecret=${SECRET}`
  );

  const resp = await post(
    `https://qyapi.weixin.qq.com/cgi-bin/externalcontact/groupchat/add_join_way?access_token=${access_token}`,
    { scene: 1, remark: partner_name, auto_create_room: 0, chat_id_list: [chat_id] }
  );

  if (resp.errcode === 0) {
    res.json({ ok: true, qr_url: `https://work.weixin.qq.com/gm/${resp.config_id}` });
  } else {
    res.json({ ok: false, error: resp.errmsg });
  }
};
