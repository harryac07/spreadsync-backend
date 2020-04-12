# Spreadsync
Development of sheet based sync application. The project will grow to sync different MA-CRM platforms in future.

## Goal

1. **Goal 1**<br>
SQL => Spreadsheet<br>
API => Spreadsheet<br>
Spreasheet => Spreadsheet<br>
Spreasheet => MA<br>
Spreasheet => CRM<br>

2. **Goal 2**<br>
MA => CRM<br>
CRM => MA<br>

***
## Getting started locally

1.  Build the image<br>
```docker-compose up```

2. Setup database migrations and seeds<br>
  ```docker-compose run app bash```<br>
  ```npm run migration:update```<br>
  ```npm run migration:seed```<br>

### Connect to Postgres in db client
```psql postgres://postgres@localhost:35432/spreadsyncdb```

***

### Docker short-hands

View running processes:  ```docker ps```<br>
Open bash shell with service name (node project (app) in our case):  ```docker-compose run app bash```<br>
Open bash shell with containerId:  ```docker exec -it 714afe6dbe01 bash```<br>
Building container and running app using docker compose: ```docker-compose up```<br>
Stop and remove container and its volumes using docker compose: ```docker-compose down```<br>
