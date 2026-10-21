@echo off
cd /d D:\555Wooork\studio-baikal
D:\dev-cache\blender\blender.exe -b --factory-startup --python scripts\hero-render\scene.py -- --out art/frames/phone --w 540 --h 960 --samples 64 --portrait > art\render-phone.log 2>&1
D:\dev-cache\blender\blender.exe -b --factory-startup --python scripts\hero-render\scene.py -- --out art/frames/tab --w 600 --h 800 --samples 64 --portrait > art\render-tab.log 2>&1
echo done > art\render-mobile-done.txt
