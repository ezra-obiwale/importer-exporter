const Sequelize = require('sequelize');
var db = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
});

const Tasks = db.define('tasks', {
    description: Sequelize.TEXT,
    completed: Sequelize.BOOLEAN
}, {
        underscored: true
    });

module.exports = Tasks;