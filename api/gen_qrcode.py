import requests, json
from http.server import BaseHTTPRequestHandler

CORP_ID = "ww2495c9000fdccc32"
SECRET  = "yi2NG5s5Mbx79YSOTJOuv6XKh8oF9Z060picBsCBLAo"

def get_token():
    r = requests.get(f"https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid={CORP_ID}&corpsecret={SECRET}").json()
    return r["access_token"]

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length       = int(self.headers.get("Content-Length", 0))
        body         = json.loads(self.rfile.read(length))
        chat_id      = body.get("chat_id", "")
        partner_name = body.get("partner_name", "新伙伴")

        token = get_token()
        resp  = requests.post(
            f"https://qyapi.weixin.qq.com/cgi-bin/externalcontact/groupchat/add_join_way?access_token={token}",
            json={
                "scene": 1,
                "remark": partner_name,
                "auto_create_room": 0,
                "chat_id_list": [chat_id]
            }
        ).json()

        if resp.get("errcode") == 0:
            config_id = resp["config_id"]
            result = {"ok": True, "qr_url": f"https://work.weixin.qq.com/gm/{config_id}"}
        else:
            result = {"ok": False, "error": resp.get("errmsg")}

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def log_message(self, *args):
        pass
