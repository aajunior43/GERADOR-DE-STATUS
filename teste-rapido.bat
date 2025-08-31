@echo off
echo 🚀 Testando configuração WhatsApp...
echo.

echo 📡 Abrindo testes no navegador...
start http://localhost:3000/api/test-api
timeout /t 2 /nobreak >nul

start http://localhost:3000/config-whatsapp
timeout /t 2 /nobreak >nul

start http://localhost:3000/diagnostico
timeout /t 2 /nobreak >nul

echo.
echo ✅ Páginas de teste abertas!
echo 📋 Verifique se tudo está funcionando
echo.
pause