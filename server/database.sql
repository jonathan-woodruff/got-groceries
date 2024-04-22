--create users table
CREATE TABLE users (
  user_id serial PRIMARY KEY,
  email varchar(255) unique not null,
  password varchar(255),
  created_at date default current_date,
  google_id varchar,
  started_list boolean,
  created_list boolean
);

--create meals table
CREATE TABLE meals (
  id serial PRIMARY KEY,
  name varchar(30) NOT NULL,
  user_id integer NOT NULL,
  in_grocery_list boolean,
  selected boolean
);

--create ingredients table
CREATE TABLE ingredients (
  id serial PRIMARY KEY,
  name varchar(30) NOT NULL,
  quantity integer NOT NULL,
  category varchar(20) NOT NULL,
  meal_id integer NOT NULL,
  in_grocery_list boolean,
  added_to_cart boolean
);