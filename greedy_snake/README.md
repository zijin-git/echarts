# 贪吃蛇 · Greedy Snake

基于 Python 标准库的本地 Web 贪吃蛇小游戏。

详细需求见 [requirements.md](./requirements.md)。

## 本机路径

| 环境 | 路径 |
| --- | --- |
| Windows（目标） | `F:\pycode\greedy_snake` |
| 本仓库 | `greedy_snake/` |

可将本目录整体复制到 `F:\pycode\greedy_snake` 后按下方方式启动。

## 环境要求

- Python ≥ 3.8
- 现代浏览器（Chrome / Edge / Firefox）

无需安装第三方依赖（见 `requirements.txt`）。

## 启动

```bash
cd F:\pycode\greedy_snake
python server.py
```

浏览器访问：<http://127.0.0.1:8000/>

常用参数：

```bash
python server.py --port 8080
python server.py --no-browser
```

## 操作

| 按键 / 按钮 | 作用 |
| --- | --- |
| 方向键 / WASD | 转向 |
| 空格 /「开始」 | 开始 / 暂停 / 继续 |
| R /「重新开始」 | 重新开始 |

## 目录

```text
greedy_snake/
├── requirements.md
├── README.md
├── requirements.txt
├── server.py
└── static/
    ├── index.html
    ├── style.css
    └── game.js
```
