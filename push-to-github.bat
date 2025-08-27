@echo off
echo Enviando projeto para o GitHub...
git add .
git commit -m "Add new features: favorites, history and prompt demo"
git push origin master
echo Projeto enviado com sucesso!
pause
