const pool = require('./database');

const dbGetUser = (email) => pool.query(`SELECT * FROM users WHERE email = ?`, [ email ]);

const dbAddUser = (id, firstName, lastName, email, password) =>
  pool.query(`INSERT INTO users VALUES ($id, $firstName, $lastName, $email, $password)`, {
    $id: id,
    $firstName: firstName,
    $lastName: lastName,
    $email: email,
    $password: password
  });

const dbGetNewId = () => {
    const maxId = pool.query('SELECT MAX(id) FROM users GROUP BY id');
    if (!maxId) {
        return 1; //users table is empty, so the very first user id is 1
    } else{
        return maxId + 1; //next user id is 1 more than the biggest
    }
}

export { dbGetUser, dbAddUser, dbGetNewId };