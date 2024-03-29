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

---

## Getting started locally (First time setup)

1.  Install node_modules and build the image<br>
    `npm install`<br>
    `npm run compose-up`<br>

## Installing new package (Needs image rebuild)

1.  Rebuild image<br>
    `npm install package_name --save`<br>
    `npm run compose-down`<br>
    `npm run compose-up`<br>

---

## Merge request conventions

1.  Always pull latest code before adding fixes/features<br>

2.  Follow standard conventions while creating upporting feature/fix branch.<br>

    #### Feature branch

    ```
    feature-<feature_name> (Example: feature-auth_implementation, feature-auth-implementation)
    ```

    #### Bug fix branch

    ```
    fix-<fix_name) (Example: fix-auth_token_expiration)
    ```

3.  Include explanatory title and description while creating merge request. <br>
    For a single commit change, description is not always necessary, but for larger changes, the description is a good way to concisely expand your title and/or commits a bit more.<br>

---

## Useful commands

### Run backend server locally (uses already built image)

`npm start`

### Stop running backend server

`npm run stop`

### Accessing docker bash shell

`npm run bash`

### Connect to Postgres in db client

`psql postgres://postgres@localhost:35432/spreadsyncdb`

---

## Docker short-hands

View running processes: `docker ps`<br>
Open bash shell with service name (node project (app) in our case): `docker-compose run app bash`<br>
Open bash shell with containerId: `docker exec -it 714afe6dbe01 bash`<br>
Building container and running app using docker compose: `docker-compose up`<br>
Stop and remove container and its volumes using docker compose: `docker-compose down`<br>
