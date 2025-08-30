@echo off
color 0b
:MENU
cls
echo ===============================
echo       GITHUB AUTO PANEL
echo ===============================
echo 1 - Commit & Push (main)
echo 2 - Status
echo 3 - Log dos ultimos commits
echo 4 - Sair
echo ===============================
set /p opc="Escolha uma opcao: "

if "%opc%"=="1" goto COMMIT
if "%opc%"=="2" goto STATUS
if "%opc%"=="3" goto LOG
if "%opc%"=="4" exit
goto MENU

:COMMIT
set /p msg="Mensagem do commit: "
git add .
git commit -m "%msg%"
git push origin main
pause
goto MENU

:STATUS
git status
pause
goto MENU

:LOG
git log --oneline -n 5
pause
goto MENU
