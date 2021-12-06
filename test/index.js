/*
 * esyoil-api.js manual tests ...
 *
 * Author: MiGoller
 * 
 * Copyright (c) 2021 MiGoller
 */

"use strict";

const esyoilApi = require("../dist/index");

let credentials;

//  Getting your credentials ...
try {
    credentials = require("./credentials.json");
} catch (error) {
    if ((error.constructor === Error) && (error.code === "MODULE_NOT_FOUND")) {
        console.error("YOU HAVE TO SET YOU CREDENTIALS FIRST!");
        console.error("Copy the \"credentials-sample.json\" file and rename it to \"credentials.json\" before running any tests.");

        process.exit(1);
    }
    else {
        throw error;
    }
}

async function main() {
    //  Create a new API client with credentials
    const api = new esyoilApi.Client(credentials.username, credentials.password);

    //  Login first
    const dmy = await api.login();
    console.dir(dmy, {depth: null, colors: true});
}

main();
