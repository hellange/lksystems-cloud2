npm install
docker build -f Dockerfile-sql . -t lksystem-sql
docker build -f Dockerfile-webapp . -t lksystem-web-app
