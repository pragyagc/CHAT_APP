/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateMessageDto } from '../models/CreateMessageDto';
import type { LoginRequest } from '../models/LoginRequest';
import type { RegisterRequest } from '../models/RegisterRequest';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ApiwebService {

    /**
     * @param requestBody 
     * @returns any OK
     * @throws ApiError
     */
    public static postAuthRegister(
requestBody: RegisterRequest,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/register',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param requestBody 
     * @returns any OK
     * @throws ApiError
     */
    public static postAuthLogin(
requestBody: LoginRequest,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param requestBody 
     * @returns any OK
     * @throws ApiError
     */
    public static postAuthAdminLogin(
requestBody: LoginRequest,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/admin/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getUsers(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users',
        });
    }

    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getUsersMe(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/me',
        });
    }

    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getAdminDashboard(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/dashboard',
        });
    }

    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getAdminUsers(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/users',
        });
    }

    /**
     * @param id 
     * @returns any OK
     * @throws ApiError
     */
    public static getAdminUsers1(
id: string,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/users/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id 
     * @returns any OK
     * @throws ApiError
     */
    public static deleteAdminUsers(
id: string,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/admin/users/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id 
     * @returns any OK
     * @throws ApiError
     */
    public static putAdminUsersBlock(
id: string,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/admin/users/{id}/block',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id 
     * @returns any OK
     * @throws ApiError
     */
    public static putAdminUsersUnblock(
id: string,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/admin/users/{id}/unblock',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getConversations(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/conversations',
        });
    }

    /**
     * @param otherUserId 
     * @returns any OK
     * @throws ApiError
     */
    public static postConversations(
otherUserId: string,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/conversations/{otherUserId}',
            path: {
                'otherUserId': otherUserId,
            },
        });
    }

    /**
     * @param requestBody 
     * @returns any OK
     * @throws ApiError
     */
    public static postMessages(
requestBody: CreateMessageDto,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/messages',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param conversationId 
     * @returns any OK
     * @throws ApiError
     */
    public static getMessagesConversation(
conversationId: string,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/messages/conversation/{conversationId}',
            path: {
                'conversationId': conversationId,
            },
        });
    }

}
