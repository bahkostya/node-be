RUN DEVELOPMENT VERSION
1. npm install
2. cp etc/config.json.sample etc/config.json. You can use your gmail acc for testing email sending but you'll neeed to set real email and password in config.
3. npm run nodemon
4. open http://localhost:8080/apidoc in browser


RUN PRODUCTION VERSION
1. npm install
2. cp etc/config.json.sample etc/config.json. Set SMTP options (or use local sendmail)
3. nmp start
