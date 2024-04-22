# Getting Started with Got Groceries

Got Groceries is an app you can use to create grocery lists.

It uses the PERN (PostgreSQL, Express, React, Node) stack.

## Run the project on your local computer

### Download all files

### Configure the .env

Look at server/src/constants/index.js to see a list of values you need to configure in your server/.env file.

The GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET you will get from console.cloud.google.com when you follow the workflow to set up an auth API for SSO authentication.

### Create database tables

![users table schema](/client/resources/users_schema.png)

![meals table schema](/client/resources/meals_schema.png)

![ingredients table schema](/client/resources/ingredients_schema.png)

### Run it

Use VSCode or something similar.

Open two terminals. 

In one terminal, cd to the server folder. 
* Type npm install to install all dependencies
* Launch the server by typing npm run dev

In the other terminal, cd to the client folder. 
* Type npm install to install all dependencies
* Launch the client by typing npm start

## Known shortcomings

I didn't make this app for commercial use. I made it to prove my skills to myself and to future employers. That's why I considered the following to be out of scope for this project:
* Email. It seemed like I would have to pay for an email service if I were to deploy this project to production using a PAAS like Render, and I am not willing to pay. Thus, perhaps the most glaring shortcoming is that anyone can sign up without confirming their email address, which means anyone can sign up using anyone else's email address. I was also unable to implement "forgot password" functionality due to the email restriction.
* Better load time. I'm sure I could figure out ways to optimize the initial load time of the app, but I simply didn't even begin researching that.
* Testing. This project does not feature any automated testing.
