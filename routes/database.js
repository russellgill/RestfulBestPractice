const { Sequelize: { Op } } = require('sequelize');
const router = require('express').Router();
const { Record } = require('../models');
const { sort_map } = require('../objects/maps');

const chalk = require('chalk');

let DEFAULT = 'CREATED_ON_DESC';

router.get('/records/:id?', async (req, res, next) => {
    console.log('List Endpoint Hit');
    let response = null;
    try {
        let id = req.params.id;
        if (!id){
            next();
            return;
        } else {
            let numeric_id = id.split(":").find((entry) => entry != 'id')
            let record = await Record.getOne({
                numeric_id,
            });
            if (!record) {
                response = {
                    record: null,
                    record_exists: false,
                    err: null,
                }
            } else {
                response = {
                    record,
                    record_exists: true,
                    err: null,
                }
            }
        }

        res.status(200).send(JSON.stringify(response));

    } catch (err) {
        console.log(err);
        res.status(500).send(JSON.stringify({
            record: null,
            record_exists: null,
            err: err.message
        }));
    }

});

router.get('/records', async (req, res) => {
    let response = null;
    console.log('Basic List Endpoint hit');

    try {
        let query = req.query;
        let offset = query.page;
        let limit = query.size; 
        let order = sort_map[query.order] || sort_map[DEFAULT];

        let records = await Record.getPage({
            offset,
            limit,
            order,
        });

        if (!records) {
            response = {
                record: null,
                record_exists: false,
                error: null,
            }
        } else {
            response = {
                record: records,
                record_exists: true,
                error: null,
            }
        }
        
        res.status(200).send(JSON.stringify(response));

    } catch (err) {
        console.log(err);
        res.status(500).send(JSON.stringify({
            record: null,
            record_exists: null,
            err: err.message,
        }));
    }
});

router.post('/upload', async (req, res) => {
    console.log('Upload Endpoint Hit');
    let response = null;
    res.set('Content-Type', 'application/json');
    try {
        let body = req.body;
        console.log(chalk.green(body.uid));

        let uid = body.uid;
        let content = body.content;
        let field_one = body.field_one;
        let field_two = body.field_two;

        let [ data, created ] = await Record.findOrCreateNew({
            uid, 
            content,
            field_one,
            field_two,
        });

        if (created) {
            response = {
                had_created: true,
                err: null,
                uid,
            };
        } else {
            response = {
                has_created: false,
                err: null,
                uid: data.unique_identifier,
            };
        }

        res.status(200).send(JSON.stringify(response));

    } catch (err) {
        console.log(err);
        res.status(500).send({
            has_created: false,
            err: err.message
        });
    }
});

module.exports = router;