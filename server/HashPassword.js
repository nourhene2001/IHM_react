const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const hashedPassword = bcrypt.hashSync('admin123', salt);
console.log(hashedPassword);