# BIE-CMS

Migration flow:
git clone … && cd BIE-CMS
Copy all .env files
npm ci
npm run lib:build
npm run db:bootstrap - FIRST INSTALL ONLY
npm run db:migrate
npm run db:seed:admin - SEED ADMIN USER
npm run build:prod
npm run prod:ssr - starts both node servers, wrap in pm2 via npm
Configure nginx + TLS/HSTS on top, keeping ports 4000/4100 firewalled to localhost.
