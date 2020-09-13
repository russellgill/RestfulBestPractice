const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(module.filename);

let db = new Object();
let sequelize = new Object();
//										\/ dId YoU KnOw GiThUb maKeS yOuR pAsSwOrD ShOw Up As *****?
sequelize = new Sequelize('postgres://terminal:hunter2@127.0.0.1:5432/development', { logging: false });

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

