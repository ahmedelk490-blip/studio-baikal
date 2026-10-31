<?php
declare(strict_types=1);
/* Paths and the few site-wide constants. The database and uploads live in /data (not web-served, see .htaccess). */
const ROOT = __DIR__ . '/..';
const DATA_DIR = ROOT . '/data';
const DB_FILE = DATA_DIR . '/baikal.db';
const SITE_URL = 'https://baikalstudio.com';
const LANGS = ['en', 'ar'];
// project clips shown instead of the cover on their project pages
const PROJECT_VIDEO = [
  'el-nakhil-villa' => '/video/el-nakhil-villa.mp4', 'october-250' => '/video/october-250.mp4', 'tagamo3-115' => '/video/tagamo3-115.mp4',
  'mountain-view-zayed-80' => '/video/mountain-view-zayed-80.mp4', 'mountain-view-ivilla-235' => '/video/mountain-view-ivilla-235.mp4',
];
const HERO_VIDEO = ['mp4' => '/video/hero.mp4', 'mobile' => '/video/hero-720.mp4', 'poster' => '/video/hero-poster.webp'];
mb_internal_encoding('UTF-8');
date_default_timezone_set('Africa/Cairo');
error_reporting(E_ALL);
ini_set('display_errors', '0');
