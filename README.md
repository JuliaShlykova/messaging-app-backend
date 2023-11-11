# MessageMe (backend segment)
## Description
This project is the part of the [TOP project: Odin-Book](https://www.theodinproject.com/lessons/nodejs-odin-book). This part represents backend which serves the [client segment](https://github.com/JuliaShlykova/in-tune-frontend).

**API services:**
- register and log in users with plain email and password
- log in users with their google accounts
- edit profile page and download avatars
- add users as friends
- create, delete and like posts
- create, delete and like comments
## Data Models
![Data model](data-models.svg)
## Authorisation
The user gets two tokens: access and refresh one. Refresh tokens is stored in HttpOnly cookie and will be sent with only specific request to refresh the access token. The access token has a shorted lifespan and is stored in the local storage.
## Technologies used
- NodeJS
- Express
- MongoDB database
- Mongoose
- jsonwebtoken
- passport
- imagekit