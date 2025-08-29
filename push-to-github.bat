@echo off
echo Enviando projeto para o GitHub...
git add .
git commit -m "Update: Changed to use famous quotes and biblical verses in Portuguese BR instead of generating new content"
git push origin master
echo Projeto enviado com sucesso!
pause
