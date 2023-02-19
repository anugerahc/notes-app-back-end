const {nanoid} = require('nanoid');
const {Pool} = require('pg');
const AuthorizartionError = require('../../exceptions/AuthorizartionError');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const QueryError = require('../../exceptions/QueryError');
const {mapDBToModel} = require('../../utils');

class NotesService {
    constructor(collaborationService) {
        this._pool = new Pool();
        this._collaborationService = collaborationService;
    }

    async verifyNoteAccess(noteId, userId){
        try {
            await this.verifyNoteOwner(noteId, userId);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }

            try {
                await this._collaborationService.verifyCollaboration(noteId, userId);
            } catch {
                throw error;
            }
        }
    }

    async verifyNoteOwner(id, owner){
        const query = {
            text: 'SELECT * FROM notes WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Catatan tidak ditemukan');
        }

        const note = result.rows[0];

        if (note.owner !== owner) {
            throw new AuthorizartionError('Anda tidak berhak mengakses resource ini');
        }
    }

    async addNote({title, body, tags, owner}){
        const id = nanoid(16);
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;

        const query = {
            text: 'INSERT INTO notes VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            values: [id, title, body, tags, createdAt, updatedAt, owner],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id){
            throw new InvariantError('Catatan Gagal Ditambahkan');
        }

        return result.rows[0].id;
    }

    async getNotes(owner){
        try {
            const query = {
                text: `SELECT notes.* FROM notes 
                LEFT JOIN collaborations on collaborations.note_id = notes.id 
                WHERE notes.owner = $1 OR collaborations.user_id = $1 
                GROUP BY notes.id`,
                values: [owner],
            };
    
            const result = await this._pool.query(query);
    
            return result.rows.map(mapDBToModel);
        } catch (error) {
            throw new QueryError(error.stack);
        }
    }

    async getNoteById(id){
        const query = {
            text: `SELECT notes.*, users.username FROM notes 
            LEFT JOIN users ON users.id = notes.owner
            WHERE notes.id = $1`,
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Catatan tidak ditemukan');
        }

        return result.rows.map(mapDBToModel)[0];
    }

    async editNoteById(id, {title, body, tags}){
        const updatedAt = new Date().toISOString();

        const query = {
            text: 'UPDATE notes SET title = $2, body = $3, tags = $4, updated_at = $5 WHERE id = $1 RETURNING id',
            values: [id, title, body, tags, updatedAt],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length){
            throw new NotFoundError('Gagal memperbarui catatan. Id tidak ditemukan');
        }
    }

    async deleteNoteById(id){
        const query = {
            text: 'DELETE FROM notes WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length){
            throw new NotFoundError('Catatan gagal dihapus. Id tidak ditemukan');
        }
    }
}

module.exports = NotesService;
