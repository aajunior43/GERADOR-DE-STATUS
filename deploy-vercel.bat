@echo off
echo 🚀 Fazendo deploy no Vercel...
echo.

echo 📦 Instalando Vercel CLI...
npm install -g vercel

echo.
echo 🔧 Configurando projeto...
vercel --prod

echo.
echo ✅ Deploy concluído!
echo 📱 Agora configure o webhook na API WhatsApp com a URL fornecida pelo Vercel
echo.
pause