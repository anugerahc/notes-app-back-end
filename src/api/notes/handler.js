const ClientError = require('../../exceptions/ClientError');

class NotesHandler {
    constructor(service, validator){
        this._service = service;
        this._validator = validator;

        this.postNoteHandler = this.postNoteHandler.bind(this);
        this.getNotesHandler = this.getNotesHandler.bind(this);
        this.getNoteByIdHandler = this.getNoteByIdHandler.bind(this);
        this.putNoteByIdHandler = this.putNoteByIdHandler.bind(this);
        this.deleteNoteByIdHandler = this.deleteNoteByIdHandler.bind(this);
    }

    async postNoteHandler(request, h) {
        try {
            const noteValidated = this._validator.validateNotePayload(request.payload);

            const {id: credentialId} = request.auth.credentials;

            Object.assign(noteValidated, {owner: credentialId});

            const noteId = await this._service.addNote(noteValidated);

            const response = h.response({
                status: 'success',
                message: 'Catatan berhasil ditambahkan',
                data: {
                    noteId,
                },
            });
            response.code(201);
            return response;

        } catch (error) {
            if (error instanceof ClientError){
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statuscode);
                return response;
            }
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }

    async getNotesHandler(request, h){
        try {
            const {id: credentialId} = request.auth.credentials;

        const notes = await this._service.getNotes(credentialId);

        const response = h.response({
            status: 'success',
            data: {
                notes,
            },
        });
        response.code(200);
        return response;

        } catch (error) {
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }

    async getNoteByIdHandler(request, h){
        try {
            const {id} = request.params;

            const {id: credentialId} = request.auth.credentials;

            await this._service.verifyNoteAccess(id, credentialId);

            const note = await this._service.getNoteById(id);

            const response = h.response({
                status: 'success',
                data: {
                    note,
                },
            });
            response.code(200);
            return response;

        } catch (error) {
            if (error instanceof ClientError){
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statuscode);
                return response;
            }
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }

    async putNoteByIdHandler(request, h){
        try {
            const noteValidated = this._validator.validateNotePayload(request.payload);
            const {id} = request.params;

            const {id: credentialId} = request.auth.credentials;

            await this._service.verifyNoteAccess(id, credentialId);

            await this._service.editNoteById(id, noteValidated);

            const response = h.response({
                status: 'success',
                message: 'Catatan berhasil diperbarui',
            });
            response.code(200);
            return response;

        } catch (error) {
            if (error instanceof ClientError){
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statuscode);
                return response;
            }
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }

    async deleteNoteByIdHandler(request, h){
        try {
            const {id} = request.params;

            const {id: credentialId} = request.auth.credentials;

            await this._service.verifyNoteOwner(id, credentialId);

            await this._service.deleteNoteById(id);

            const response = h.response({
                status: 'success',
                message: 'Catatan berhasil dihapus',
            });
            response.code(200);
            return response;

        } catch (error) {
            if (error instanceof ClientError){
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statuscode);
                return response;
            }
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }
}

module.exports = NotesHandler;
