@echo off
cd /d D:\555Wooork\studio-baikal
D:\dev-cache\blender\blender.exe -b --factory-startup --python scripts\hero-render\house.py -- --out art/frames/house --w 960 --h 720 --samples 64 > art\render-house.log 2>&1
D:\dev-cache\blender\blender.exe -b --factory-startup --python scripts\hero-render\scene.py -- --out art/frames/desk --w 1280 --h 720 --samples 80 > art\render-desk.log 2>&1
D:\dev-cache\blender\blender.exe -b --factory-startup --python scripts\hero-render\scene.py -- --out art/frames/tab --w 600 --h 800 --samples 80 --portrait > art\render-tab.log 2>&1
D:\dev-cache\blender\blender.exe -b --factory-startup --python scripts\hero-render\scene.py -- --out art/frames/phone --w 540 --h 960 --samples 80 --portrait > art\render-phone.log 2>&1
echo done > art\render-v2-done.txt
