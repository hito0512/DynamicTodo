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


def raw_entry_names(data):
    """直接解析 ZIP 原始字节里的条目名。

    zipfile 读出来的名字会把 "\\" 归一成 "/"，所以校验分隔符不能走 zipfile。
    """
    names = []
    for sig, name_len_offset, name_offset in (
        (b"PK\x03\x04", 26, 30),   # 本地文件头
        (b"PK\x01\x02", 28, 46),   # 中央目录
    ):
        index = 0
        while True:
            index = data.find(sig, index)
            if index < 0:
                break
            nlen = int.from_bytes(
                data[index + name_len_offset: index + name_len_offset + 2], "little"
            )
            name = data[index + name_offset: index + name_offset + nlen]
            # 长度合理且都是可见字符，才当作条目名（避免误把压缩数据当签名）
            if nlen and len(name) == nlen and all(b >= 0x20 for b in name):
                names.append(name)
            index += 4
    return names


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

    # 分隔符必须读原始字节判断：Python 的 zipfile 会自动把 "\\" 归一成 "/"，
    # 用 namelist() 检查反斜杠永远查不出来。
    raw = OUT.read_bytes()
    raw_names = raw_entry_names(raw)
    backslash = [n.decode("utf-8", "replace") for n in raw_names if b"\\" in n]
    if backslash:
        sys.exit("[错误] 以下 ZIP 条目含反斜杠: " + ", ".join(backslash))

    digest = hashlib.sha256(raw).hexdigest()
    print(f"打包完成: {OUT.name}")
    print(f"条目数: {len(names)}  解压后大小: {total_bytes} 字节")
    print(f"SHA-256: {digest}")
    print(f"分隔符校验: {len(raw_names)} 个原始条目名全部为 / ，无反斜杠")


if __name__ == "__main__":
    main()
