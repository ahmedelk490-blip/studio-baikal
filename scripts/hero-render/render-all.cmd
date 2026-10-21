@echo off
cd /d D:\555Wooork\studio-baikal
D:\dev-cache\blender\blender.exe -b --factory-startup --python scripts\hero-render\scene.py -- --out art/frames/desk --w 1280 --h 720 --samples 64 > art\render-desk.log 2>&1
D:\dev-cache\blender\blender.exe -b --factory-startup --python scripts\hero-render\scene.py -- --out art/frames/phone --w 540 --h 960 --samples 64 --portrait > art\render-phone.log 2>&1
echo done > art\render-done.txt
