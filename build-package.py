#!/usr/bin/env python3
"""打包思源挂件 package.zip。

关键点：ZIP 条目名一律使用 "/" 分隔。
Windows 自带的 PowerShell Compress-Archive 会把目录分隔符写成 "\"，
导致集市分发包在部分平台（例如安卓端全新工作空间首次下载）解压出的
目录名非法，挂件无法还原。

用法：
    python build-package.py
"""

import hashlib
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "package.zip"

# 上架集市的必需文件与目录
ENTRIES = [
    "CHANGELOG.md",
    "LICENSE",
    "README.md",
    "icon.png",
    "index.html",
    "preview.png",
    "style.css",
    "widget.json",
    "img",
    "preview",
    "script",
    "static",
]

IGNORED_NAMES = {".DS_Store", "Thumbs.db", "desktop.ini"}


def collect_files():
    files = []
    for entry in ENTRIES:
        path = ROOT / entry
        if not path.exists():
            sys.exit(f"[错误] 缺少必需文件或目录: {entry}")
        if path.is_dir():
            for child in sorted(path.rglob("*")):
                if not child.is_file():
                    continue
                if child.name in IGNORED_NAMES or child.name.startswith("."):
                    continue
                files.append(child)
        else:
            files.append(path)
    return files


def main():
    files = collect_files()

    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as zf:
        for path in files:
            # as_posix() 保证不论在哪个平台打包，条目都用 "/" 分隔
            arcname = path.relative_to(ROOT).as_posix()
            zf.write(path, arcname)

    with zipfile.ZipFile(OUT) as zf:
        infos = zf.infolist()
        names = [i.filename for i in infos]

        backslash = [n for n in names if "\\" in n]
        if backslash:
            sys.exit("[错误] 以下 ZIP 条目含反斜杠: " + ", ".join(backslash))

        dirs = [n for n in names if n.endswith("/")]
        if dirs:
            sys.exit("[错误] 压缩包内出现目录条目: " + ", ".join(dirs))

        missing = [n for n in names if not (ROOT / n).is_file()]
        if missing:
            sys.exit("[错误] 条目在源目录中不存在: " + ", ".join(missing))

        duplicate = {n for n in names if names.count(n) > 1}
        if duplicate:
            sys.exit("[错误] 重复条目: " + ", ".join(sorted(duplicate)))

        total_bytes = sum(i.file_size for i in infos)

    digest = hashlib.sha256(OUT.read_bytes()).hexdigest()
    print(f"打包完成: {OUT.name}")
    print(f"条目数: {len(names)}  解压后大小: {total_bytes} 字节")
    print(f"SHA-256: {digest}")
    print("分隔符校验: 全部为 / ，无反斜杠条目")


if __name__ == "__main__":
    main()
