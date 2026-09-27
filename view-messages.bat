@echo off
title Animora - View Contact Messages
echo ========================================================
echo             ANIMORA CONTACT MESSAGES
echo ========================================================
cd /d "%~dp0"
php backend/database/view_messages.php
echo.
pause
