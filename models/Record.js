const { Op, where } = require("sequelize");
const chalk = require('chalk');

module.exports = (sequelize, { TEXT, BIGINT }) => {

    const schema = {
        unique_identifier: {
            type: BIGINT,
            allowNull: true,
        },
        content: {
            type: TEXT,
            allowNull: true,
        },
        field_one: {
            type: TEXT,
            allowNull: true,
        },
        field_two: {
            type: TEXT,
            allowNull: true
        }
    };
    
    const Record = sequelize.define('Record', schema);
    Record.associate = ({}) => {};
    
    Record.findOrCreateNew = function ({ uid, content, field_one, field_two }) {
        return this.findOrCreate({
            where: {
                unique_identifier: uid,
                content: content,
            },
            defaults: {
                field_one,
                field_two,
            }
        });
    }

    Record.getOne = function ({ id }) {
        return this.findOne({
            where:{
                unique_identifier:{
                    [Op.eq]: id,
                }
            }
        });
    }
    
    Record.getPage = function({where_statment, limit, offset, order}) {
        return this.findAll({
                ...where_statment,
                offset,
                limit,
                order,
            },
        )
    }

    
    return Record;
}