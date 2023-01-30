const ClientError = require('../../exceptions/ClientError');
const NotFoundError = require('../../exceptions/NotFoundError');

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

    postNoteHandler(request, h) {
        try {
            const noteValidated = this._validator.validateNotePayload(request.payload);

            const noteId = this._service.addNote(noteValidated);

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

    getNotesHandler(){
        const notes = this._service.getNotes();

        return {
            status: 'success',
            data: {
                notes,
            },
        };
    }

    getNoteByIdHandler(request, h){
        try {
            const {id} = request.params;
            const note = this._service.getNoteById(id);

            const response = h.response({
                status: 'success',
                data: {
                    note,
                },
            });
            response.code(200);
            return response;

        } catch (error) {
            if (error instanceof NotFoundError){
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

    putNoteByIdHandler(request, h){
        try {
            const noteValidated = this._validator.validateNotePayload(request.payload);
            const {id} = request.params;

            this._service.editNoteById(id, noteValidated);

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

    deleteNoteByIdHandler(request, h){
        try {
            const {id} = request.params;

            this._service.deleteNoteById(id);

            const response = h.response({
                status: 'success',
                message: 'Catatan berhasil dihapus',
            });
            response.code(200);
            return response;

        } catch (error) {
            if (error instanceof NotFoundError){
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
