/**
 * esyoil-api.js
 * 
 * Author: MiGoller
 * 
 * Copyright (c) 2021 MiGoller
 */

import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

//  Globally defined endpoints
const ENDPOINT = {
    USER: {
        "LOGIN": "https://api.esyoil.com/v1/auth/login"
    }
};

/**
 * Helper function to generate a GUID
 * @returns GUID
 */
function CreateGuid() {  
    function _p8(s?: boolean) {  
        const p = (Math.random().toString(16)+"000000000").substr(2,8);  
        return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;  
    }  
    return _p8() + _p8(true) + _p8(true) + _p8();  
}

/**
 * Helper function to encode string for application/x-www-form-urlencoded data
 * @param uriComponent 
 * @returns 
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function encodeURIComponentForm(uriComponent: any) {
    return encodeURIComponent(uriComponent).replace("%20", "+");
}

/**
 * Internel class for esyoil authentication information
 */
class Auth {
    tokenType: string | undefined = undefined;
    token: string | undefined = undefined;

    constructor(token?: string, tokenType?: string) {
        // this.token = token;
        // this.tokenType = tokenType;
        this.update(token, tokenType);
    }

    /**
     * Update authentication information
     * @param token The esyoil API authentication token.
     * @param tokenType The token type (e.g. "Bearer").
     */
    update(token?: string, tokenType?: string) {
        this.token = token;
        this.tokenType = tokenType;
    }

    /**
     * Reset the authentication information (on logout)
     */
    reset() {
        this.token = undefined;
        this.tokenType = undefined;
    }

    /**
     * Is the API client logged in?
     * @returns True, if there is a valid token.
     */
    isLoggedIn(): boolean {
        return (!(this.token === undefined));
    }
}

/**
 * esyoil API client
 */
export class Client {
    _username: string | undefined = undefined;
    _password: string | undefined = undefined;
    _deviceId: string | undefined = undefined;
    _auth = new Auth();

    constructor(username: string, password: string, deviceId?: string) {
        if (!username) throw new Error("USERNAME must not be empty!");
        if (!password) throw new Error("PASSWORD must not be empty!");

        this._username = username;
        this._password = password;

        if (deviceId) {
            this._deviceId = deviceId;
        }
        else {
            this._deviceId = CreateGuid();
        }
    }

    /**
     * Generates an AxiosRequestConfig with required headers, etc.
     * @param url The endpoint URL
     * @returns The request configuration
     */
    _getApiRequestConfig(url: string): AxiosRequestConfig {
        if (!url) throw new Error("URL is missing or empty!");
        if (!this._auth.isLoggedIn()) throw new Error("Not logged in. Please log in first.");

        return {
            url: url,
            headers: {
                "Authorization": `${this._auth.tokenType} ${this._auth.token}`
            },
            responseType: "json"
        }
    }

    /**
     * Performs an Axios request
     * @param requestConfig 
     * @returns 
     */
    async _apiRequest(requestConfig: AxiosRequestConfig): Promise<AxiosResponse> {
        if (!requestConfig) throw new Error("requestConfig is missing or empty!");
        try {
            return await axios.request(requestConfig);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            if (error.response) 
                throw new Error(`${error.response.status} - ${error.response.statusText}`);
            else
                throw error;
        }
    }

    /**
     * Login to the esyoil API with the stored credentials.
     * @returns The current Client-instance.
     */
    async login() {
        let response: AxiosResponse;
        
        this._auth.reset();

        try {
            response = await axios.request({
                url: ENDPOINT.USER.LOGIN,
                method: "POST",
                data: `email=${encodeURIComponentForm(this._username)}&password=${encodeURIComponentForm(this._password)}&device=${encodeURIComponentForm(this._deviceId)}`,
                headers: {
                    "Content-Type" : "application/x-www-form-urlencoded"
                },
                responseType: "json"
            });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) { 
            if (error.response) 
                throw new Error(`${error.response.status} - ${error.response.statusText}`);
            else
                throw error;
        }

        if (!response.data) throw new Error("Response data is missing.");

        if (response.data.data && response.data.data.token) {
            //  Update authentication informationen
            this._auth.update(response.data.data.token, "Bearer");

            return this;
        }
        else {
            //  Are there any errors?
            if (response.data.errors) {
                const firstError = response.data.errors[0];
                
                switch (firstError.status) {
                    case 401:
                        //  Unauthorized
                        throw new Error(`${firstError.title}: ${firstError.detail}`);
                        break;
                
                    default:
                        throw new Error(`${firstError.status} - ${firstError.title}: ${firstError.detail}`);
                        break;
                }
            }

            throw new Error("Unknown authentication error.");
        }
    }

    /**
     * Logout from esyoil API
     * @returns True, if logged out successfully
     */
    logout(): boolean {
        this._auth.reset();

        return true;
    }
}
