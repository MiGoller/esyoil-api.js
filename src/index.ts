/**
 * esyoil-api.js
 * 
 * Author: MiGoller
 * 
 * Copyright (c) 2021 MiGoller
 */

//  Third party libraries
import axios, { AxiosRequestConfig, AxiosResponse, Method } from "axios";

//  esyoil type definitions
import * as esyoil_types from "./esyoil_types";

//  Globally defined endpoints
const ENDPOINT = {
    USER: {
        "LOGIN": "https://api.esyoil.com/v1/auth/login",
        "ME": "https://api.esyoil.com/v1/auth/@me",
        "DELIVERY_ADDRESSES": "https://api.esyoil.com/v1/user/@me/delivery-addresses"
    },
    TANK: {
        "CURRENT": "https://api.esyoil.com/v1/tank/get",
        SOUNDING: {
            "ADD": "https://api.esyoil.com/v1/tank-sounding/add"
        }
    }
};

const MAX_RETRIES = 5;

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
    maxRetries: number = MAX_RETRIES;

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _getApiRequestConfig(url: string, method: Method = "GET", data?: any): AxiosRequestConfig {
        if (!url) throw new Error("URL is missing or empty!");
        if (!this._auth.isLoggedIn()) throw new Error("Not logged in. Please log in first.");

        const requestConfig: AxiosRequestConfig = {
            url: url,
            method: method,
            headers: {
                "Authorization": `${this._auth.tokenType} ${this._auth.token}`
            },
            responseType: "json"
        };

        if (!(data === undefined)) requestConfig.data = data;

        return requestConfig;
    }

    /**
     * Performs an Axios request
     * @param requestConfig 
     * @returns 
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async _apiRequest(requestConfig: AxiosRequestConfig): Promise<any> {
        if (!requestConfig) throw new Error("requestConfig is missing or empty!");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let data: any | undefined = undefined;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let lastError: any | undefined = undefined;
        let retryCounter = 0;

        while ((data === undefined) && (retryCounter < this.maxRetries)) {
            //  Increase retry-counter
            retryCounter++;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let response: any | undefined = undefined;

            try {
                //  Run the API request
                response = await axios.request(requestConfig);

                 //  Check Axios response
                if (response === undefined) {
                    //  Axios request failed to succeed but did not throw any error. Should never happen.
                    throw new Error("Axios request failed to succeed but did not throw any error. Should never happen.");
                }
                else {
                    // console.dir(response, {depth: null, colors: true});

                    //  Check response for errors
                    if (!response.errors) {
                        //  Axios returned no errors in response.
                        if (response.data) {
                            //  Response returned data object
        
                            if (response.data.data) {
                                //  Data found
                                data = response.data.data;
                            }
                            else throw new Error("Returned data is empty.");
                        }
                        else {
                            //  Data object missing.
                            throw new Error("Response data object is missing.");
                        }
                    }
                    else {
                        //  There are errors.
                        throw new Error(JSON.stringify(data.errors));
                    }
                }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                //  Parse and forward errors
                console.dir(error, {depth: null, colors: true});

                if (error.response) {
                    //  Axios request error
                    lastError = `${error.response.status} - ${error.response.statusText}`;
                }
                else {
                    //  Parser error
                    lastError = error.message;
                }
            }
        }

        if (data === undefined) {
            if (lastError === undefined) {
                throw new Error(`Finally failed to perform API request against ${requestConfig.url} with unknown error ...`);
            }
            else {
                throw new Error(lastError);
            }
        }

        return data;

        // try {
        //     return await axios.request(requestConfig);
        // // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // } catch (error: any) {
        //     if (error.response) 
        //         throw new Error(`${error.response.status} - ${error.response.statusText}`);
        //     else
        //         throw error;
        // }
    }

    /**
     * ========================================================================
     * ------------------------------------------------------------------------
     *                              USER API
     * ------------------------------------------------------------------------
     * ========================================================================
     */

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

    /**
     * Returns information about the logged in user.
     * @returns 
     */
    async getMe(): Promise<esyoil_types.Me> {
        const response = await this._apiRequest(this._getApiRequestConfig(ENDPOINT.USER.ME));
        return new esyoil_types.Me(response);
    }

    /**
     * Returns all delivery addresses for the logged in user.
     * @returns Array of delivery addresses
     */
    async getDeliveryAddresses(): Promise<Array<esyoil_types.DeliveryAddress>> {
        const response = await this._apiRequest(this._getApiRequestConfig(ENDPOINT.USER.DELIVERY_ADDRESSES));

        const data = new Array<esyoil_types.DeliveryAddress>();

        for (let index = 0; index < response.length; index++) {
            data.push(new esyoil_types.DeliveryAddress(response[index]));
        }

        return data;
    }

    /**
     * ========================================================================
     * ------------------------------------------------------------------------
     *                              TANK API
     * ------------------------------------------------------------------------
     * ========================================================================
     */

    /**
     * Get details about your tank inc. its current sounding.
     * @returns 
     */
    async getTank() {
        const response = await this._apiRequest(this._getApiRequestConfig(ENDPOINT.TANK.CURRENT));

        return new esyoil_types.Tank(response);
    }

    /**
     * Add a sounding or filling event with a full set of features.
     * @param date 
     * @param volume 
     * @param height 
     * @param price 
     * @param isFilling 
     * @param overwrite 
     * @returns 
     */
    async addRawSounding(date?: Date, volume?: number, height?:number, price?: number, isFilling = false, overwrite = false): Promise<Array<esyoil_types.SoundingEvent>> {

        if ((volume === undefined) && (height === undefined)) throw new Error("You must set VOLUME or HEIGHT!");

        if (!(volume === undefined) && !(height === undefined)) throw new Error("You must either set VOLUME or HEIGHT, but not BOTH!");

        let formData = `date=${encodeURIComponentForm(date === undefined ? new Date().toUTCString() : date.toUTCString())}`;

        formData = formData.concat("&volume=", encodeURIComponentForm(volume === undefined ? "null" : `${volume}`));
        formData = formData.concat("&height=", encodeURIComponentForm(height === undefined ? "null" : `${height}`));
        formData = formData.concat("&price=", encodeURIComponentForm(price === undefined ? "null" : `${price}`));
        formData = formData.concat("&is-filling=", encodeURIComponentForm(isFilling === undefined ? "null" : (isFilling ? "1" : "null")));
        formData = formData.concat("&overwrite=", encodeURIComponentForm(overwrite === undefined ? "false" : (overwrite ? "true" : "false")));

        const response = await this._apiRequest(
            this._getApiRequestConfig(
                ENDPOINT.TANK.SOUNDING.ADD, 
                "POST",
                formData
            )
        );

        const data = new Array<esyoil_types.SoundingEvent>();

        for (let index = 0; index < response.length; index++) {
            data.push(new esyoil_types.SoundingEvent(response[index]));
        }

        return data;
    }

    /**
     * Add a sounding event.
     * @param date Optional date for the event
     * @param volume Current oil volume in liters
     * @param height Current oil height in cm
     * @param overwrite Overwrite existing sounding events for the given date?
     * @returns 
     * 
     * @description You must set either volume OR height, but not both at the same time.
     */
    async addSounding(date?: Date, volume?: number, height?:number, overwrite = false): Promise<Array<esyoil_types.SoundingEvent>> {
        return await this.addRawSounding(date, volume, height, undefined, false, overwrite);
    }

    /**
     * Add a filling event.
     * @param date Optional date for the event
     * @param volume NEW oil volume in liters after filling
     * @param price Price for overall filling volume
     * @param height NEW oil height in cm after filling
     * @param overwrite Overwrite existing filling events for the given date?
     * @returns 
     */
    async addFilling(date?: Date, volume?: number, price?: number, height?:number, overwrite = false) {
        return await this.addRawSounding(date, volume, height, undefined, true, overwrite);
    }
}
