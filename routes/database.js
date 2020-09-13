const { Sequelize: { Op }, where } = require('sequelize');
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
    let where_statment = {};
    console.log('Basic List Endpoint hit');

    try {
        let query = req.query;
        let offset = query.page;
        let limit = query.size; 
        let filter = query.filter || null;
        let search = query.search || null;
        let filter_by = query.filter_by || null;
        let order = sort_map[query.order] || sort_map[DEFAULT];

        if (search){ 
            let query_listified = [];
            if (search.includes(" ")){
                query_listified = search.split(" ");
            } else {
                query_listified.push(search);
            }

            where_statment = {
                where: {
                    [Op.or]:{
                        content: {
                            [Op.iLike]: {
                                [Op.any]: [query_listified],
                            }
                        },
                        field_one: {
                            [Op.iLike]: {
                                [Op.any]: [query_listified],
                            }
                        },
                        field_two: {
                            [Op.iLike]: {
                                [Op.any]: [query_listified],
                            }
                        }
                    }
                },
            };
        }
        if (filter && filter_by) {
            switch(filter_by){
                case 'field_one':
                    where_statment.where.field_one = { 
                        [Op.eq]: filter,
                    };
                    break;
                case 'field_two':
                    where_statment.where.field_two = {
                        [Op.eq]: filter,
                    };
                    break;
            }
        } else if (filter_by && !filter) {
            throw new Error('Filteration fild specified, but no query provided.');
        } else if (filter && !filter_by){
            throw new Error('Filter query specified, but no filteration field provided.');
        }
        let records = await Record.getPage({
            where_statment,
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