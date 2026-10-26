#!/usr/bin/env python3
"""Greedy Snake — local static file server (stdlib only)."""

from __future__ import annotations

import argparse
import functools
import http.server
import os
import socketserver
import sys
import webbrowser

HOST = "127.0.0.1"
PORT = 8000
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args) -> None:  # noqa: A003
        sys.stderr.write("%s - %s\n" % (self.address_string(), format % args))


def main() -> int:
    parser = argparse.ArgumentParser(description="启动贪吃蛇 Web 小游戏本地服务")
    parser.add_argument("--host", default=HOST, help="监听地址，默认 127.0.0.1")
    parser.add_argument("--port", type=int, default=PORT, help="监听端口，默认 8000")
    parser.add_argument(
        "--no-browser",
        action="store_true",
        help="启动后不自动打开浏览器",
    )
    args = parser.parse_args()

    if not os.path.isdir(ROOT):
        print("找不到 static 目录: %s" % ROOT, file=sys.stderr)
        return 1

    handler = functools.partial(QuietHandler, directory=ROOT)
    try:
        httpd = socketserver.ThreadingTCPServer((args.host, args.port), handler)
    except OSError as exc:
        print("无法绑定 %s:%s — %s" % (args.host, args.port, exc), file=sys.stderr)
        return 1

    httpd.allow_reuse_address = True
    url = "http://%s:%s/" % (args.host, args.port)
    print("贪吃蛇服务已启动: %s" % url)
    print("静态目录: %s" % ROOT)
    print("按 Ctrl+C 停止服务")

    if not args.no_browser:
        try:
            webbrowser.open(url)
        except Exception:
            pass

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n服务已停止")
    finally:
        httpd.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
