const app = require('express')();
const bodyParser = require('body-parser');
const models = require('./models');
const database = require('./routes/database');

const PORT = 3000;

app.use(bodyParser.json());
app.use('/application', database);

app.listen(PORT, async(err) => {

    try {
        if (!err){
            console.log('App Listener Established');
            await models.sequelize.sync();
            console.log('Database Connection Established');
        } else {
            console.log('Inner Error');
            throw err;
        }
    } catch (err) {
        console.log('Error');
        console.log(err);   
    }

});