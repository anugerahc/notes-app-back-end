const ClientError = require('../../exceptions/ClientError');

class AuthenticationsHandler {
    constructor(authenticationsService, usersService, tokenManager, validator) {
        this._authenticationsService = authenticationsService;
        this._usersService = usersService;
        this._tokenManager = tokenManager;
        this._validator = validator;

        this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
        this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
        this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
    }

    async postAuthenticationHandler(request, h) {
        try {
            const dataValidated = this._validator.validatePostAuthenticationPayload(request.payload);
    
            const id = await this._usersService.verifyUserCredential(dataValidated.username, dataValidated.password);

            const accessToken = this._tokenManager.generateAccessToken({id});
            const refreshToken = this._tokenManager.generateRefreshToken({id});

            await this._authenticationsService.addRefreshToken(refreshToken);

            const response = h.response({
                status: 'success',
                message: 'Authentication berhasil ditambahkan',
                data: {
                    accessToken,
                    refreshToken,
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

    async putAuthenticationHandler(request, h) {
        try {
            const refreshTokenValidated = this._validator.validatePutAuthenticationPayload(request.payload);

            await this._authenticationsService.verifyRefreshToken(refreshTokenValidated.refreshToken);
            
            const {id} = this._tokenManager.verifyRefreshToken(refreshTokenValidated.refreshToken);

            const accessToken = this._tokenManager.generateRefreshToken({id});

            const response = h.response({
                status: 'success',
                message: 'Access Token berhasil diperbarui',
                data: {
                    accessToken,
                },
            });

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

    async deleteAuthenticationHandler(request, h) {
        try {
            const refreshTokenValidated = this._validator.validateDeleteAuthenticationPayload(request.payload);

            await this._authenticationsService.verifyRefreshToken(refreshTokenValidated.refreshToken);
            await this._authenticationsService.deleteRefreshToken(refreshTokenValidated.refreshToken);

            const response = h.response({
                status: 'success',
                message: 'Refresh token berhasil dihapus',
            });

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

module.exports = AuthenticationsHandler;
