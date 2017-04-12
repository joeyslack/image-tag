# Image tagger. Get hyped.
Tags images/videos using Clarifai (or Imagga), and saves them to a db.
### Serves JSON and HTML on output routes, to retrieve sorted results.

# How to use
1. Get an Imagga account: https://imagga.com/auth/signup/hacker (I've got a way to sign up lots of free accounts and rotate them to bypass api limits, but we'll cover that elsewhere)
2. Set up a postgres DB somewhere (AWS/Heroku/Whatever)
3. Create an .env file in root, and fill with the following params:

```
CLARIFAI_CLIENTID=KEY_GOES_HERE
CLARIFAI_SECRET=SECRET_GOES_HERE

IMAGGA_KEY=KEY_GOES_HERE
IMAGGA_SECRET=SECRET_GOES_HERE

PG_USER=root
PG_PASS=SECRET_GOES_HERE
PG_PATH=YOUR_FULL_DB_PATH_HERE:5432
PG_DATABASE=DATABASE_NAME
```

4. Run. node index.js

5. You're probably gonna have to hack around. But, basically, send a set of images in an http request to this service. Call indexClarifai(myImageObjects).

## What should your schema look like? There's a shema_dump.sql file you can check out. Modify to your needs.

# To run:
Well, it's a node app, duh, so... node index.js. Magic.
You'll have access to ```/search?q=searchterm``` and ```/searchJson?q=searchterm```

