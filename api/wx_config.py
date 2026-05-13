import hashlib, time, random, string, requests, json
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

CORP_ID  = "ww2495c9000fdccc32"
SECRET   = "yi2NG5s5Mbx79YSOTJOuv6XKh8oF9Z060picBsCBLAo"
AGENT_ID = "1000002"

def get_token():
    r = requests.get(f"https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid={CORP_ID}&corpsecret={SECRET}").json()
    return r["access_token"]

def get_ticket(token, ticket_type="jsapi"):
    r = requests.get(f"https://qyapi.weixin.qq.com/cgi-bin/ticket/get?access_token={token}&type={ticket_type}").json()
    return r["ticket"]

def sign(ticket, nonce, ts, url):
    s = f"jsapi_ticket={ticket}&noncestr={nonce}&timestamp={ts}&url={url}"
    return hashlib.sha1(s.encode()).hexdigest()

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        qs  = parse_qs(urlparse(self.path).query)
        url = qs.get("url", [""])[0]

        token        = get_token()
        jsapi_ticket = get_ticket(token, "jsapi")
        agent_ticket = get_ticket(token, "agent_config")
        ts           = str(int(time.time()))
        nonce        = ''.join(random.choices(string.ascii_lowercase + string.digits, k=16))

        result = {
            "corp_id":         CORP_ID,
            "agent_id":        AGENT_ID,
            "timestamp":       ts,
            "nonce_str":       nonce,
            "signature":       sign(jsapi_ticket, nonce, ts, url),
            "agent_signature": sign(agent_ticket, nonce, ts, url),
        }

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())

    def log_message(self, *args):
        pass
