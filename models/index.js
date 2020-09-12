const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(module.filename);

let db = new Object();
let sequelize = new Object();

sequelize = new Sequelize('sqlite::memory', { logging: false });

sequelize.authenticate().then(() => {
}).catch((err) => { 
    console.log('Failed to establish database connection')
    console.log(err);
    process.exit();
});


fs.readdirSync(__dirname)
	.filter(file =>  (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
	.forEach(file => {
		const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
		db[model.name] = model;
	});

Object.keys(db).forEach(modelName => {
	if (db[modelName].associate) {
		db[modelName].associate(db);
	}
});

db.Sequelize = Sequelize;
db.sequelize = sequelize;

module.exports = db;

