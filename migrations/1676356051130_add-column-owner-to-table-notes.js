/* eslint-disable camelcase */

exports.up = (pgm) => {
    pgm.addColumn('notes', {
        owner: {
            type: 'varchar(50)',
        },
    });
};

exports.down = (pgm) => {
    pgm.dropColumn('notes', owner);
};
